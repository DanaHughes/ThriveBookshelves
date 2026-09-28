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
