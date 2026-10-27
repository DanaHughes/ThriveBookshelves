# Curriculum tab: developer notes

This package adds a **Curriculum** tab to the Thrive admin dashboard. It sits between Classes and Apps in the sidebar. With it, Dana can:

- choose the workbooks on each grade's shelf (K to 8), including their order and the number of assignments per week;
- change one student's shelf: add a workbook just for them, or hide a grade workbook for them only;
- edit every workbook: title, subtitle, course, cover color, icon, badge, "extra" placement, buttons and links, and notes;
- edit the shared app logins (Lexia Core5, PowerUp, ALEKS, EIW), including where Clever instant-login links go;
- edit every other sentence on the student shelf (greeting, plan directions, buttons, counts);
- see which lines have read-aloud audio in her Piper voice and which are still waiting.

## Files

| File | What it is |
|---|---|
| `thrive-admin-curriculum.html` | The working tab. It runs on its own with sample data and saves to the browser. Move its `<style>`, the `<main>` contents, the drawer, modal and toast, and the `<script>` into the dashboard. |
| `curriculum-supabase-setup.sql` | Tables, row level security, the save function with a version check, and the `tts` storage bucket. Run it once. |
| `curriculum-supabase-adapter.js` | Connects the tab to Supabase. Load it before the tab script. |
| `tts_worker.py` | Makes the read-aloud MP3s. It must go in the Core5 project folder, because it uses that project's `gen_audio.py`, `pron.py`, `profiles.py` and `voices/`. |

## How the pieces fit

1. **Rules for who gets which books**
   - Each grade has a default shelf, stored in `grades[gradeId].books` (ordered workbook ids) and `grades[gradeId].days`.
   - Each student can change their shelf with `overrides[studentId] = { added: [...], hidden: [...] }`.
   - A student shows as custom when either list is non-empty. "Reset to grade default" deletes the student's row.
   - A change to a grade shelf reaches every student in that grade, except for books a student has hidden.
2. **Workbooks are shared library entries**
   - Editing one changes every shelf it is on, and the editor warns about this.
   - "Duplicate" makes a separate copy for a grade that needs a different version.
   - On first load, the sample data turns the current bookshelf's `coursesFor()` output into 30 library workbooks. Identical books become one entry, so Writing appears once for grades 3 to 8.
3. **The student shelf reads one function**
   - `window.ThriveCurriculum.resolveShelf(curriculum, student)` returns `{ days, courses: { la, math, explore }, daysFor(book) }`.
   - Each course has `shelf` (books in order) and `extra` (books the mascot holds).
   - Replace `coursesFor(grade)`, `languageArtsBooks`, `mathBooks` and `extraBooks` in the bookshelf with this function. The workbook fields match the ones the bookshelf already uses:
     - `title`, `subtitle`, `color`, `icon`, `badge`
     - `links` (was `items`)
     - `linkNote` (was `itemNote`)
     - `notes`
     - `placement: 'extra'` plus `extraLabel` (was `extra`)
   - A link is either `{ kind:'app', app:'core5' }`, which looks up `curriculum.apps`, or `{ kind:'link', label, desc, url }`.
   - Extras (Explore books, and books the mascot holds) have no weekly goal.
4. **Shelf text** lives in `curriculum.text`. Each bookshelf sentence maps to a key:

   | Key | Where it is in the current bookshelf code |
   |---|---|
   | `greeting` | `#helloTitle`, "Hi, {name}!" |
   | `courseLaName`, `courseLaKicker`, `courseMathName`, `courseMathKicker` | `coursesFor()` names and kickers |
   | `courseExploreName` | "Explore" in the sidebar and on the extras page |
   | `planTitle`, `planBody`, `planDoneTitle`, `planDoneBody`, `progress` | `planHtml()` |
   | `helper` | `helperHtml()` bubble |
   | `extraTag` | "EXTRA" tag |
   | `tidy` | "Put everything back" |
   | `finishButton`, `finishedButton`, `undoButton` | `#doneBtnLabel`, `.finish-label` |
   | `bookComplete` | `completeMsg()` |
   | `weekly`, `weeklyMet` | the `[data-week-goal]` line (`WEEKLY_GOAL` becomes the student's `daysFor(book)`) |

   - Fill-ins are `{name}`, `{days}`, `{done}`, `{total}`, `{goal}` and `{book}`.
   - `{days}` is written as a word ("three"). The editor will not save a sentence that is missing a fill-in it needs.

## Connecting it

1. Run `curriculum-supabase-setup.sql` in the Supabase SQL editor. Then make Dana an admin with the insert at the end of the file.
2. Load the adapter and set the backend before the tab script:

   ```html
   <script src="curriculum-supabase-adapter.js"></script>
   <script>
     window.THRIVE_CURRICULUM_BACKEND = createCurriculumBackend({
       supabase: window.thriveSupabase,
       loadRoster: async () => ({ students: [/* from People */], classes: [/* from Classes */] })
     });
   </script>
   ```

   - `loadRoster` must return `{ id, name, grade, classId }` for each student and `{ id, name }` for each class. The student `id` is the student's auth user id, because the student-shelf policy checks it.
   - The dashboard's People and Classes already hold this data. The adapter does not guess your table names.
3. **First run.** When the `curriculum` table is empty, the tab builds the sample curriculum from today's bookshelf and saves it. It uses the real roster from `loadRoster`.
4. **Saving**
   - Saves go through `save_curriculum()` with a version number.
   - If two admins edit at once, the second save is refused with "Someone else saved first. Reload the page." Nothing is overwritten.
   - Per-student changes go in `curriculum_student_shelf`. Students can read only their own row.
5. **Remove the sample tools** you don't want in production: the "Start over with sample data" button, and Export and Import. Export and Import are useful as backups, so consider keeping them.

## Version 2 changes (October 2026)

- **One shared starting curriculum.** `seed.js` holds the starting books, wording and app settings. It is inlined into both pages, so they can never drift apart. Saved data now carries `version: 2`. The Curriculum tab upgrades older saved data automatically, keeping the roster and any per-student changes. The bookshelf ignores version 1 data until the tab has upgraded it.
- **No brand names for students.** Each shared app has `vendor` (admins only), plus `name`, `button` and `login`, which are the only words students see. Lexia, ALEKS, IXL, Essentials in Writing, edclub, Snorkl and "Skill Builders" no longer appear anywhere on the student side. "Sign in with Clever" stays, because it tells students how to log in.
- **Strand titles.**
  - K to 1: Phonics and Word Study
  - 2 to 5: Reading and Word Study
  - 6 to 8: Reading and Vocabulary
- **Virtual learning days.**
  - Each workbook with weekly assignments has `schedule: [{ title, desc, link }]`. `link` is the index of one of the workbook's buttons, or `-1` for none.
  - `ThriveSeed.weekPlan(book, days)` makes one card per virtual learning day. If the schedule is shorter than the week, its last day repeats.
  - Reading follows the rotation: online reading lessons (Lexia Core5 for K to 5, Lexia PowerUp for 6 to 8), online reading lessons again, then the grade-level skill path (IXL).
  - Inside a workbook:
    - page 1: title, THIS WEEK explanation and the finish button
    - page 2: the cards (Today, Look ahead, Done)
    - page 3: notes
  - Which card is today comes from how many times the student has finished the book this week.
- **Shelf sizing.** On computers, the books shrink until every shelf fits on the screen (smallest width 96 px). Covers scale with the book width.
- **IXL link.** The IXL link is a placeholder (`https://www.ixl.com/signin`). Paste the real Clever instant-login link in the Curriculum tab, under any reading workbook, in Shared apps.
- **No "practice."** The word "practice" is not used anywhere students see.

## Version 3 changes

- **Mathematics:** every virtual learning day shows two buttons, online math lessons (MyPath) and the grade-level skill path (IXL). ALEKS and DreamBox are not used.
  - The MyPath link is a placeholder (`https://clever.com/login`) until the real link is pasted in the Curriculum tab.
- **Several buttons per day.** A day can show more than one button: `schedule[i].links` is a list of button positions. Older single-button days (`link`) are still read.
- **Upgrading saved data.** Version 2 data upgrades in place with `ThriveSeed.upgradeFrom2`. Only the starting Mathematics books are replaced; every other edit is kept.
- **Writing** is unchanged while it is on hold.

## Student apps tab

- **New tab.** The Curriculum tab has a **Student apps** tab, which lists every entry in `apps`. From it, admins can:
  - Edit all fields: `vendor` (admins only), `name`, `button`, `login`, `url`.
  - Add an app. The key is generated, like `app-xxxx`.
  - Swap an app for another in every workbook.
  - Remove an app.
- **Swap.** Swapping rewrites `workbooks[*].links`.
  - If a workbook already has the target app, the two buttons merge into one, and `schedule[i].links` positions are remapped.
  - The old app stays in `apps` until it is removed.
- **Remove.** An app can only be removed when no workbook uses it. The tab lists the workbooks that still use it.
  - When a starting app (one in `SEED_APPS`) is removed, its key is saved in `removedApps`. `upgrade()` then does not add it back on the next load.
  - Supabase stores this inside the same `curriculum` JSON, so no schema change is needed.
- **Brand-name warning.** The tab warns when the student-facing name, button or sign-in note contains the program name.
- **Bookshelf.** The bookshelf already reads any app key from `CUR.apps`, so no bookshelf change was needed.

## Prototype mode (no Supabase)

In the prototype, `thrive-wood-bookshelf.html` already reads the Curriculum tab:

- The tab saves its data in the browser under `thriveCurriculum:v1`.
- The bookshelf's "curriculum bridge" (section D2 in its script) reads the same key.
  - It builds each grade's shelves, the books' pages and every sentence from it.
  - It updates live through the browser's `storage` event.
- Without that key, the bookshelf uses its built-in lists.
- `?student=<id>` opens one student's shelf, with their hidden and added workbooks and their first name in the greeting.
- Both files must be on the same website (for example, the same GitHub Pages site). Browser storage is shared only within one site.

For production, replace `loadCurriculum()` in the bridge with a read of the `curriculum` row and the student's `curriculum_student_shelf` row. Nothing else in the bookshelf needs to change.

## Read-aloud audio

This follows the design kit rule: one voice always, Piper `en_US-hfc_female-medium` with Dana's production profile, and no device voice.

- **Queueing.** Every student-facing line gets a hash:
  - The hash is FNV-1a of `"hfc_female-production|" + text`, with whitespace collapsed. See `audioKey()` in the tab script.
  - When a line is new or changed, the tab adds a `queued` row to `tts_clips`.
  - Lines with fill-ins are split around them into separate clips. Names, the numbers 0 to 31 and the words "zero" to "seven" are queued too, so counts and the greeting use the same voice.
- **The worker**
  - `tts_worker.py` claims queued rows and renders them with the Core5 code:
    - `pron.phrase` for dictionary pronunciation and the glide fix;
    - `profiles.py` for the production profile;
    - `gen_audio` for the voice loader, pace, pause and MP3 filter.
  - It uploads each MP3 to the `tts` bucket at `hfc_female-production/<hash>.mp3` and marks the row `ready`.
  - Run it on any small always-on machine: `python3 tts_worker.py`. Or run it from cron: `python3 tts_worker.py --once`.
  - It needs `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as environment variables on that machine only.
  - Supabase Edge Functions run Deno, not Python, so they can't run this pipeline.
- **Unknown words are never guessed.** If `pron.py` doesn't know a word (a new student's last name, for example), the row is marked `failed` with the word named, and the Read-aloud audio tab shows it. Add the word to pron.py's extra words. Then press **Try again** next to the line in the Read-aloud audio tab, which sets the row back to `queued`.
- **Playback on the student shelf**
  - For each line on the page, look up its hash in `tts_clips` with `status = 'ready'` and play `public_url`.
  - If a line has no ready clip, hide its read-aloud button.
  - Do not fall back to `speechSynthesis`. The current bookshelf's Web Speech code (`readAloud`, `sayText`) should be switched to play these clips.
- **Licensing:** the voice's model card lists its training data under CC BY-NC-SA 4.0 (non-commercial). Dana is confirming whether that fits Thrive. The design kit records this.

## Tested

- **Browser (Chromium, 1440 px and 390 px):**
  - remove a workbook from a grade and undo it;
  - add one from the library;
  - change days per week;
  - edit a workbook, including the error for a bad web address and adding a button;
  - hide a workbook for one student and add one for them;
  - the preview shelves;
  - an error on a shelf-text fill-in;
  - saved data surviving a reload;
  - no horizontal scrolling on a phone;
  - no console errors.
- **Adapter, against an in-memory Supabase stand-in:**
  - first-run seeding;
  - version increments;
  - per-student rows written and deleted on reset;
  - a conflicting save refused;
  - queued clips not duplicated;
  - status read back into the tab.
- **Worker:**
  - renders MP3s at 22,050 Hz and 48 kbps, the same as the workbooks;
  - marks an unknown word as failed;
  - updates rows through a queue pass.
  - This was tested with stand-in `pron.py` and `profiles.py`, because the real ones are in the Core5 project.
- **Not tested:** a live Supabase project and the real `pron.py` and `profiles.py`.
