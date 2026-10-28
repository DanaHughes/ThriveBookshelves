/* =====================================================================
   Thrive curriculum: shared starting data (version 2)
   Used by BOTH the Curriculum tab and the student bookshelf, so the two
   always start from the same books and wording.
   Student-facing rules: no curriculum brand names (Lexia, ALEKS, IXL,
   Essentials in Writing, edclub) anywhere students see, and never the
   word "practice". Brand names live only in the admin-only `vendor` field.
   ===================================================================== */
(function () {
'use strict';
var VERSION = 3;
var GRADES = [
  { id:'k', n:0, label:'Kindergarten' }, { id:'1', n:1, label:'First Grade' }, { id:'2', n:2, label:'Second Grade' },
  { id:'3', n:3, label:'Third Grade' },  { id:'4', n:4, label:'Fourth Grade' }, { id:'5', n:5, label:'Fifth Grade' },
  { id:'6', n:6, label:'Sixth Grade' },  { id:'7', n:7, label:'Seventh Grade' }, { id:'8', n:8, label:'Eighth Grade' }
];

/* Every sentence on the student shelf that is not part of a workbook. */
var TEXT_FIELDS = [
  { group:'Today page', key:'greeting', label:'Greeting', where:'Top of the Today page.', tokens:['name'], def:'Hi, {name}!' },
  { group:'Today page', key:'courseLaName', label:'Language Arts course name', where:'Course card on Today, and the course shelf title.', def:'Language Arts' },
  { group:'Today page', key:'courseLaKicker', label:'Language Arts small label', where:'Small line above the course name on Today.', def:'Reading and Writing' },
  { group:'Today page', key:'courseMathName', label:'Mathematics course name', where:'Course card on Today, and the course shelf title.', def:'Mathematics' },
  { group:'Today page', key:'courseMathKicker', label:'Mathematics small label', where:'Small line above the course name on Today.', def:'Math' },
  { group:'Today page', key:'courseExploreName', label:'Extras page name', where:'Sidebar tab and the title of the extras page.', def:'Explore' },
  { group:'Course shelf', key:'planTitle', label:'Plan heading', where:'Top of every course shelf, before work is done.', def:'Today’s plan' },
  { group:'Course shelf', key:'planBody', label:'Plan directions', where:'Under the plan heading. {days} becomes the number of virtual learning days per week, written as a word.', tokens:['days'], def:'You will do one assignment per day, in each of your workbooks below, {days} days each week. Pick any {days} days that work for you, and do them in any order you like.', multi:true },
  { group:'Course shelf', key:'planDoneTitle', label:'Plan heading when finished', where:'Replaces the plan heading once every workbook is done for today.', def:'All of today’s assignments are complete!' },
  { group:'Course shelf', key:'planDoneBody', label:'Plan message when finished', where:'Under the finished heading.', def:'Great work. Come back on your next virtual learning day for your next assignments. If you want more today, visit Explore for extras.', multi:true },
  { group:'Course shelf', key:'progress', label:'Progress line', where:'Next to the progress bar.', tokens:['done','total'], def:'Today: {done} of {total} assignments complete' },
  { group:'Course shelf', key:'helper', label:'Mascot speech bubble', where:'Speech bubble by the mascot when the course has no extra workbook.', def:'Finish today’s assignments first. Then visit Explore for extras!', multi:true },
  { group:'Course shelf', key:'extraTag', label:'Extra tag', where:'Tag on the workbook the mascot is holding.', def:'EXTRA' },
  { group:'Course shelf', key:'tidy', label:'Tidy button', where:'Button that puts every book and plant back in place.', def:'Put everything back' },
  { group:'This week (inside a workbook)', key:'thisWeek', label:'This week heading', where:'Heading on the first page of every workbook with weekly assignments.', def:'THIS WEEK' },
  { group:'This week (inside a workbook)', key:'weekExplain', label:'How the week works', where:'Under the THIS WEEK heading. {days} becomes the number of virtual learning days, written as a word.', tokens:['days'], def:'Each week has {days} virtual learning days at home, plus your in-person days on campus. Do your virtual learning days in order, one per day, on any {days} days that work for you.', multi:true },
  { group:'This week (inside a workbook)', key:'dayLabel', label:'Card label under the number', where:'Under the big number on each card.', def:'Virtual learning day' },
  { group:'This week (inside a workbook)', key:'todayTag', label:'Today tag', where:'Tag on the card for today.', def:'Today' },
  { group:'This week (inside a workbook)', key:'lookAheadTag', label:'Look ahead tag', where:'Tag on cards for later this week.', def:'Look ahead' },
  { group:'This week (inside a workbook)', key:'notToday', label:'Not today label', where:'Bottom of look-ahead cards, where the button would be.', def:'Not today' },
  { group:'This week (inside a workbook)', key:'doneTag', label:'Done tag', where:'Tag on cards already finished this week.', def:'Done' },
  { group:'This week (inside a workbook)', key:'openAgain', label:'Open again button', where:'Button on today’s card after it is finished.', def:'Open again' },
  { group:'This week (inside a workbook)', key:'weekDone', label:'Week finished message', where:'Shown when every virtual learning day this week is done.', def:'You finished every virtual learning day this week. Great work!', multi:true },
  { group:'This week (inside a workbook)', key:'finishPrompt', label:'Finish line', where:'Next to the finish button at the bottom of the first page.', def:'When you finish today’s virtual learning day:' },
  { group:'Inside a workbook', key:'startHere', label:'Links heading (extras)', where:'Heading above the buttons in Explore extras.', def:'Start here' },
  { group:'Inside a workbook', key:'notesEyebrow', label:'Notes page small label', where:'Small line at the top of the notes page.', def:'About this book' },
  { group:'Inside a workbook', key:'notesTitle', label:'Notes page heading', where:'Heading on the notes page.', def:'Notes' },
  { group:'Inside a workbook', key:'finishButton', label:'Finish button', where:'Button a student presses after today’s assignment.', def:'I finished today’s assignment' },
  { group:'Inside a workbook', key:'finishedButton', label:'Finish button after pressing', where:'Same button once it is pressed.', def:'Complete (tap to undo)' },
  { group:'Inside a workbook', key:'undoButton', label:'Undo button', where:'Small undo button on the first page.', def:'Undo' },
  { group:'Inside a workbook', key:'bookComplete', label:'Workbook complete message', where:'Shown after finishing. {book} becomes the workbook title in lowercase.', tokens:['book'], def:'Today’s {book} assignments are complete.' },
  { group:'Inside a workbook', key:'weekly', label:'Weekly count', where:'Weekly line on the first page.', tokens:['done','goal'], def:'This week: {done} of {goal} virtual learning days' },
  { group:'Inside a workbook', key:'weeklyMet', label:'Weekly count when goal is met', where:'Replaces the weekly line once the goal is reached.', tokens:['done','goal'], def:'This week: {done} of {goal} virtual learning days (weekly goal met!)' }
];
var TEXT_DEFAULTS = {};
TEXT_FIELDS.forEach(function (f) { TEXT_DEFAULTS[f.key] = f.def; });

var L = {
  printingWb:'https://claude.ai/artifact/6FwRDaGR4GQdNPBWyDzx1s', morphGame:'https://claude.ai/artifact/Cp5gdsy6NE5Pct4m1VoCbn',
  selK2:'https://www.edclub.com/sportal/program-140.game', sel23:'https://www.edclub.com/library/elementary-sel-2',
  sel45:'https://www.edclub.com/library/elementary-sel-3', sel68:'https://www.edclub.com/library/middle-school-sel',
  vocab:{ 3:'https://www.edclub.com/sportal/program-85.game', 4:'https://www.edclub.com/sportal/program-91.game', 5:'https://www.edclub.com/sportal/program-99.game' },
  typing:{ 6:'https://www.edclub.com/sportal/program-111.game', 7:'https://www.edclub.com/sportal/program-120.game', 8:'https://www.edclub.com/sportal/program-122.game' },
  novel:{ 6:'https://danahughes.github.io/6th_novel_study_flipbook/', 7:'https://danahughes.github.io/7th_novel_study_flipbook/', 8:'https://danahughes.github.io/8th_novel_study_flipbook/' },
  hsFiction:'https://www.edclub.com/sportal/program-248.game', hsNonfiction:'https://www.edclub.com/library/vocabulary-high-school-narrative-nonfiction',
  hsPoetry:'https://www.edclub.com/sportal/program-305.game'
};
/* Shared app logins. `vendor` is for admins only; students see `name`, `button` and `login`. */
var SEED_APPS = {
  core5:   { vendor:'Lexia Core5',           name:'Online reading lessons', button:'Start today’s lessons',  url:'https://www.lexiacore5.com/?SiteID=7229-2300-5006-6748', login:'Sign in with Clever' },
  powerUp: { vendor:'Lexia PowerUp',         name:'Online reading lessons', button:'Start today’s lessons',  url:'https://www.lexiapowerup.com/', login:'Sign in with Clever' },
  ixl:     { vendor:'IXL',                   name:'Grade-level skill path', button:'Open your skill path',        url:'https://www.ixl.com/signin', login:'Sign in with Clever' },
  mypath:  { vendor:'MyPath',                name:'Online math lessons',    button:'Start today’s math lessons', url:'https://clever.com/login', login:'Sign in with Clever' },
  eiw:     { vendor:'Essentials in Writing', name:'Writing lessons',        button:'Start today’s lesson',   url:'https://members.essentialsinwriting.com/login/', login:'Use your own writing lesson login' }
};
var C = { reading:'#2f4a35', handwriting:'#6a4c33', writing:'#253a5c', novel:'#8a5a22', wordstudy:'#1f4a3c', math:'#6b2c27', sel:'#7d3a4a', vocab:'#3d5a45', typing:'#55633a' };
var MATH_SUB = {
  0:'Counting, Algebraic Thinking, Place Value, Measurement & Data, and Geometry', 1:'Counting, Algebraic Thinking, Place Value, Measurement & Data, and Geometry',
  2:'Algebraic Thinking, Place Value, Measurement & Data, and Geometry', 3:'Algebraic Thinking, Place Value, Fractions, Measurement & Data, and Geometry',
  4:'Algebraic Thinking, Place Value, Fractions, Measurement & Data, and Geometry', 5:'Algebraic Thinking, Place Value and Decimals, Fractions, Measurement & Data, and Geometry',
  6:'Ratios & Proportional Relationships, The Number System, Expressions & Equations, Geometry, and Statistics & Probability',
  7:'Ratios & Proportional Relationships, The Number System, Expressions & Equations, Geometry, and Statistics & Probability',
  8:'The Number System, Expressions & Equations, Functions, Geometry, and Statistics & Probability'
};
function app(key) { return { kind:'app', app:key }; }
function link(label, desc, url) { return { kind:'link', label:label, desc:desc, url:url }; }
// A virtual learning day: its card title, description, and which of the book's buttons it shows (by position).
function day(title, desc, links) { return { title:title, desc:desc, links:links }; }
function wb(o) { var b = { course:'la', placement:'shelf', extraLabel:'', badge:'', icon:'book', days:null, links:[], linkNote:'', notes:[], schedule:[] }; for (var k in o) b[k] = o[k]; return b; }
function same(n, d) { var out = []; for (var i = 0; i < n; i++) out.push({ title:d.title, desc:d.desc, links:d.links.slice() }); return out; }

var READ_DAY = day('Online reading lessons', 'Complete today’s online reading lessons until the program says you are done for the day.', [0]);
var SKILL_DAY = day('Grade-level skill path', 'Work through the next skills on your grade-level skill path.', [1]);

function seedBooksForGrade(n) {
  var G = GRADES[n].label, out = [];
  if (n <= 1) out.push(wb({ key:'reading', title:'Phonics and Word Study', color:C.reading, icon:'book',
    subtitle:'Letter Recognition, Phonics, Spelling, Vocabulary, Word Study, Comprehension, Grammar, and Fluency',
    links:[app('core5'), app('ixl')], schedule:[READ_DAY, READ_DAY, SKILL_DAY],
    notes:['Adaptive online reading lessons combined with grade-level exposure activities.', 'Second semester: grade-level skill activities may be added.', 'Your skill path day builds the skills for your grade.'] }));
  else if (n <= 5) out.push(wb({ key:'reading', title:'Reading and Word Study', color:C.reading, icon:'book',
    subtitle:'Phonics, Spelling, Vocabulary, Word Study, Comprehension, Grammar, and Fluency',
    links:[app('core5'), app('ixl')], schedule:[READ_DAY, READ_DAY, SKILL_DAY],
    notes: n === 2 ? ['Adaptive online reading lessons combined with grade-level exposure activities.', 'Second semester: grade-level skill activities may be added.', 'Your skill path day builds the skills for your grade.']
                   : ['Adaptive online reading lessons with matching skill activities.', 'Your skill path day builds the skills for your grade.'] }));
  else out.push(wb({ key:'reading', title:'Reading and Vocabulary', color:C.reading, icon:'book', subtitle:'Reading, Word Study, Comprehension, Grammar, and Vocabulary',
    links:[app('powerUp'), app('ixl')], schedule:[READ_DAY, READ_DAY, SKILL_DAY],
    notes:['Adaptive online reading lessons and grade-level exposure through grade-level activities.', 'Second semester: grade-level skill activities may be added.', 'Your skill path day builds the skills for your grade.'] }));
  var HW_DAY = day('Handwriting lesson', 'Complete the next pages in your handwriting workbook.', [0]);
  if (n <= 2) out.push(wb({ key:'handwriting', title:'Handwriting', color:C.handwriting, icon:'pencil', subtitle:'Manuscript Printing and Letter Formation',
    links:[link('Thrive Printing Interactive Workbook', 'Handwriting workbook', L.printingWb)], schedule:same(3, HW_DAY), notes:['Handwriting uses the Thrive Printing Interactive Workbook.'] }));
  else if (n <= 5) out.push(wb({ key:'handwriting', title:'Cursive', color:C.handwriting, icon:'pencil', badge:'Coming soon', subtitle:'Cursive Letter Formation and Connections',
    links:[link('Thrive Printing Interactive Workbook', 'Handwriting workbook', L.printingWb)], linkNote:'The Thrive cursive workbook is coming soon.', schedule:same(3, HW_DAY),
    notes:['Handwriting uses the Thrive Printing Interactive Workbook until the cursive workbook is ready.'] }));
  out.push(wb({ key:'writing', title:'Writing', color:C.writing, icon:'pen', subtitle: n <= 2 ? 'Composition and Sentence Formation' : 'Composition and Grammar',
    links:[app('eiw')], schedule:same(3, day('Writing lesson', 'Watch today’s writing lesson and complete the matching page in your writing workbook.', [0])),
    notes:['Writing and grammar use a video writing course and workbook.'] }));
  if (n >= 6) {
    out.push(wb({ key:'novel', title:'Novel Study', color:C.novel, icon:'bookmark', subtitle:'Student Book Choice Novel Study Using the Five Finger Rule',
      links:[link(G + ' Novel Study', 'Novel study flipbook', L.novel[n])], linkNote:'Get parent and teacher approval before you begin your novel.',
      schedule:same(3, day('Novel study', 'Read your novel and complete the next activity in your novel study.', [0])),
      notes:['Student book choice novel study using the five finger rule, with grade-level activities.', 'You must have parent and teacher approval before beginning the novel.'] }));
    out.push(wb({ key:'morphology', title:'Morphology', placement:'extra', extraLabel:'Optional Extras', color:C.wordstudy, icon:'puzzle',
      subtitle:'Root Words, Figurative Language, and Literary Analysis', links:[link('Thrive Morphology Game', 'Free Thrive word game', L.morphGame)],
      notes:['Morphology, figurative language, and literary analysis.'] }));
  }
  out.push(wb({ key:'math', course:'math', title:'Mathematics', color:C.math, icon:'math', subtitle:MATH_SUB[n], links:[app('mypath'), app('ixl')],
    // Every virtual learning day: online math lessons AND the grade-level skill path.
    schedule:same(3, day('Math lessons and skill path', 'Complete today’s online math lessons, then work on your grade-level skill path.', [0, 1])),
    notes:['Mathematics uses adaptive online math lessons and a grade-level skill path every virtual learning day.'] }));
  var sel = [];
  if (n <= 2) sel.push(link('Social-Emotional Learning, Grades K–2', 'Online course', L.selK2));
  if (n === 2 || n === 3) sel.push(link('Social-Emotional Learning, Grades 2–3', 'Online course', L.sel23));
  if (n === 4 || n === 5) sel.push(link('Social-Emotional Learning, Grades 4–5', 'Online course', L.sel45));
  if (n >= 6) sel.push(link('Social-Emotional Learning, Grades 6–8', 'Online course', L.sel68));
  out.push(wb({ key:'sel', course:'explore', title:'Social-Emotional Learning', color:C.sel, icon:'heart', subtitle:'Feelings, Friendships, and a Growth Mindset', links:sel, notes:['Optional: for students who finish early or want more.'] }));
  if (n >= 3 && n <= 5) out.push(wb({ key:'vocab', course:'explore', title:'Vocabulary', color:C.vocab, icon:'puzzle', subtitle:G + ' Vocabulary Course',
    links:[link(G + ' Vocabulary', 'Online course', L.vocab[n])], notes:['Optional: for students who finish early or want more.'] }));
  if (n >= 6) out.push(wb({ key:'typing', course:'explore', title:'Typing and Spelling', color:C.typing, icon:'keyboard', subtitle:'Typing Plus Extra Spelling and Vocabulary',
    links:[link(G + ' Typing', 'Online course', L.typing[n])], notes:['For fast finishers who want more.'] }));
  if (n >= 7) out.push(wb({ key:'hsvocab', course:'explore', title:'Advanced Vocabulary', color:C.vocab, icon:'puzzle', subtitle:'High School Level Vocabulary for Gifted 7th and 8th Graders',
    links:[link('High School Vocabulary: Fiction', 'Online course', L.hsFiction), link('High School Vocabulary: Narrative Nonfiction', 'Online course', L.hsNonfiction), link('High School Vocabulary: Poetry', 'Online course', L.hsPoetry)],
    notes:['For gifted 7th and 8th graders.'] }));
  return out;
}

function gradeRange(ns) {
  var s = Array.from(new Set(ns)).sort(function (a, b) { return a - b; });
  if (!s.length) return 'not on a shelf';
  var lab = function (n) { return n === 0 ? 'K' : String(n); };
  if (s.length === 1) return s[0] === 0 ? 'Kindergarten' : 'Grade ' + s[0];
  var runs = [];
  s.forEach(function (n) { var r = runs[runs.length - 1]; if (r && n === r[1] + 1) r[1] = n; else runs.push([n, n]); });
  return 'Grades ' + runs.map(function (r) { return r[0] === r[1] ? lab(r[0]) : lab(r[0]) + '–' + lab(r[1]); }).join(', ');
}

function buildSeed() {
  var workbooks = {}, grades = {}, byContent = new Map(), usedBy = {};
  GRADES.forEach(function (g) {
    grades[g.id] = { days:3, books:[] };
    seedBooksForGrade(g.n).forEach(function (b) {
      var key = b.key, content = {};
      for (var k in b) if (k !== 'key') content[k] = b[k];
      var sig = JSON.stringify(content), id = byContent.get(sig);
      if (!id) { id = key + '-' + g.id; byContent.set(sig, id); workbooks[id] = Object.assign({ id:id }, JSON.parse(sig)); usedBy[id] = []; }
      usedBy[id].push(g.n);
      grades[g.id].books.push(id);
    });
  });
  Object.keys(workbooks).forEach(function (id) { var w = workbooks[id]; w.adminLabel = w.title + ' · ' + gradeRange(usedBy[id]); });
  return {
    version:VERSION, workbooks:workbooks, grades:grades, apps:JSON.parse(JSON.stringify(SEED_APPS)), text:Object.assign({}, TEXT_DEFAULTS),
    classes:[ { id:'c-jessilee', name:'Jessilee’s class' }, { id:'c-nicole', name:'Nicole’s class' }, { id:'c-jessica', name:'Jessica’s class' } ],
    students:[
      { id:'s-isabell', name:'Isabell Dastrup', grade:'3', classId:'c-nicole' },
      { id:'s-olivia',  name:'Olivia Dastrup',  grade:'3', classId:'c-nicole' },
      { id:'s-terry',   name:'Terry Wolfram',   grade:'4', classId:'c-nicole' },
      { id:'s-dana',    name:'Dana Hughes',     grade:'7', classId:'c-nicole' }
    ],
    overrides:{}, audio:{}, updatedAt:new Date().toISOString()
  };
}

/* The cards a workbook shows for its week: one per virtual learning day.
   Days beyond the schedule repeat its last day; a book with no schedule uses its title and first button. */
function dayLinks(d) {
  if (Array.isArray(d.links)) return d.links.filter(function (x) { return typeof x === 'number' && x >= 0; });
  return typeof d.link === 'number' && d.link >= 0 ? [d.link] : [];   // older single-button days
}
function weekPlan(book, days) {
  var s = book.schedule || [], out = [];
  for (var i = 0; i < days; i++) {
    var d = s[i] || s[s.length - 1] || { title:book.title, desc:'', links:[0] };
    out.push({ title:d.title || book.title, desc:d.desc || '', links:dayLinks(d) });
  }
  return out;
}

/* Version 2 to 3: Mathematics becomes online math lessons plus the skill path every day.
   Everything else Dana edited is kept; only the starting Mathematics books are replaced. */
function upgradeFrom2(d) {
  var fresh = buildSeed();
  Object.keys(fresh.workbooks).forEach(function (id) { if (/^math-/.test(id)) d.workbooks[id] = fresh.workbooks[id]; });
  d.apps = d.apps || {};
  if (!d.apps.mypath) d.apps.mypath = JSON.parse(JSON.stringify(SEED_APPS.mypath));
  if (!d.apps.ixl) d.apps.ixl = JSON.parse(JSON.stringify(SEED_APPS.ixl));
  Object.keys(d.workbooks).forEach(function (id) {
    (d.workbooks[id].schedule || []).forEach(function (day) { day.links = dayLinks(day); delete day.link; });
  });
  d.version = VERSION;
  return d;
}

/* Older saved data (version 1) still carries brand names and no weekly schedule. */
function needsUpgrade(data) { return !data || !data.version || data.version < VERSION; }

window.ThriveSeed = { VERSION:VERSION, TEXT_FIELDS:TEXT_FIELDS, TEXT_DEFAULTS:TEXT_DEFAULTS, SEED_APPS:SEED_APPS,
  buildSeed:buildSeed, gradeRange:gradeRange, weekPlan:weekPlan, dayLinks:dayLinks, upgradeFrom2:upgradeFrom2, needsUpgrade:needsUpgrade };
})();
