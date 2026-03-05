
// Mission: Exposition — Vanilla JS SPA + Timer, Streak, JSON Bank

// =================== Storage ===================
const store = {
  key: 'me_game_state_v2',
  read() {
    try { return JSON.parse(localStorage.getItem(this.key)) || { playerName: '', points: 0, history: [], badges: [] }; } catch { return { playerName: '', points: 0, history: [], badges: [] }; }
  },
  write(data) { localStorage.setItem(this.key, JSON.stringify(data)); }
};
const state = store.read();

// =================== Bank Soal (Default + Fetch JSON) ===================
const defaultBank = {
  settings: { timer: { level1: 480, level2: 480, level3: 600, level4: 600 }, streakBonusPerBest: 3, timeBonusPer10s: 1 },
  level1: [
    { id: 'p1', text: 'Schools should provide wider access to technology for students. Access to devices and internet is essential in modern learning.', tag: 'Thesis' },
    { id: 'p2', text: 'Firstly, technology supports personalized learning so students can learn at their own pace using suitable resources.', tag: 'Arguments' },
    { id: 'p3', text: 'Moreover, digital tools expand collaboration and creativity through project-based tasks and online discussions.', tag: 'Arguments' },
    { id: 'p4', text: 'Therefore, increasing technology access at school will improve learning quality and prepare students for future jobs.', tag: 'Reiteration' }
  ],
  level2: [
    { id: 's1', text: 'Schools should extend library hours for students.', tag: 'Klaim' },
    { id: 's2', text: 'Many students cannot study at home due to limited space and distractions.', tag: 'Alasan' },
    { id: 's3', text: 'A survey of 200 students shows 67% prefer evening access to the library.', tag: 'Bukti' },
    { id: 's4', text: 'Longer hours support equal learning opportunities.', tag: 'Alasan' },
    { id: 's5', text: 'In 2025, school X reported a 15% rise in reading rates after extending hours.', tag: 'Bukti' }
  ],
  level3: [
    { id:'q1', text:'(Simple Present) Education __ a fundamental right.', choices:['is','was','will be'], answer:'is' },
    { id:'q2', text:'(Modal) Schools __ provide equal access to learning resources.', choices:['should','can','might'], answer:'should' },
    { id:'q3', text:'(Internal conjunction) __, providing devices supports personalized learning.', choices:['Moreover','However','Finally'], answer:'Moreover' },
    { id:'q4', text:'(Evaluative) It is __ that internet access improves research skills.', choices:['evident','rare','impossible'], answer:'evident' },
    { id:'q5', text:'(Simple Present) Technology use __ student collaboration.', choices:['supports','supported','has supported'], answer:'supports' }
  ]
};

let BANK = JSON.parse(JSON.stringify(defaultBank)); // will be merged with fetched data

async function loadBank(){
  try {
    const res = await fetch('bank_soal.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    // Merge shallowly
    BANK.settings = { ...defaultBank.settings, ...(data.settings||{}) };
    BANK.level1 = Array.isArray(data.level1) && data.level1.length ? data.level1 : defaultBank.level1;
    BANK.level2 = Array.isArray(data.level2) && data.level2.length ? data.level2 : defaultBank.level2;
    BANK.level3 = Array.isArray(data.level3) && data.level3.length ? data.level3 : defaultBank.level3;
    console.log('Bank soal dimuat dari JSON.', BANK);
  } catch (e) {
    console.warn('Gagal memuat bank_soal.json, gunakan default.', e);
  } finally {
    // Setelah bank siap, inisialisasi UI bila user sudah klik start
  }
}

loadBank();

// =================== Navigation & View Lifecycle ===================
const navButtons = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');
navButtons.forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.target)));

function showView(selector) {
  // stop timer on view change
  stopTimer();
  views.forEach(v => v.classList.remove('active'));
  document.querySelector(selector).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  onViewShown(selector);
}

function onViewShown(selector){
  switch(selector){
    case '#level1': initLevel1(); break;
    case '#level2': initLevel2(); break;
    case '#level3': initLevel3(); break;
    case '#level4': initLevel4(); break;
  }
}

// Start
const startBtn = document.getElementById('startBtn');
const playerNameInput = document.getElementById('playerName');
startBtn?.addEventListener('click', () => {
  state.playerName = playerNameInput.value?.trim() || state.playerName || 'Pemain';
  store.write(state);
  showView('#level1');
});

// =================== Timer Engine ===================
let timerId = null; let remaining = 0; let onTimerEnd = null; let currentTimerEl = null;

function startTimer(seconds, el, onEnd){
  stopTimer();
  remaining = seconds; onTimerEnd = onEnd; currentTimerEl = el; updateTimerUI();
  timerId = setInterval(() => {
    remaining--; updateTimerUI();
    if (remaining <= 0){ stopTimer(); onTimerEnd && onTimerEnd(); }
  }, 1000);
}
function stopTimer(){ if (timerId){ clearInterval(timerId); timerId = null; } }
function updateTimerUI(){
  if (!currentTimerEl) return;
  const mm = String(Math.floor(remaining/60)).padStart(2,'0');
  const ss = String(remaining%60).padStart(2,'0');
  currentTimerEl.textContent = `⏱ ${mm}:${ss}`;
  currentTimerEl.classList.remove('warn','danger');
  if (remaining <= 10) currentTimerEl.classList.add('danger');
  else if (remaining <= 30) currentTimerEl.classList.add('warn');
}

// Helper streak UI
function setStreakUI(el, cur, best){ el.textContent = `🔥 Streak: ${cur} | Best: ${best}`; }

// =================== Level 1 ===================
let L1_DATA = []; let l1StreakCur = 0, l1StreakBest = 0;
const l1Source = document.getElementById('l1-source');
const l1Feedback = document.getElementById('l1-feedback');
const l1Reset = document.getElementById('l1-reset');
const l1Check = document.getElementById('l1-check');
const l1TimerEl = document.getElementById('l1-timer');
const l1StreakEl = document.getElementById('l1-streak');

function initLevel1(){
  L1_DATA = [...BANK.level1];
  l1StreakCur = 0; l1StreakBest = 0; setStreakUI(l1StreakEl, l1StreakCur, l1StreakBest);
  renderL1();
  startTimer(BANK.settings.timer.level1, l1TimerEl, () => { l1Check?.click(); });
}

function renderL1() {
  l1Source.innerHTML = '';
  shuffle([...L1_DATA]).forEach(item => {
    const el = document.createElement('div');
    el.className = 'draggable';
    el.textContent = item.text;
    el.draggable = true;
    el.dataset.id = item.id;
    l1Source.appendChild(el);
  });
  document.querySelectorAll('#level1 .slot').forEach(z => z.innerHTML = '');
  l1Feedback.className = 'feedback'; l1Feedback.innerHTML='';
}

// Drag & Drop
let dragged = null;

document.addEventListener('dragstart', e => {
  if (e.target.classList.contains('draggable')) { dragged = e.target; e.target.classList.add('dragging'); }
});

document.addEventListener('dragend', e => { if (dragged) dragged.classList.remove('dragging'); dragged = null; });

document.querySelectorAll('.slot, #l1-source').forEach(zone => {
  zone.addEventListener('dragover', e => { e.preventDefault(); });
  zone.addEventListener('drop', e => { e.preventDefault(); if (dragged) zone.appendChild(dragged); });
});

l1Reset?.addEventListener('click', () => { l1StreakCur=0; setStreakUI(l1StreakEl, l1StreakCur, l1StreakBest); renderL1(); });

l1Check?.addEventListener('click', () => {
  let correct = 0, total = L1_DATA.length;
  const zoneMap = {
    Thesis: document.querySelector('.dropzone[data-zone="Thesis"] .slot'),
    Arguments: document.querySelector('.dropzone[data-zone="Arguments"] .slot'),
    Reiteration: document.querySelector('.dropzone[data-zone="Reiteration"] .slot')
  };
  const idToTag = Object.fromEntries(L1_DATA.map(x => [x.id, x.tag]));

  // streak dihitung berurutan saat evaluasi
  l1StreakCur = 0; let best = 0;
  Object.entries(zoneMap).forEach(([zone, slot]) => {
    [...slot.children].forEach(el => {
      const id = el.dataset.id; const ok = idToTag[id] === zone;
      el.style.borderColor = ok ? '#166534' : '#7f1d1d';
      if (ok){ correct++; l1StreakCur++; if (l1StreakCur>best) best=l1StreakCur; }
      else { l1StreakCur = 0; }
    });
  });
  l1StreakBest = Math.max(l1StreakBest, best); setStreakUI(l1StreakEl, l1StreakCur, l1StreakBest);

  const score = Math.round((correct / total) * 100);
  const bonus = l1StreakBest * (BANK.settings.streakBonusPerBest||3);
  showFeedback(l1Feedback, score >= 75, `Skor Level 1: <b>${score}</b>. Bonus Streak: <b>+${bonus}</b>. ${score>=75? 'Mantap! Struktur dikenali.' : 'Coba lagi ya. Perhatikan perbedaan Thesis/Arguments/Reiteration.'}`);
  recordScore(1, score, bonus);
});

// =================== Level 2 ===================
let L2_DATA = []; let l2StreakCur=0, l2StreakBest=0;
const L2_OPTIONS = ['Klaim','Alasan','Bukti'];
const l2List = document.getElementById('l2-list');
const l2Feedback = document.getElementById('l2-feedback');
const l2Reset = document.getElementById('l2-reset');
const l2Check = document.getElementById('l2-check');
const l2TimerEl = document.getElementById('l2-timer');
const l2StreakEl = document.getElementById('l2-streak');

function initLevel2(){
  L2_DATA = [...BANK.level2];
  l2StreakCur=0; l2StreakBest=0; setStreakUI(l2StreakEl, l2StreakCur, l2StreakBest);
  renderL2();
  startTimer(BANK.settings.timer.level2, l2TimerEl, () => { l2Check?.click(); });
}

function renderL2(){
  l2List.innerHTML='';
  shuffle([...L2_DATA]).forEach(item => {
    const row = document.createElement('div'); row.className='item';
    const span = document.createElement('span'); span.textContent=item.text; row.appendChild(span);
    const sel = document.createElement('select'); sel.dataset.id=item.id;
    sel.innerHTML = '<option value="">— pilih —</option>' + L2_OPTIONS.map(o => `<option>${o}</option>`).join('');
    row.appendChild(sel);
    l2List.appendChild(row);
  });
  l2Feedback.className='feedback'; l2Feedback.innerHTML='';
}

l2Reset?.addEventListener('click', () => { l2StreakCur=0; setStreakUI(l2StreakEl, l2StreakCur, l2StreakBest); renderL2(); });

l2Check?.addEventListener('click', () => {
  const map = Object.fromEntries(L2_DATA.map(x => [x.id,x.tag]));
  let correct=0, total=L2_DATA.length;
  l2StreakCur=0; let best=0;
  document.querySelectorAll('#l2-list select').forEach(sel => {
    const ok = sel.value === map[sel.dataset.id];
    sel.style.borderColor = ok ? '#166534' : '#7f1d1d';
    if (ok){ correct++; l2StreakCur++; if (l2StreakCur>best) best=l2StreakCur; } else { l2StreakCur=0; }
  });
  l2StreakBest = Math.max(l2StreakBest, best); setStreakUI(l2StreakEl, l2StreakCur, l2StreakBest);
  const score = Math.round((correct/total)*100);
  const bonus = l2StreakBest * (BANK.settings.streakBonusPerBest||3);
  showFeedback(l2Feedback, score>=75, `Skor Level 2: <b>${score}</b>. Bonus Streak: <b>+${bonus}</b>. ${score>=75? 'Analisis argumen sudah solid.' : 'Cek kembali mana klaim, alasan, dan bukti.'}`);
  recordScore(2, score, bonus);
});

// =================== Level 3 ===================
let L3_QUESTIONS=[]; let l3StreakCur=0, l3StreakBest=0;
const l3Quiz = document.getElementById('l3-quiz');
const l3Feedback = document.getElementById('l3-feedback');
const l3Reset = document.getElementById('l3-reset');
const l3Check = document.getElementById('l3-check');
const l3TimerEl = document.getElementById('l3-timer');
const l3StreakEl = document.getElementById('l3-streak');

function initLevel3(){
  L3_QUESTIONS = [...BANK.level3];
  l3StreakCur=0; l3StreakBest=0; setStreakUI(l3StreakEl, l3StreakCur, l3StreakBest);
  renderL3();
  startTimer(BANK.settings.timer.level3, l3TimerEl, () => { l3Check?.click(); });
}

function renderL3(){
  l3Quiz.innerHTML='';
  L3_QUESTIONS.forEach(q => {
    const box = document.createElement('div'); box.className='q';
    const p = document.createElement('div'); p.textContent = q.text; box.appendChild(p);
    const choices = document.createElement('div'); choices.className='choices';
    q.choices.forEach((c,i) => {
      const label = document.createElement('label');
      label.innerHTML = `<input type="radio" name="${q.id}" value="${c}"> ${c}`;
      choices.appendChild(label);
    });
    box.appendChild(choices); l3Quiz.appendChild(box);
  });
  l3Feedback.className='feedback'; l3Feedback.innerHTML='';
}

l3Reset?.addEventListener('click', () => { l3StreakCur=0; setStreakUI(l3StreakEl, l3StreakCur, l3StreakBest); renderL3(); });

l3Check?.addEventListener('click', () => {
  let correct=0, total=L3_QUESTIONS.length;
  l3StreakCur=0; let best=0;
  L3_QUESTIONS.forEach(q => {
    const chosen = (document.querySelector(`input[name="${q.id}"]:checked`)||{}).value;
    const ok = chosen === q.answer;
    if (ok){ correct++; l3StreakCur++; if (l3StreakCur>best) best=l3StreakCur; }
    else { l3StreakCur=0; }
  });
  l3StreakBest = Math.max(l3StreakBest, best); setStreakUI(l3StreakEl, l3StreakCur, l3StreakBest);
  const score = Math.round((correct/total)*100);
  const bonus = l3StreakBest * (BANK.settings.streakBonusPerBest||3);
  showFeedback(l3Feedback, score>=75, `Skor Level 3: <b>${score}</b>. Bonus Streak: <b>+${bonus}</b>. ${score>=75? 'Kebahasaan kamu mantap!' : 'Perkuat lagi modals, conjunction, dan simple present.'}`);
  recordScore(3, score, bonus);
});

// =================== Level 4 ===================
const l4Form = document.getElementById('l4-form');
const l4Feedback = document.getElementById('l4-feedback');
const l4Reset = document.getElementById('l4-reset');
const l4Check = document.getElementById('l4-check');
const l4Export = document.getElementById('l4-export');
const l4TimerEl = document.getElementById('l4-timer');

function initLevel4(){
  resetL4();
  startTimer(BANK.settings.timer.level4, l4TimerEl, () => { l4Check?.click(); });
}

function resetL4(){ l4Form.reset(); l4Feedback.className='feedback'; l4Feedback.innerHTML=''; }

l4Reset?.addEventListener('click', resetL4);

function scoreLevel4(){
  const thesis = document.getElementById('l4-thesis').value.trim();
  const a1 = document.getElementById('l4-arg1').value.trim();
  const a2 = document.getElementById('l4-arg2').value.trim();
  const a3 = document.getElementById('l4-arg3').value.trim();
  const reit = document.getElementById('l4-reit').value.trim();

  let points = 0, issues=[];
  const hasAll = thesis && a1 && a2 && a3 && reit; points += hasAll ? 30 : 10;
  if (!hasAll) issues.push('Struktur belum lengkap (Thesis, 3 Arguments, Reiteration).');

  const args = [a1,a2,a3];
  const minLenOK = args.every(x => x.split(/\s+/).length >= 8); points += minLenOK ? 20 : 8;
  if (!minLenOK) issues.push('Perkuat argumen (min. ±8 kata per argumen).');

  const conjunctions = ['firstly','secondly','moreover','therefore','however','in addition'];
  const conjOK = args.some(x => conjunctions.some(c => x.toLowerCase().includes(c))); points += conjOK ? 15 : 5;
  if (!conjOK) issues.push('Gunakan internal conjunction (mis. moreover, therefore).');

  const simplePresentHints = ['is','are','support','supports','improve','improves','benefit','benefits'];
  const textAll = [thesis,a1,a2,a3,reit].join(' ').toLowerCase();
  const spOK = simplePresentHints.some(w => textAll.includes(` ${w} `)); points += spOK ? 15 : 5;
  if (!spOK) issues.push('Pastikan menggunakan simple present (is/are, supports, improves).');

  const modalHints = ['should','must','will','can'];
  const modalOK = modalHints.some(m => textAll.includes(` ${m} `)); points += modalOK ? 20 : 8;
  if (!modalOK) issues.push('Gunakan modal verbs (should, must, will, can).');

  points = Math.min(100, points);
  return { score: Math.round(points), thesis, a1, a2, a3, reit, issues };
}

l4Check?.addEventListener('click', () => {
  const res = scoreLevel4();
  const ok = res.score >= 75;
  // Time bonus: sisa detik /10 * factor
  const timeBonus = Math.max(0, Math.floor(remaining/10) * (BANK.settings.timeBonusPer10s||1));
  const details = `Skor Level 4: <b>${res.score}</b> | Time Bonus: <b>+${timeBonus}</b><br>` + (res.issues.length ? '<ul>' + res.issues.map(i=>`<li>${i}</li>`).join('') + '</ul>' : '<i>Keren! Struktur, logika, dan kebahasaan sudah kuat.</i>');
  showFeedback(l4Feedback, ok, details);
  recordScore(4, res.score, timeBonus);
});

l4Export?.addEventListener('click', () => {
  const topic = document.getElementById('topicSelect');
  const t = topic.options[topic.selectedIndex].text;
  const thesis = document.getElementById('l4-thesis').value.trim();
  const a1 = document.getElementById('l4-arg1').value.trim();
  const a2 = document.getElementById('l4-arg2').value.trim();
  const a3 = document.getElementById('l4-arg3').value.trim();
  const reit = document.getElementById('l4-reit').value.trim();

  const content = `Topic: ${t}

Thesis:
${thesis}

Arguments:
1) ${a1}
2) ${a2}
3) ${a3}

Reiteration:
${reit}
`;
  const blob = new Blob([content], { type: 'text/plain' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'analytical-exposition.txt'; document.body.appendChild(a); a.click(); a.remove();
});

// =================== Poin, Badge, History ===================
function showFeedback(el, ok, html){ el.className = 'feedback show ' + (ok ? 'success' : 'error'); el.innerHTML = html; }

function recordScore(level, score, bonus){
  const date = new Date().toLocaleString('id-ID');
  const base = Math.max(5, Math.round(score/10));
  const add = base + (bonus||0);
  state.points += add;
  state.history.unshift({ level, score: score + (bonus?` (+${bonus})`:''), date });
  if (score >= 90 && !state.badges.includes('Gold')) state.badges.push('Gold');
  else if (score >= 75 && !state.badges.includes('Silver')) state.badges.push('Silver');
  else if (score >= 60 && !state.badges.includes('Bronze')) state.badges.push('Bronze');
  store.write(state); refreshScoreUI();
}

function refreshScoreUI(){
  const totalPoints = document.getElementById('totalPoints');
  const badges = document.getElementById('badges');
  const tbody = document.querySelector('#historyTable tbody');
  if (totalPoints) totalPoints.textContent = state.points;
  if (badges) { badges.innerHTML = ''; state.badges.forEach(b => { const span = document.createElement('span'); span.className='badge'; span.textContent = b; badges.appendChild(span); }); }
  if (tbody) { tbody.innerHTML = ''; state.history.slice(0,20).forEach(h => { const tr = document.createElement('tr'); tr.innerHTML = `<td>Level ${h.level}</td><td>${h.score}</td><td>${h.date}</td>`; tbody.appendChild(tr); }); }
}

refreshScoreUI();

// Utils
function shuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; }

// Default to home visible on load
showView('#home');
