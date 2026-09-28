/* =====================================================================
   Supabase adapter for the Curriculum tab.

   Load this BEFORE the Curriculum tab script, after the dashboard has a
   signed-in Supabase client:

     <script src="curriculum-supabase-adapter.js"></script>
     <script>
       window.THRIVE_CURRICULUM_BACKEND = createCurriculumBackend({
         supabase: window.thriveSupabase,          // the dashboard's supabase-js v2 client
         loadRoster: async () => ({                // the dashboard's own People / Classes data
           students: [...],   // each { id: auth user id, name, grade: 'k' or '1' to '8', classId }
           classes:  [...]    // each { id, name }
         })
       });
     </script>

   Tables and policies: curriculum-supabase-setup.sql
   ===================================================================== */
(function () {
  'use strict';

  function createCurriculumBackend(opts) {
    const sb = opts.supabase;
    if (!sb || !sb.from) throw new Error('createCurriculumBackend needs a supabase-js v2 client');
    const loadRoster = opts.loadRoster || (async () => ({ students: [], classes: [] }));
    let version = 0;
    let knownStudentRows = new Set();
    let roster = null;

    const split = data => {
      const { students, classes, overrides, audio, ...content } = data;
      return { content, overrides: overrides || {} };
    };

    return {
      name: 'Supabase',
      get roster() { return roster; },

      async load() {
        const [doc, shelf, rosterData] = await Promise.all([
          sb.from('curriculum').select('content, version').eq('id', 'thrive').maybeSingle(),
          sb.from('curriculum_student_shelf').select('student_id, added, hidden'),
          loadRoster()
        ]);
        roster = rosterData;
        if (doc.error) throw doc.error;
        if (shelf.error) throw shelf.error;
        if (!doc.data) { version = 0; return null; }      // first run: the tab seeds and saves
        version = doc.data.version;
        const overrides = {};
        (shelf.data || []).forEach(r => { overrides[r.student_id] = { added: r.added || [], hidden: r.hidden || [] }; });
        knownStudentRows = new Set(Object.keys(overrides));
        return Object.assign({}, doc.data.content, {
          students: rosterData.students || [], classes: rosterData.classes || [], overrides, audio: {}
        });
      },

      async save(data) {
        const { content, overrides } = split(data);
        const res = await sb.rpc('save_curriculum', { p_content: content, p_expected_version: version });
        if (res.error) {
          if (/curriculum_changed/.test(res.error.message)) throw new Error('Someone else saved first. Reload the page.');
          throw new Error('Not saved: ' + res.error.message);
        }
        version = res.data;

        const rows = Object.entries(overrides)
          .filter(([, o]) => (o.added || []).length || (o.hidden || []).length)
          .map(([student_id, o]) => ({ student_id, added: o.added, hidden: o.hidden, updated_at: new Date().toISOString() }));
        if (rows.length) {
          const up = await sb.from('curriculum_student_shelf').upsert(rows, { onConflict: 'student_id' });
          if (up.error) throw new Error('Student changes not saved: ' + up.error.message);
        }
        const keep = new Set(rows.map(r => r.student_id));
        const gone = [...knownStudentRows].filter(id => !keep.has(id));   // "Reset to grade default"
        if (gone.length) {
          const del = await sb.from('curriculum_student_shelf').delete().in('student_id', gone);
          if (del.error) throw new Error('Student reset not saved: ' + del.error.message);
        }
        knownStudentRows = keep;
      },

      // New or changed words: add them to the render queue. Existing clips are left alone.
      async requestAudio(items) {
        for (let i = 0; i < items.length; i += 500) {
          const chunk = items.slice(i, i + 500).map(x => ({ hash: x.hash, text: x.text, profile: x.profile, status: 'queued' }));
          const r = await sb.from('tts_clips').upsert(chunk, { onConflict: 'hash', ignoreDuplicates: true });
          if (r.error) throw r.error;
        }
      },

      // After a word is added to pron.py, send a failed line back to the queue.
      async retryAudio(hash) {
        const r = await sb.from('tts_clips').update({ status: 'queued', error: null }).eq('hash', hash).eq('status', 'failed');
        if (r.error) throw r.error;
      },

      // { hash: { status, url, error } } for the hashes asked about.
      async audioStatus(hashes) {
        const out = {};
        for (let i = 0; i < hashes.length; i += 300) {
          const r = await sb.from('tts_clips').select('hash, status, public_url, error').in('hash', hashes.slice(i, i + 300));
          if (r.error) throw r.error;
          (r.data || []).forEach(c => { out[c.hash] = { status: c.status === 'rendering' ? 'queued' : c.status, url: c.public_url, error: c.error }; });
        }
        return out;
      }
    };
  }

  window.createCurriculumBackend = createCurriculumBackend;
})();
