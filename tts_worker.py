#!/usr/bin/env python3
"""
Read-aloud audio worker for the Curriculum tab.

Makes every queued line in Supabase's tts_clips table into an MP3 in Dana's
voice (Piper hfc_female, production profile), using the SAME code as the Core5
workbooks, so the dashboard and the workbooks sound identical:

  * pronunciation from pron.py (CMU Pronouncing Dictionary, glide fix),
  * voice settings from profiles.py (production profile),
  * pace, pauses and the MP3 clean-up filter from gen_audio.py.

A word missing from the pronunciation dictionary is never guessed: the line is
marked "failed" with the word named, so a person decides (add it to pron.py's
extra words, then press retry by setting the row back to queued).

Put this file in the Core5 project folder (next to gen_audio.py, pron.py,
profiles.py and voices/). It needs a server or computer that stays on.

    pip install piper-tts numpy supabase
    export SUPABASE_URL=https://xxxx.supabase.co
    export SUPABASE_SERVICE_ROLE_KEY=...        # server only, never in a web page
    python3 tts_worker.py                       # runs forever, checks every 10 s
    python3 tts_worker.py --once                # one pass, then exit (for a cron job)
    python3 tts_worker.py --say "Hi, Isabell!" --out test.mp3   # local test, no Supabase
"""

import argparse
import os
import subprocess
import sys
import tempfile
import time
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from piper import SynthesisConfig                      # noqa: E402
import gen_audio                                        # noqa: E402  (load, MP3_FILTER, SENT, WORD)
from profiles import BY_ID, PRODUCTION                  # noqa: E402
from pron import phrase                                 # noqa: E402

BUCKET = "tts"
PROFILE_ID = PRODUCTION
PROFILE_KEY = "hfc_female-production"   # must match VOICE_PROFILE in the Curriculum tab
BATCH = 20


def is_single_word(text):
    """Names, numbers and one-word labels are read at the slower word pace, like the workbooks."""
    return len(text.split()) == 1


def render_mp3(text, out_path):
    """Render one line to MP3. Returns a list of words the dictionary did not know."""
    prof = BY_ID[PROFILE_ID]
    voice = gen_audio.load(prof["model"])
    sentence_mode = not is_single_word(text)
    ipa, fallbacks = phrase(text, sentence_mode=sentence_mode, glide_fix=prof.get("glide_fix"))
    if fallbacks:
        return fallbacks

    scale = prof["length"] * (1.0 if sentence_mode else gen_audio.WORD / gen_audio.SENT)
    cfg = SynthesisConfig(length_scale=scale, noise_scale=0.60,
                          noise_w_scale=prof["noise_w"], speaker_id=prof["speaker"])
    sr = voice.config.sample_rate
    parts = []
    for sentence in [p for p in ipa.split(". ") if p.strip()]:
        if not sentence.endswith((".", "!", "?")):
            sentence += "."
        a = voice.phoneme_ids_to_audio(voice.phonemes_to_ids(list(sentence)), cfg)
        if a.dtype != np.int16:
            a = (np.clip(a, -1.0, 1.0) * 32767).astype(np.int16)
        parts.append(a)
        parts.append(np.zeros(int(sr * 0.18), dtype=np.int16))
    audio = np.concatenate(parts[:-1]) if len(parts) > 1 else parts[0]

    with tempfile.TemporaryDirectory() as tmp:
        wav_path = os.path.join(tmp, "line.wav")
        with wave.open(wav_path, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(sr)
            wf.writeframes(audio.tobytes())
        subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", wav_path,
                        "-ac", "1", "-ar", "22050", "-codec:a", "libmp3lame", "-b:a", "48k",
                        "-af", gen_audio.MP3_FILTER, out_path], check=True)
    return []


def client():
    from supabase import create_client
    url, key = os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise SystemExit("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.")
    return create_client(url, key)


def claim(sb, row):
    """Mark one queued row as rendering. Returns False if another worker took it first."""
    res = sb.table("tts_clips").update({"status": "rendering"}) \
        .eq("hash", row["hash"]).eq("status", "queued").execute()
    return bool(res.data)


def finish(sb, row_hash, **fields):
    fields["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    sb.table("tts_clips").update(fields).eq("hash", row_hash).execute()


def one_pass(sb):
    rows = sb.table("tts_clips").select("hash, text, profile").eq("status", "queued") \
        .limit(BATCH).execute().data or []
    done = 0
    for row in rows:
        if row.get("profile") and row["profile"] != PROFILE_KEY:
            finish(sb, row["hash"], status="failed", error=f"Unknown voice profile {row['profile']}")
            continue
        if not claim(sb, row):
            continue
        path = f"{PROFILE_KEY}/{row['hash']}.mp3"
        try:
            with tempfile.TemporaryDirectory() as tmp:
                mp3 = os.path.join(tmp, "clip.mp3")
                missing = render_mp3(row["text"], mp3)
                if missing:
                    finish(sb, row["hash"], status="failed",
                           error="Not in the pronunciation dictionary: " + ", ".join(missing))
                    print(f"needs a person: {row['text']!r} -> {missing}")
                    continue
                with open(mp3, "rb") as f:
                    sb.storage.from_(BUCKET).upload(path, f.read(),
                                                    {"content-type": "audio/mpeg", "upsert": "true"})
            url = sb.storage.from_(BUCKET).get_public_url(path)
            finish(sb, row["hash"], status="ready", storage_path=path, public_url=url, error=None)
            done += 1
            print(f"ready: {row['text']!r}")
        except Exception as exc:                        # keep going; the row shows the reason
            finish(sb, row["hash"], status="failed", error=str(exc)[:500])
            print(f"failed: {row['text']!r}: {exc}")
    return len(rows), done


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--once", action="store_true", help="one pass, then exit")
    ap.add_argument("--say", help="render this text locally (no Supabase)")
    ap.add_argument("--out", default="say.mp3")
    args = ap.parse_args()

    if args.say:
        missing = render_mp3(args.say, args.out)
        if missing:
            raise SystemExit("Not in the pronunciation dictionary: " + ", ".join(missing))
        print("wrote", args.out)
        return

    sb = client()
    while True:
        seen, done = one_pass(sb)
        if args.once:
            print(f"checked {seen}, made {done}")
            return
        if seen == 0:
            time.sleep(10)


if __name__ == "__main__":
    main()
