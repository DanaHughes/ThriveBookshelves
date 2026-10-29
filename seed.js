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
var VERSION = 11;
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
  { group:'This week (inside a workbook)', key:'weekExplain', label:'How the week works', where:'Under the THIS WEEK heading. {days} becomes the number of virtual learning days, written as a word.', tokens:['days'], def:'Do one virtual learning day at a time, {days} days each week.', multi:true },
  { group:'This week (inside a workbook)', key:'weekExplainOne', label:'How the week works (once-a-week books)', where:'Under the THIS WEEK heading, in a book with one assignment a week, like Writing.', def:'One assignment each week, after your lesson.', multi:true },
  { group:'This week (inside a workbook)', key:'weekOf', label:'Later week heading', where:'Top of each page for a later week. {dates} becomes the dates, like Nov 2–6.', tokens:['dates'], def:'Week of {dates}' },
  { group:'This week (inside a workbook)', key:'cheers', label:'Picture page sayings', where:'One short line on each later week’s picture page. Put each saying on its own line; they take turns.', def:'Keep growing!\nEvery day counts.\nYou’ve got this!\nLittle steps, big growth.\nKeep reading, keep growing.\nYou are doing great!\nOne day at a time.\nProud of your hard work!', multi:true },
  { group:'This week (inside a workbook)', key:'breakNext', label:'Break coming note', where:'On the picture page of the week before a break. {break} becomes the break name, {date} the day school starts again.', tokens:['break','date'], def:'{break} is next week. See you {date}!' },
  { group:'This week (inside a workbook)', key:'newQuarter', label:'New quarter tag', where:'Tag on the picture page of the week a new quarter starts.', def:'New quarter!' },
  { group:'This week (inside a workbook)', key:'dayNumber', label:'Day name on each card', where:'Big words at the top of each card. {n} becomes the day number.', tokens:['n'], def:'Day {n}' },
  { group:'This week (inside a workbook)', key:'assignmentBtn', label:'Button name when a day has more than one', where:'On each button of a card with two or more buttons. {n} becomes 1, 2, and so on.', tokens:['n'], def:'Assignment {n}' },
  { group:'This week (inside a workbook)', key:'spendMinutes', label:'Time under a button', where:'Small words under a button that has minutes set. {minutes} becomes the number of minutes.', tokens:['minutes'], def:'Spend about {minutes} minutes' },
  { group:'This week (inside a workbook)', key:'dayLabel', label:'Card label under the number', where:'Under the big number on each card.', def:'Virtual learning day' },
  { group:'This week (inside a workbook)', key:'todayTag', label:'Today tag', where:'Tag on the card for today.', def:'Today' },
  { group:'This week (inside a workbook)', key:'lookAheadTag', label:'Look ahead tag', where:'Tag on cards for later this week.', def:'Look ahead' },
  { group:'This week (inside a workbook)', key:'notToday', label:'Not today label', where:'Bottom of look-ahead cards, where the button would be.', def:'Not today' },
  { group:'This week (inside a workbook)', key:'doneTag', label:'Done tag', where:'Tag on cards already finished this week.', def:'Done' },
  { group:'This week (inside a workbook)', key:'openAgain', label:'Open again button', where:'Button on today’s card after it is finished.', def:'Open again' },
  { group:'This week (inside a workbook)', key:'weekDone', label:'Week finished message', where:'Shown when every virtual learning day this week is done.', def:'You finished every virtual learning day this week. Great work!', multi:true },
  { group:'This week (inside a workbook)', key:'finishPrompt', label:'Finish line', where:'Above the finish button on the first page. Leave blank for none.', def:'' },
  { group:'Inside a workbook', key:'startHere', label:'Links heading (extras)', where:'Heading above the buttons in Explore extras.', def:'Start here' },
  { group:'Inside a workbook', key:'notesEyebrow', label:'Notes page small label', where:'Small line at the top of the notes page.', def:'About this book' },
  { group:'Inside a workbook', key:'notesTitle', label:'Notes page heading', where:'Heading on the notes page.', def:'Notes' },
  { group:'Inside a workbook', key:'finishButton', label:'Finish button', where:'Button a student presses after today’s assignment.', def:'I finished today’s assignment' },
  { group:'Inside a workbook', key:'finishedButton', label:'Finish button after pressing', where:'Same button once it is pressed.', def:'Complete (tap to undo)' },
  { group:'Inside a workbook', key:'undoButton', label:'Undo button', where:'Small undo button on the first page.', def:'Undo' },
  { group:'Inside a workbook', key:'bookComplete', label:'Workbook complete message', where:'Shown after finishing. {book} becomes the workbook title in lowercase.', tokens:['book'], def:'Today’s {book} assignments are complete.' },
  { group:'Inside a workbook', key:'weekly', label:'Weekly count', where:'Weekly line on the first page.', tokens:['done','goal'], def:'This week: {done} of {goal} virtual learning days' },
  { group:'Inside a workbook', key:'weeklyMet', label:'Weekly count when goal is met', where:'Replaces the weekly line once the goal is reached.', tokens:['done','goal'], def:'This week: {done} of {goal} virtual learning days (weekly goal met!)' },
  { group:'Inside a workbook', key:'weeklyOne', label:'Weekly line (once-a-week books)', where:'Weekly line in a book with one assignment a week, before it is done.', def:'This week: not done yet' },
  { group:'Inside a workbook', key:'weeklyOneMet', label:'Weekly line when done (once-a-week books)', where:'Replaces the line above once this week’s assignment is done.', def:'This week: done!' }
];
var TEXT_DEFAULTS = {};
TEXT_FIELDS.forEach(function (f) { TEXT_DEFAULTS[f.key] = f.def; });

var L = {
  printingWb:'https://danahughes.github.io/K-2-thrive-bookshelf/handwriting/', morphGame:'https://claude.ai/artifact/Cp5gdsy6NE5Pct4m1VoCbn',
  selK2:'https://www.edclub.com/sportal/program-140.game', sel23:'https://www.edclub.com/library/elementary-sel-2',
  sel45:'https://www.edclub.com/library/elementary-sel-3', sel68:'https://www.edclub.com/library/middle-school-sel',
  vocab:{ 3:'https://www.edclub.com/sportal/program-85.game', 4:'https://www.edclub.com/sportal/program-91.game', 5:'https://www.edclub.com/sportal/program-99.game' },
  typing:{ 6:'https://www.edclub.com/sportal/program-111.game', 7:'https://www.edclub.com/sportal/program-120.game', 8:'https://www.edclub.com/sportal/program-122.game' },
  cursive:'https://danahughes.github.io/3-5-thrive-bookshelf/cursive/',
  novel:{ 6:'https://danahughes.github.io/6-8-thrive-bookshelf/novel-study-6/', 7:'https://danahughes.github.io/6-8-thrive-bookshelf/novel-study-7/', 8:'https://danahughes.github.io/6-8-thrive-bookshelf/novel-study-8/' },
  hsFiction:'https://www.edclub.com/sportal/program-248.game', hsNonfiction:'https://www.edclub.com/library/vocabulary-high-school-narrative-nonfiction',
  hsPoetry:'https://www.edclub.com/sportal/program-305.game',
  // Thrive Writing Journal, one page per school week. {week} becomes this week's Monday (20261026), so the button opens this week's page.
  writingJournal:{ 0:'https://danahughes.github.io/K-2-thrive-bookshelf/writing/#w{week}', 1:'https://danahughes.github.io/K-2-thrive-bookshelf/writing/#w{week}', 2:'https://danahughes.github.io/K-2-thrive-bookshelf/writing/#w{week}', 3:'https://danahughes.github.io/3-5-thrive-bookshelf/writing/#w{week}', 4:'https://danahughes.github.io/3-5-thrive-bookshelf/writing/#w{week}', 5:'https://danahughes.github.io/3-5-thrive-bookshelf/writing/#w{week}', 6:'https://danahughes.github.io/6-8-thrive-bookshelf/writing/#w{week}', 7:'https://danahughes.github.io/6-8-thrive-bookshelf/writing/#w{week}', 8:'https://danahughes.github.io/6-8-thrive-bookshelf/writing/#w{week}' }
};
/* Shared app logins. `vendor` is for admins only; students see `name`, `button` and `login`. */
var SEED_APPS = {
  core5:   { vendor:'Lexia Core5',           name:'Online reading lessons', button:'Start today’s lessons',  url:'https://www.lexiacore5.com/?SiteID=7229-2300-5006-6748', login:'Click here' },
  powerUp: { vendor:'Lexia PowerUp',         name:'Online reading lessons', button:'Start today’s lessons',  url:'https://www.lexiapowerup.com/', login:'Click here' },
  ixl:     { vendor:'IXL',                   name:'Grade-level skill path', button:'Open your skill path',        url:'https://www.ixl.com/signin', login:'Click here' },
  mypath:  { vendor:'MyPath',                name:'Online math lessons',    button:'Start today’s math lessons', url:'https://clever.com/login', login:'Click here' }
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
// minutes (optional) maps a button's position to how long students should spend on it, like { 0:20, 1:10 }.
function day(title, desc, links, minutes) { var d = { title:title, desc:desc, links:links }; if (minutes) d.minutes = minutes; return d; }
function wb(o) { var b = { course:'la', placement:'shelf', extraLabel:'', badge:'', icon:'book', days:null, links:[], linkNote:'', notes:[], schedule:[] }; for (var k in o) b[k] = o[k]; return b; }
function same(n, d) { var out = []; for (var i = 0; i < n; i++) out.push(JSON.parse(JSON.stringify(d))); return out; }

// Every Language Arts day: both buttons (online reading lessons and the grade-level skill path) with minutes, in any order.
// The card has no title or directions, just the buttons.
var READ_MINUTES = [[15, 10], [20, 15], [25, 15], [25, 15], [25, 15], [25, 15], [25, 15], [25, 15], [25, 15]];   // [reading, skill path] by grade, K first
function readDays(n) {
  var m = READ_MINUTES[n];
  return same(3, day('', '', [0, 1], { 0:m[0], 1:m[1] }));
}
var SKILL_NOTE = 'Every virtual learning day: online reading lessons and your grade-level skill path, in any order.';

// Writing: one live writing lesson a week, then one Writing Journal page (graphic organizer + writing lines).
// One card a week. Grades without a journal yet show it as coming soon.
var WRITING_NOTES = ['One live writing lesson with your teacher each week.',
  'After the lesson: one writing page with a graphic organizer and writing lines, matched to grade-level writing standards.'];
function writingBook(n) {
  var url = L.writingJournal[n];
  // Grades 3-5 share their own book (its own id, so the 6-8 "Coming soon" book stays as it was).
  return wb({ key: n >= 6 ? 'writing68' : n >= 3 ? 'writing35' : 'writing', title:'Writing', color:C.writing, icon:'pen', days:1,
    subtitle: n <= 2 ? 'Graphic Organizers and Sentence Writing' : 'Graphic Organizers, Paragraphs, and Essays',
    badge: url ? '' : 'Coming soon',
    links: url ? [link('Writing', 'This week’s writing page', url)] : [],
    linkNote: url ? '' : 'Your writing pages are coming soon.',
    schedule:[day('Writing', url ? 'After your writing lesson, plan, write, and draw on this week’s writing page.'
                                        : 'After your writing lesson, finish the writing your teacher gives you.', url ? [0] : [])],
    notes:WRITING_NOTES });
}

function seedBooksForGrade(n) {
  var G = GRADES[n].label, out = [];
  if (n <= 1) out.push(wb({ key:'reading', title:'Phonics and Word Study', color:C.reading, icon:'book',
    subtitle:'Letter Recognition, Phonics, Spelling, Vocabulary, Word Study, Comprehension, Grammar, and Fluency',
    links:[app('core5'), app('ixl')], schedule:readDays(n),
    notes:['Adaptive online reading lessons combined with grade-level exposure activities.', 'Second semester: grade-level skill activities may be added.', SKILL_NOTE] }));
  else if (n <= 5) out.push(wb({ key:'reading', title:'Reading and Word Study', color:C.reading, icon:'book',
    subtitle:'Phonics, Spelling, Vocabulary, Word Study, Comprehension, Grammar, and Fluency',
    links:[app('core5'), app('ixl')], schedule:readDays(n),
    notes: n === 2 ? ['Adaptive online reading lessons combined with grade-level exposure activities.', 'Second semester: grade-level skill activities may be added.', SKILL_NOTE]
                   : ['Adaptive online reading lessons with matching skill activities.', SKILL_NOTE] }));
  else out.push(wb({ key:'reading', title:'Reading and Vocabulary', color:C.reading, icon:'book', subtitle:'Reading, Word Study, Comprehension, Grammar, and Vocabulary',
    links:[app('powerUp'), app('ixl')], schedule:readDays(n),
    notes:['Adaptive online reading lessons and grade-level exposure through grade-level activities.', 'Second semester: grade-level skill activities may be added.', SKILL_NOTE] }));
  var HW_DAY = day('Handwriting lesson', 'Complete the next pages in your handwriting workbook.', [0]);
  if (n <= 2) out.push(wb({ key:'handwriting', title:'Handwriting', color:C.handwriting, icon:'pencil', subtitle:'Manuscript Printing and Letter Formation',
    links:[link('Thrive Printing Interactive Workbook', 'Handwriting workbook', L.printingWb)], schedule:same(3, HW_DAY), notes:['Handwriting uses the Thrive Printing Interactive Workbook.'] }));
  // Cursive: on the Language Arts shelf in 3rd grade; optional in Explore for 2nd, 4th and 5th.
  else if (n === 3) out.push(wb({ key:'handwriting', title:'Cursive', color:C.handwriting, icon:'pencil', subtitle:'Cursive Letter Formation and Connections',
    links:[link('Thrive Cursive Workbook', 'Cursive workbook', L.cursive)],
    schedule:same(3, day('Cursive lesson', 'Trace and write the next letter in your cursive workbook.', [0])),
    notes:['Cursive uses the Thrive Cursive Workbook: one letter at a time, uppercase and lowercase.'] }));
  out.push(writingBook(n));
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
  if (n === 2 || n === 4 || n === 5) out.push(wb({ key:'cursive', course:'explore', title:'Cursive', color:C.handwriting, icon:'pencil',
    subtitle:'Cursive Letter Formation and Connections', links:[link('Thrive Cursive Workbook', 'Cursive workbook', L.cursive)],
    notes:['Optional: learn cursive one letter at a time, uppercase and lowercase.'] }));
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
    out.push({ title:typeof d.title === 'string' ? d.title : book.title, desc:d.desc || '', links:dayLinks(d), minutes:d.minutes || {} });   // a blank title stays blank
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
  return upgradeFrom3(d);
}

/* Version 3 to 4: the small words under app buttons say "Click here" instead of naming the sign-in service.
   Only the old wording is replaced, so anything Dana typed there herself is kept.
   Language Arts reading books that still have the old days (two reading days, then one skill path day) get
   the new daily reading + skill path cards with minutes for each grade. A reading book Dana changed is kept. */
var OLD_READ_DAYS = 'Online reading lessons|Online reading lessons|Grade-level skill path';
function upgradeFrom3(d) {
  Object.keys(d.apps || {}).forEach(function (k) { if (d.apps[k] && d.apps[k].login === 'Sign in with Clever') d.apps[k].login = 'Click here'; });
  var fresh = buildSeed(), old = {}, placed = {};
  Object.keys(d.workbooks || {}).forEach(function (id) {
    var w = d.workbooks[id];
    if (/^reading-/.test(id) && (w.schedule || []).map(function (x) { return x.title; }).join('|') === OLD_READ_DAYS) old[id] = true;
  });
  GRADES.forEach(function (g) {
    var shelf = d.grades && d.grades[g.id], freshId = fresh.grades[g.id].books.filter(function (id) { return /^reading-/.test(id); })[0];
    if (!shelf || !freshId) return;
    shelf.books = shelf.books.map(function (id) {
      if (!old[id]) return id;
      if (!placed[freshId] && (!d.workbooks[freshId] || old[freshId])) d.workbooks[freshId] = fresh.workbooks[freshId];
      placed[freshId] = true;
      return freshId;
    });
  });
  Object.keys(old).forEach(function (id) {   // old reading books no shelf or student uses any more
    if (placed[id]) return;
    var used = GRADES.some(function (g) { return d.grades[g.id] && d.grades[g.id].books.indexOf(id) >= 0; }) ||
      Object.keys(d.overrides || {}).some(function (s) { return (d.overrides[s].added || []).indexOf(id) >= 0; });
    if (!used) delete d.workbooks[id];
  });
  d.version = 4;
  return upgradeFrom4(d);
}

/* Version 4 to 5: Essentials in Writing is retired. Every Writing book becomes the new Writing book
   (one lesson a week, then the Thrive Writing Journal). Everything else Dana edited is kept. */
function upgradeFrom4(d) {
  var fresh = buildSeed(), oldIds = {};
  Object.keys(d.workbooks || {}).forEach(function (id) { if (/^writing-/.test(id)) oldIds[id] = true; });
  Object.keys(fresh.workbooks).forEach(function (id) { if (/^writing-/.test(id)) d.workbooks[id] = fresh.workbooks[id]; });
  GRADES.forEach(function (g) {
    var shelf = d.grades && d.grades[g.id], freshId = fresh.grades[g.id].books.filter(function (id) { return /^writing-/.test(id); })[0];
    if (!shelf || !freshId) return;
    shelf.books = shelf.books.map(function (id) { return oldIds[id] ? freshId : id; })
      .filter(function (id, i, a) { return a.indexOf(id) === i; });
  });
  Object.keys(d.overrides || {}).forEach(function (s) {
    var o = d.overrides[s];
    ['added', 'removed'].forEach(function (k) { if (Array.isArray(o[k])) o[k] = o[k].filter(function (id) { return !oldIds[id] || fresh.workbooks[id]; }); });
  });
  Object.keys(oldIds).forEach(function (id) { if (!fresh.workbooks[id]) delete d.workbooks[id]; });
  if (d.apps) delete d.apps.eiw;
  d.version = 5;
  return upgradeFrom5(d);
}

/* Version 5 to 6: the Writing book says "Writing", not "Writing journal", everywhere students see it.
   Only the old version 5 wording is replaced, so anything Dana typed herself is kept. */
var V5_WRITING = {
  'Writing journal':'Writing', 'My Writing Journal':'Writing', 'This week’s journal page':'This week’s writing page',
  'Your writing journal is coming soon.':'Your writing pages are coming soon.',
  'Graphic Organizers and Journal Writing':'Graphic Organizers and Sentence Writing',
  'After your writing lesson, plan, write, and draw on this week’s journal page.':'After your writing lesson, plan, write, and draw on this week’s writing page.',
  'After the lesson: one journal page with a graphic organizer and writing lines, matched to grade-level writing standards.':
    'After the lesson: one writing page with a graphic organizer and writing lines, matched to grade-level writing standards.'
};
function upgradeFrom5(d) {
  var swap = function (t) { return Object.prototype.hasOwnProperty.call(V5_WRITING, t) ? V5_WRITING[t] : t; };
  Object.keys(d.workbooks || {}).forEach(function (id) {
    if (!/^writing-/.test(id)) return;
    var w = d.workbooks[id];
    ['subtitle', 'linkNote'].forEach(function (k) { if (typeof w[k] === 'string') w[k] = swap(w[k]); });
    (w.links || []).forEach(function (l) { if (typeof l.label === 'string') l.label = swap(l.label); if (typeof l.desc === 'string') l.desc = swap(l.desc); });
    (w.schedule || []).forEach(function (x) { if (typeof x.title === 'string') x.title = swap(x.title); if (typeof x.desc === 'string') x.desc = swap(x.desc); });
    if (Array.isArray(w.notes)) w.notes = w.notes.map(swap);
  });
  d.version = 6;
  return upgradeFrom6(d);
}

/* Version 6 to 7: the Thrive Cursive Workbook is ready. 3rd grade's "Coming soon" Cursive book
   becomes the real one on the Language Arts shelf; 2nd, 4th and 5th grade get it in Explore
   (optional), and 4th and 5th lose the "Coming soon" book. Every other edit is kept. */
function upgradeFrom6(d) {
  var fresh = buildSeed(), oldIds = {};
  Object.keys(d.workbooks || {}).forEach(function (id) {
    var w = d.workbooks[id];
    if (/^handwriting-/.test(id) && w && w.title === 'Cursive') oldIds[id] = true;
  });
  var isCursive = function (id) { return /^cursive-/.test(id) || (/^handwriting-/.test(id) && fresh.workbooks[id].title === 'Cursive'); };
  Object.keys(fresh.workbooks).forEach(function (id) { if (isCursive(id)) d.workbooks[id] = fresh.workbooks[id]; });
  GRADES.forEach(function (g) {
    var shelf = d.grades && d.grades[g.id];
    if (!shelf || !Array.isArray(shelf.books)) return;
    var want = fresh.grades[g.id].books.filter(isCursive);
    var books = shelf.books.filter(function (id) { return !oldIds[id]; });
    want.forEach(function (id) {
      if (books.indexOf(id) >= 0) return;
      // the Language Arts book goes where the old one was; an Explore book goes last
      var at = shelf.books.findIndex(function (x) { return oldIds[x]; });
      if (/^handwriting-/.test(id) && at >= 0) books.splice(Math.min(at, books.length), 0, id); else books.push(id);
    });
    shelf.books = books;
  });
  Object.keys(d.overrides || {}).forEach(function (s) {
    var o = d.overrides[s];
    Object.keys(o).forEach(function (k) { if (Array.isArray(o[k])) o[k] = o[k].filter(function (id) { return !oldIds[id] || fresh.workbooks[id]; }); });
  });
  Object.keys(oldIds).forEach(function (id) { if (!fresh.workbooks[id]) delete d.workbooks[id]; });
  d.version = 7;
  return upgradeFrom7(d);
}

/* Version 7 to 8: the Printing workbook moved from a claude.ai link to its own GitHub page.
   Only links that still hold the old address change; everything else is kept. */
var OLD_PRINTING = 'https://claude.ai/artifact/6FwRDaGR4GQdNPBWyDzx1s';
function upgradeFrom7(d) {
  Object.keys(d.workbooks || {}).forEach(function (id) {
    (d.workbooks[id].links || []).forEach(function (l) { if (l && l.url === OLD_PRINTING) l.url = L.printingWb; });
  });
  d.version = 8;
  return upgradeFrom8(d);
}

/* Version 8 to 9: the Grades 3-5 Writing book is ready (danahughes.github.io/3-5-Writing).
   Grades 3, 4 and 5 swap their "Coming soon" Writing book for it; everything else is kept. */
function upgradeFrom8(d) {
  var fresh = buildSeed(), newId = fresh.grades['3'].books.filter(function (id) { return /^writing35-/.test(id); })[0];
  if (!newId) { d.version = VERSION; return d; }
  d.workbooks[newId] = fresh.workbooks[newId];
  ['3', '4', '5'].forEach(function (g) {
    var shelf = d.grades && d.grades[g];
    if (!shelf || !Array.isArray(shelf.books)) return;
    shelf.books = shelf.books.map(function (id) { return /^writing-/.test(id) ? newId : id; })
      .filter(function (id, i, a) { return a.indexOf(id) === i; });
  });
  d.version = 9;
  return upgradeFrom9(d);
}

/* Version 9 to 10: the Kindergarten Writing book is the Grades K to 2 book, so 1st and 2nd grade
   swap their "Coming soon" Writing book for it (the same book Kindergarten has). Everything else is kept. */
function upgradeFrom9(d) {
  var fresh = buildSeed(), kId = fresh.grades.k.books.filter(function (id) { return /^writing-/.test(id); })[0];
  if (kId && !d.workbooks[kId]) d.workbooks[kId] = fresh.workbooks[kId];
  ['1', '2'].forEach(function (g) {
    var shelf = d.grades && d.grades[g];
    if (!kId || !shelf || !Array.isArray(shelf.books)) return;
    shelf.books = shelf.books.map(function (id) { return /^writing-/.test(id) ? kId : id; })
      .filter(function (id, i, a) { return a.indexOf(id) === i; });
  });
  d.version = 10;
  return upgradeFrom10(d);
}

/* Version 10 to 11: the workbooks moved into grade-band repos (K-2, 3-5, 6-8), and Grades 6-8
   get their Writing book. Links that still hold an old address change; every other edit is kept. */
var MOVED = [
  ['writing/k/', 'https://danahughes.github.io/K-2-thrive-bookshelf/writing/'], ['https://danahughes.github.io/ThriveBookshelves/writing/k/', 'https://danahughes.github.io/K-2-thrive-bookshelf/writing/'],
  ['https://danahughes.github.io/printing-manuscript/', 'https://danahughes.github.io/K-2-thrive-bookshelf/handwriting/'],
  ['https://danahughes.github.io/cursive/', 'https://danahughes.github.io/3-5-thrive-bookshelf/cursive/'],
  ['https://danahughes.github.io/3-5-Writing/', 'https://danahughes.github.io/3-5-thrive-bookshelf/writing/'],
  ['https://danahughes.github.io/6th_novel_study_flipbook/', 'https://danahughes.github.io/6-8-thrive-bookshelf/novel-study-6/'],
  ['https://danahughes.github.io/7th_novel_study_flipbook/', 'https://danahughes.github.io/6-8-thrive-bookshelf/novel-study-7/'],
  ['https://danahughes.github.io/8th_novel_study_flipbook/', 'https://danahughes.github.io/6-8-thrive-bookshelf/novel-study-8/']
];
function upgradeFrom10(d) {
  Object.keys(d.workbooks || {}).forEach(function (id) {
    (d.workbooks[id].links || []).forEach(function (l) {
      if (!l || typeof l.url !== 'string') return;
      MOVED.forEach(function (m) { if (l.url.indexOf(m[0]) === 0) l.url = m[1] + l.url.slice(m[0].length); });
    });
  });
  var fresh = buildSeed(), newId = fresh.grades['6'].books.filter(function (id) { return /^writing68-/.test(id); })[0];
  if (newId) {
    d.workbooks[newId] = fresh.workbooks[newId];
    ['6', '7', '8'].forEach(function (g) {
      var shelf = d.grades && d.grades[g];
      if (!shelf || !Array.isArray(shelf.books)) return;
      shelf.books = shelf.books.map(function (id) { return /^writing-/.test(id) ? newId : id; })
        .filter(function (id, i, a) { return a.indexOf(id) === i; });
    });
  }
  d.version = VERSION;
  return d;
}

/* School calendar. Each workbook gets one page per school week, from this week to the end date.
   A week whose Monday falls inside a break is skipped. Dates are YYYY-MM-DD.
   From the Thrive Communities 2026–2027 school calendar (class days Aug 10 – May 28). */
var CALENDAR = {
  start: '2026-08-10', end: '2027-05-28',
  breaks: [
    { label:'September break', from:'2026-09-07', to:'2026-09-11' },
    { label:'Fall break',      from:'2026-10-19', to:'2026-10-23' },
    { label:'Thanksgiving',    from:'2026-11-23', to:'2026-11-27' },
    { label:'Winter break',    from:'2026-12-21', to:'2027-01-01' },
    { label:'Spring break',    from:'2027-03-22', to:'2027-03-26' }
  ],
  quarters: [
    { label:'Quarter 2', from:'2026-10-26' }, { label:'Quarter 3', from:'2027-01-18' }, { label:'Quarter 4', from:'2027-03-29' }
  ]
};
function parseDay(s) { var p = String(s).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }   // local date, no time zone shift
function dayKey(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
function mondayOf(d) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - (x.getDay() + 6) % 7); return x; }
// Mondays (as YYYY-MM-DD) of every school week from the week of `from` through the end date, skipping breaks.
function schoolWeeks(cal, from) {
  cal = cal || CALENDAR;
  var start = mondayOf(parseDay(cal.start)), first = mondayOf(from || new Date()), end = parseDay(cal.end), out = [];
  var d = first < start ? start : first;
  for (; d <= end && out.length < 60; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7)) {
    var off = (cal.breaks || []).some(function (b) { return d >= mondayOf(parseDay(b.from)) && d <= parseDay(b.to); });
    if (!off) out.push(dayKey(d));
  }
  return out;
}

/* Shelf text Dana never changed still holds an older default: swap it for today's shorter default.
   Text she typed herself is kept. Safe to run on every load. */
var RETIRED_TEXT = {
  weekExplain: ['Each week has {days} virtual learning days at home, plus your in-person days on campus. Do your virtual learning days in order, one per day, on any {days} days that work for you.'],
  finishPrompt: ['When you finish today’s virtual learning day:']
};
function refreshText(d) {
  if (!d || !d.text) return d;
  Object.keys(RETIRED_TEXT).forEach(function (k) { if (RETIRED_TEXT[k].indexOf(d.text[k]) >= 0) d.text[k] = TEXT_DEFAULTS[k]; });
  return d;
}

/* Older saved data (version 1) still carries brand names and no weekly schedule. */
function needsUpgrade(data) { return !data || !data.version || data.version < VERSION; }

window.ThriveSeed = { VERSION:VERSION, TEXT_FIELDS:TEXT_FIELDS, TEXT_DEFAULTS:TEXT_DEFAULTS, SEED_APPS:SEED_APPS,
  buildSeed:buildSeed, gradeRange:gradeRange, weekPlan:weekPlan, dayLinks:dayLinks, upgradeFrom2:upgradeFrom2, upgradeFrom3:upgradeFrom3, upgradeFrom4:upgradeFrom4, upgradeFrom5:upgradeFrom5, upgradeFrom6:upgradeFrom6, upgradeFrom7:upgradeFrom7, upgradeFrom8:upgradeFrom8, upgradeFrom9:upgradeFrom9, upgradeFrom10:upgradeFrom10, refreshText:refreshText, CALENDAR:CALENDAR, schoolWeeks:schoolWeeks, parseDay:parseDay, dayKey:dayKey, mondayOf:mondayOf, needsUpgrade:needsUpgrade };
})();
