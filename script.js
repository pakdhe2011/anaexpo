// Mission: Exposition — Vanilla JS SPA
// Penyimpanan sederhana
const store = {
  key: 'me_game_state_v1',
  read() {
    try { return JSON.parse(localStorage.getItem(this.key)) || { playerName: '', points: 0, history: [], badges: [] }; } catch { return { playerName: '', points: 0, history: [], badges: [] }; }
  },
  write(data) { localStorage.setItem(this.key, JSON.stringify(data)); }
};

const state = store.read();

// Navigasi
const navButtons = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');
navButtons.forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.target)));
function showView(selector) {
  views.forEach(v => v.classList.remove('active'));
  document.querySelector(selector).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Start
const startBtn = document.getElementById('startBtn');
const playerNameInput = document.getElementById('playerName');
startBtn?.addEventListener('click', () => {
  state.playerName = playerNameInput.value?.trim() || state.playerName || 'Pemain';
  store.write(state);
  showView('#level1');
});

// ------------------ Level 1 ------------------
const L1_DATA = [
  { id: 'p1', text: 'Schools should provide wider access to technology for students. Access to devices and internet is essential in modern learning.', tag: 'Thesis' },
  { id: 'p2', text: 'Firstly, technology supports personalized learning so students can learn at their own pace using suitable resources.', tag: 'Arguments' },
  { id: 'p3', text: 'Moreover, digital tools expand collaboration and creativity through project-based tasks and online discussions.', tag: 'Arguments' },
  { id: 'p4', text: 'Therefore, increasing technology access at school will improve learning quality and prepare students for future jobs.', tag: 'Reiteration' },
];

const l1Source = document.getElementById('l1-source');
const l1Feedback = document.getElementById('l1-feedback');
const l1Reset = document.getElementById('l1-reset');
const l1Check = document.getElementById('l1-check');

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
  document.querySelectorAll('.slot').forEach(z => z.innerHTML = '');
  l1Feedback.className = 'feedback'; l1Feedback.innerHTML='';
}

function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
  return arr;
}

// Drag & Drop listeners (delegated)
let dragged = null;

document.addEventListener('dragstart', e => {
  if (e.target.classList.contains('draggable')) {
    dragged = e.target; e.target.classList.add('dragging');
  }
});

document.addEventListener('dragend', e => { if (dragged) dragged.classList.remove('dragging'); dragged = null; });

document.querySelectorAll('.slot, #l1-source').forEach(zone => {
  zone.addEventListener('dragover', e => { e.preventDefault(); });
  zone.addEventListener('drop', e => { e.preventDefault(); if (dragged) zone.appendChild(dragged); });
});

l1Reset?.addEventListener('click', renderL1);

l1Check?.addEventListener('click', () => {
  // Validate
  let correct = 0, total = L1_DATA.length;
  const zoneMap = {
    Thesis: document.querySelector('.dropzone[data-zone="Thesis"] .slot'),
    Arguments: document.querySelector('.dropzone[data-zone="Arguments"] .slot'),
    Reiteration: document.querySelector('.dropzone[data-zone="Reiteration"] .slot')
  };
  const idToTag = Object.fromEntries(L1_DATA.map(x => [x.id, x.tag]));
  Object.entries(zoneMap).forEach(([zone, slot]) => {
    [...slot.children].forEach(el => {
      const id = el.dataset.id;
      const ok = idToTag[id] === zone;
      el.style.borderColor = ok ? '#166534' : '#7f1d1d';
      if (ok) correct++;
    });
  });
  const score = Math.round((correct / total) * 100);
  showFeedback(l1Feedback, score >= 75, `Skor Level 1: <b>${score}</b>. ${score>=75? 'Mantap! Struktur dikenali dengan baik.' : 'Coba lagi ya. Perhatikan perbedaan Thesis/Arguments/Reiteration.'}`);
  recordScore(1, score);
});

renderL1();

// ------------------ Level 2 ------------------
const L2_DATA = [
  { id: 's1', text: 'Schools should extend library hours for students.', tag: 'Klaim' },
  { id: 's2', text: 'Many students cannot study at home due to limited space and distractions.', tag: 'Alasan' },
  { id: 's3', text: 'A survey of 200 students shows 67% prefer evening access to the library.', tag: 'Bukti' },
  { id: 's4', text: 'Longer hours support equal learning opportunities.', tag: 'Alasan' },
  { id: 's5', text: 'In 2025, school X reported a 15% rise in reading rates after extending hours.', tag: 'Bukti' },
];

const L2_OPTIONS = ['Klaim','Alasan','Bukti'];
const l2List = document.getElementById('l2-list');
const l2Feedback = document.getElementById('l2-feedback');
const l2Reset = document.getElementById('l2-reset');
const l2Check = document.getElementById('l2-check');

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

l2Reset?.addEventListener('click', renderL2);

l2Check?.addEventListener('click', () => {
  const map = Object.fromEntries(L2_DATA.map(x => [x.id,x.tag]));
  let correct=0, total=L2_DATA.length;
  document.querySelectorAll('#l2-list select').forEach(sel => {
    const ok = sel.value === map[sel.dataset.id];
    sel.style.borderColor = ok ? '#166534' : '#7f1d1d';
    if (ok) correct++;
  });
  const score = Math.round((correct/total)*100);
  showFeedback(l2Feedback, score>=75, `Skor Level 2: <b>${score}</b>. ${score>=75? 'Analisis argumen sudah solid.' : 'Cek kembali mana klaim, alasan, dan bukti.'}`);
  recordScore(2, score);
});

renderL2();

// ------------------ Level 3 ------------------
const L3_QUESTIONS = [
  { id:'q1', text:'(Simple Present) Education __ a fundamental right.', choices:['is','was','will be'], answer:'is' },
  { id:'q2', text:'(Modal) Schools __ provide equal access to learning resources.', choices:['should','can','might'], answer:'should' },
  { id:'q3', text:'(Internal conjunction) __, providing devices supports personalized learning.', choices:['Moreover','However','Finally'], answer:'Moreover' },
  { id:'q4', text:'(Evaluative) It is __ that internet access improves research skills.', choices:['evident','rare','impossible'], answer:'evident' },
  { id:'q5', text:'(Simple Present) Technology use __ student collaboration.', choices:['supports','supported','has supported'], answer:'supports' },
];

const l3Quiz = document.getElementById('l3-quiz');
const l3Feedback = document.getElementById('l3-feedback');
const l3Reset = document.getElementById('l3-reset');
const l3Check = document.getElementById('l3-check');

function renderL3(){
  l3Quiz.innerHTML='';
  L3_QUESTIONS.forEach(q => {
    const box = document.createElement('div'); box.className='q';
    const p = document.createElement('div'); p.textContent = q.text; box.appendChild(p);
    const choices = document.createElement('div'); choices.className='choices';
    q.choices.forEach((c,i) => {
      const id = `${q.id}_${i}`;
      const label = document.createElement('label');
      label.innerHTML = `<input type="radio" name="${q.id}" value="${c}"> ${c}`;
      choices.appendChild(label);
    });
    box.appendChild(choices); l3Quiz.appendChild(box);
  });
  l3Feedback.className='feedback'; l3Feedback.innerHTML='';
}

l3Reset?.addEventListener('click', renderL3);

l3Check?.addEventListener('click', () => {
  let correct=0, total=L3_QUESTIONS.length;
  L3_QUESTIONS.forEach(q => {
    const chosen = (document.querySelector(`input[name="${q.id}"]:checked`)||{}).value;
    const ok = chosen === q.answer;
    if (ok) correct++;
  });
  const score = Math.round((correct/total)*100);
  showFeedback(l3Feedback, score>=75, `Skor Level 3: <b>${score}</b>. ${score>=75? 'Kebahasaan kamu mantap!' : 'Perkuat lagi modals, conjunction, dan simple present.'}`);
  recordScore(3, score);
});

renderL3();

// ------------------ Level 4 ------------------
const l4Form = document.getElementById('l4-form');
const l4Feedback = document.getElementById('l4-feedback');
const l4Reset = document.getElementById('l4-reset');
const l4Check = document.getElementById('l4-check');
const l4Export = document.getElementById('l4-export');

function resetL4(){
  l4Form.reset(); l4Feedback.className='feedback'; l4Feedback.innerHTML='';
}

l4Reset?.addEventListener('click', resetL4);

function scoreLevel4(){
  const thesis = document.getElementById('l4-thesis').value.trim();
  const a1 = document.getElementById('l4-arg1').value.trim();
  const a2 = document.getElementById('l4-arg2').value.trim();
  const a3 = document.getElementById('l4-arg3').value.trim();
  const reit = document.getElementById('l4-reit').value.trim();

  // Rubrik sederhana (0-100)
  let points = 0, issues=[];
  // Struktur
  const hasAll = thesis && a1 && a2 && a3 && reit; points += hasAll ? 30 : 10;
  if (!hasAll) issues.push('Struktur belum lengkap (Thesis, 3 Arguments, Reiteration).');

  // Logika argumen: panjang minimal & kata penghubung internal
  const args = [a1,a2,a3];
  const minLenOK = args.every(x => x.split(/\s+/).length >= 8); points += minLenOK ? 20 : 8;
  if (!minLenOK) issues.push('Perkuat argumen (min. ±8 kata per argumen).');

  const conjunctions = ['firstly','secondly','moreover','therefore','however','in addition'];
  const conjOK = args.some(x => conjunctions.some(c => x.toLowerCase().includes(c))); points += conjOK ? 15 : 5;
  if (!conjOK) issues.push('Gunakan internal conjunction (mis. moreover, therefore).');

  // Kebahasaan: simple present (indikasi kata kerja dasar), modal usage
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
  const details = `Skor Level 4: <b>${res.score}</b><br>` + (res.issues.length ? '<ul>' + res.issues.map(i=>`<li>${i}</li>`).join('') + '</ul>' : '<i>Keren! Struktur, logika, dan kebahasaan sudah kuat.</i>');
  showFeedback(l4Feedback, ok, details);
  recordScore(4, res.score);
});

l4Export?.addEventListener('click', () => {
  const topic = document.getElementById('topicSelect');
  const t = topic.options[topic.selectedIndex].text;
  const thesis = document.getElementById('l4-thesis').value.trim();
  const a1 = document.getElementById('l4-arg1').value.trim();
  const a2 = document.getElementById('l4-arg2').value.trim();
  const a3 = document.getElementById('l4-arg3').value.trim();
  const reit = document.getElementById('l4-reit').value.trim();

  const content = `Topic: ${t}\n\nThesis:\n${thesis}\n\nArguments:\n1) ${a1}\n2) ${a2}\n3) ${a3}\n\nReiteration:\n${reit}\n`;
  const blob = new Blob([content], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'analytical-exposition.txt';
  document.body.appendChild(a); a.click(); a.remove();
});

// ------------------ Poin, Badge, History ------------------
function showFeedback(el, ok, html){
  el.className = 'feedback show ' + (ok ? 'success' : 'error');
  el.innerHTML = html;
}

function recordScore(level, score){
  const date = new Date().toLocaleString('id-ID');
  state.points += Math.max(5, Math.round(score/10));
  state.history.unshift({ level, score, date });
  // Badge
  if (score >= 90 && !state.badges.includes('Gold')) state.badges.push('Gold');
  else if (score >= 75 && !state.badges.includes('Silver')) state.badges.push('Silver');
  else if (score >= 60 && !state.badges.includes('Bronze')) state.badges.push('Bronze');
  store.write(state);
  refreshScoreUI();
}

function refreshScoreUI(){
  const totalPoints = document.getElementById('totalPoints');
  const badges = document.getElementById('badges');
  const tbody = document.querySelector('#historyTable tbody');
  if (totalPoints) totalPoints.textContent = state.points;
  if (badges) {
    badges.innerHTML = '';
    state.badges.forEach(b => {
      const span = document.createElement('span'); span.className='badge'; span.textContent = b;
      badges.appendChild(span);
    });
  }
  if (tbody) {
    tbody.innerHTML = '';
    state.history.slice(0,20).forEach(h => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>Level ${h.level}</td><td>${h.score}</td><td>${h.date}</td>`;
      tbody.appendChild(tr);
    });
  }
}

refreshScoreUI();

// Default to home visible on load
showView('#home');
