// Recount Quest — SMK Fase E
// Deep Learning Method: Membangun pemahaman melalui interaksi dan refleksi.

const store = {
  key: 'recount_quest_v1',
  read() {
    try { return JSON.parse(localStorage.getItem(this.key)) || { playerName: '', points: 0, history: [], badges: [] }; } 
    catch { return { playerName: '', points: 0, history: [], badges: [] }; }
  },
  write(data) { localStorage.setItem(this.key, JSON.stringify(data)); }
};

const state = store.read();

// Timer
let currentTimer = null;
function startTimer(displayId, seconds, onTimeout) {
  if (currentTimer) clearInterval(currentTimer);
  const display = document.getElementById(displayId);
  if (!display) return;
  display.parentElement.style.color = 'var(--danger)';
  
  let remaining = seconds;
  const update = () => {
    const m = Math.floor(remaining / 60).toString().padStart(2, '0');
    const s = (remaining % 60).toString().padStart(2, '0');
    display.textContent = `${m}:${s}`;
    if (remaining <= 0) {
      clearInterval(currentTimer);
      if (onTimeout) onTimeout();
    }
    remaining--;
  };
  update();
  currentTimer = setInterval(update, 1000);
}

function stopTimer() {
  if (currentTimer) clearInterval(currentTimer);
}

// Navigasi
const navButtons = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');
navButtons.forEach(btn => btn.addEventListener('click', () => {
  navButtons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  showView(btn.dataset.target);
}));

function showView(selector) {
  views.forEach(v => v.classList.remove('active'));
  document.querySelector(selector).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  stopTimer();
  if (selector === '#level1') renderL1();
  else if (selector === '#level2') renderL2();
  else if (selector === '#level3') renderL3();
  else if (selector === '#level4') renderL4();
}

// Start
document.getElementById('startBtn')?.addEventListener('click', () => {
  const name = document.getElementById('playerName').value.trim();
  if(name) state.playerName = name;
  store.write(state);
  navButtons[1].click(); // Go to Level 1
});

// Helper
function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
  return arr;
}
function showFeedback(el, ok, html){
  el.className = 'feedback show ' + (ok ? 'success' : 'error');
  el.innerHTML = html;
}
function recordScore(level, score){
  const date = new Date().toLocaleString('id-ID');
  state.points += Math.max(5, Math.round(score/10));
  state.history.unshift({ level, score, date });
  if (score >= 90 && !state.badges.includes('Master')) state.badges.push('Master');
  else if (score >= 75 && !state.badges.includes('Proficient')) state.badges.push('Proficient');
  else if (score >= 60 && !state.badges.includes('Explorer')) state.badges.push('Explorer');
  store.write(state);
  refreshScoreUI();
}

function refreshScoreUI(){
  const totalPoints = document.getElementById('totalPoints');
  const badges = document.getElementById('badges');
  const tbody = document.getElementById('historyBody');
  if (totalPoints) totalPoints.textContent = state.points;
  if (badges) {
    badges.innerHTML = state.badges.map(b => `<span class="badge">${b}</span>`).join('');
  }
  if (tbody) {
    tbody.innerHTML = state.history.slice(0,10).map(h => `<tr><td>Level ${h.level}</td><td>${h.score}</td><td>${h.date}</td></tr>`).join('');
  }
}
refreshScoreUI();

// ------------------ Level 1: Structure ------------------
const L1_VARIATIONS = [
  {
    title: 'My First Day of Industrial Attachment (PKL)',
    data: [
      { id: 'o1', text: 'Last year, my classmates and I went to a car manufacturing plant in Cikarang for an industrial visit.', tag: 'Orientation' },
      { id: 'e1', text: 'First, the supervisor took us to the assembly line to see how robotic arms weld the car body.', tag: 'Events' },
      { id: 'e2', text: 'After that, we visited the quality control section where engineers test the engine and brakes.', tag: 'Events' },
      { id: 'r1', text: 'In conclusion, it was an eye-opening experience. I learned a lot about modern manufacturing technology.', tag: 'Reorientation' },
    ]
  },
  {
    title: 'A Visit to a Modern Server Room',
    data: [
      { id: 'o1', text: 'Two weeks ago, our IT class visited a modern data center in Jakarta.', tag: 'Orientation' },
      { id: 'e1', text: 'We started by wearing anti-static jackets before entering the server room.', tag: 'Events' },
      { id: 'e2', text: 'Next, the network engineer explained how the cooling system keeps the servers at optimal temperatures.', tag: 'Events' },
      { id: 'r1', text: 'Overall, the visit made me realize how complex and crucial data center maintenance is.', tag: 'Reorientation' },
    ]
  },
  {
    title: 'Culinary Practice: Cooking Traditional Food',
    data: [
      { id: 'o1', text: 'Yesterday, the culinary arts students had a special practice session in the school kitchen.', tag: 'Orientation' },
      { id: 'e1', text: 'First, we prepared all the ingredients like spices, vegetables, and meat.', tag: 'Events' },
      { id: 'e2', text: 'Then, our chef instructor demonstrated how to properly sauté the spices before adding the main ingredients.', tag: 'Events' },
      { id: 'r1', text: 'At the end of the day, we were very tired but proud of the delicious meals we cooked.', tag: 'Reorientation' },
    ]
  }
];

let l1_current_data = null;

function renderL1() {
  const variation = L1_VARIATIONS[Math.floor(Math.random() * L1_VARIATIONS.length)];
  l1_current_data = variation.data;
  document.getElementById('l1-subtitle').textContent = `Tarik potongan teks ke kotak struktur yang tepat. Teks: "${variation.title}"`;
  
  const source = document.getElementById('l1-source');
  source.innerHTML = '';
  shuffle([...l1_current_data]).forEach(item => {
    const el = document.createElement('div');
    el.className = 'draggable';
    el.textContent = item.text;
    el.draggable = true;
    el.dataset.id = item.id;
    source.appendChild(el);
  });
  document.querySelectorAll('.slot').forEach(z => z.innerHTML = '');
  document.getElementById('l1-feedback').className = 'feedback';
  
  startTimer('l1-timer', 90, () => {
    document.getElementById('l1-check').click();
    showFeedback(document.getElementById('l1-feedback'), false, `Waktu Habis!`);
  });
}

let dragged = null;
document.addEventListener('dragstart', e => { if (e.target.classList.contains('draggable')) { dragged = e.target; e.target.classList.add('dragging'); }});
document.addEventListener('dragend', e => { if (dragged) dragged.classList.remove('dragging'); dragged = null; });
document.querySelectorAll('.slot, #l1-source').forEach(zone => {
  zone.addEventListener('dragover', e => e.preventDefault());
  zone.addEventListener('drop', e => { e.preventDefault(); if (dragged) zone.appendChild(dragged); });
});

document.getElementById('l1-reset')?.addEventListener('click', renderL1);
document.getElementById('l1-check')?.addEventListener('click', () => {
  stopTimer();
  let correct = 0;
  const map = Object.fromEntries(l1_current_data.map(x => [x.id, x.tag]));
  ['Orientation', 'Events', 'Reorientation'].forEach(zone => {
    const slot = document.querySelector(`.dropzone[data-zone="${zone}"] .slot`);
    [...slot.children].forEach(el => {
      const ok = map[el.dataset.id] === zone;
      el.style.borderColor = ok ? 'var(--success)' : 'var(--danger)';
      if(ok) correct++;
    });
  });
  const score = Math.round((correct / l1_current_data.length) * 100);
  showFeedback(document.getElementById('l1-feedback'), score >= 75, `Skor L1: <b>${score}</b>. ${score>=75?'Struktur berhasil dipetakan!':'Ada potongan yang salah tempat.'}`);
  recordScore('1 (Structure)', score);
});
renderL1();

// ------------------ Level 2: Sequence ------------------
const L2_VARIATIONS = [
  {
    title: 'Workshop Internship',
    data: [
      { id: 's1', text: 'Yesterday morning, I arrived at the workshop for my first day of internship.', order: 1 },
      { id: 's2', text: 'First, the senior mechanic introduced me to the tools and safety gear.', order: 2 },
      { id: 's3', text: 'Then, I helped him change the oil and replace the brake pads of a client\'s car.', order: 3 },
      { id: 's4', text: 'After lunch break, I learned how to use the diagnostic scanner tool.', order: 4 },
      { id: 's5', text: 'Finally, I cleaned up the workspace before going home at 4 PM.', order: 5 },
      { id: 's6', text: 'It was exhausting, but I felt proud to gain real-world practical skills.', order: 6 }
    ]
  },
  {
    title: 'Hotel Reception Training',
    data: [
      { id: 's1', text: 'On Monday, I started my on-the-job training at the front desk of a busy hotel.', order: 1 },
      { id: 's2', text: 'First, the manager taught me how to greet guests politely and handle reservations.', order: 2 },
      { id: 's3', text: 'Next, I shadowed a senior receptionist as she processed a complicated check-in.', order: 3 },
      { id: 's4', text: 'Later in the afternoon, I successfully answered phone inquiries on my own.', order: 4 },
      { id: 's5', text: 'Finally, I helped organize the guest records before my shift ended.', order: 5 },
      { id: 's6', text: 'It was a challenging day, but I learned a lot about customer service.', order: 6 }
    ]
  },
  {
    title: 'Web Development Project',
    data: [
      { id: 's1', text: 'Last month, my team was assigned to build a school website.', order: 1 },
      { id: 's2', text: 'First, we held a meeting to discuss the layout and user requirements.', order: 2 },
      { id: 's3', text: 'Then, we divided the tasks; I was responsible for designing the homepage.', order: 3 },
      { id: 's4', text: 'After writing the code, we tested the website to fix any bugs.', order: 4 },
      { id: 's5', text: 'Finally, we presented the completed website to our teacher.', order: 5 },
      { id: 's6', text: 'In the end, the project improved our teamwork and coding skills.', order: 6 }
    ]
  }
];

let l2_current_data = null;

function renderL2() {
  const variation = L2_VARIATIONS[Math.floor(Math.random() * L2_VARIATIONS.length)];
  l2_current_data = variation.data;
  document.getElementById('l2-subtitle').textContent = `Susunlah kalimat-kalimat berikut menjadi teks Recount yang padu. Topik: "${variation.title}"`;
  
  const list = document.getElementById('l2-list');
  list.innerHTML = '';
  shuffle([...l2_current_data]).forEach((item) => {
    const el = document.createElement('div');
    el.className = 'seq-item';
    el.draggable = true;
    el.dataset.order = item.order;
    el.innerHTML = `<span>↕️</span> <div>${item.text}</div>`;
    list.appendChild(el);
  });
  
  let draggedSeq = null;
  [...list.children].forEach(item => {
    item.addEventListener('dragstart', function() { draggedSeq = this; setTimeout(() => this.style.display = 'none', 0); });
    item.addEventListener('dragend', function() { draggedSeq = null; this.style.display = 'flex'; });
    item.addEventListener('dragover', e => e.preventDefault());
    item.addEventListener('dragenter', function(e) { e.preventDefault(); this.style.border = '2px dashed var(--primary)'; });
    item.addEventListener('dragleave', function() { this.style.border = '1px solid #334155'; });
    item.addEventListener('drop', function() {
      this.style.border = '1px solid #334155';
      if(draggedSeq !== this) list.insertBefore(draggedSeq, this);
    });
  });
  document.getElementById('l2-feedback').className = 'feedback';
  
  startTimer('l2-timer', 120, () => {
    document.getElementById('l2-check').click();
    showFeedback(document.getElementById('l2-feedback'), false, `Waktu Habis!`);
  });
}

document.getElementById('l2-reset')?.addEventListener('click', renderL2);
document.getElementById('l2-check')?.addEventListener('click', () => {
  stopTimer();
  const list = document.getElementById('l2-list');
  let correct = 0;
  [...list.children].forEach((el, index) => {
    const expected = index + 1;
    const actual = parseInt(el.dataset.order);
    const ok = expected === actual;
    el.style.borderColor = ok ? 'var(--success)' : 'var(--danger)';
    if(ok) correct++;
  });
  const score = Math.round((correct / l2_current_data.length) * 100);
  showFeedback(document.getElementById('l2-feedback'), score === 100, `Skor L2: <b>${score}</b>. ${score===100?'Kronologi sempurna! Logika alur sudah kuat.':'Urutan peristiwa belum tepat, coba perhatikan kata hubung (First, Then, After that, Finally).'}`);
  recordScore('2 (Sequence)', score);
});
renderL2();

// ------------------ Level 3: Language ------------------
const L3_VARIATIONS = [
  [
    { id: 'q1', text: 'I __ to the networking seminar last Wednesday.', choices: ['go', 'went', 'gone'], answer: 'went' },
    { id: 'q2', text: 'The technician __ the broken motherboard successfully.', choices: ['repaired', 'repairs', 'repairing'], answer: 'repaired' },
    { id: 'q3', text: '__ we arrived, the manager gave us a brief orientation.', choices: ['Finally', 'Next', 'When'], answer: 'When' },
    { id: 'q4', text: 'We __ very tired, but happy with the experience.', choices: ['was', 'were', 'are'], answer: 'were' },
    { id: 'q5', text: 'I installed the software. __, I configured the server IP address.', choices: ['After that', 'In conclusion', 'Because'], answer: 'After that' }
  ],
  [
    { id: 'q1', text: 'She __ the new recipe in the kitchen yesterday.', choices: ['try', 'tries', 'tried'], answer: 'tried' },
    { id: 'q2', text: 'They __ a great time during the industrial visit.', choices: ['have', 'has', 'had'], answer: 'had' },
    { id: 'q3', text: 'First, I checked the engine. __, I changed the oil.', choices: ['Then', 'Before', 'When'], answer: 'Then' },
    { id: 'q4', text: 'The presentation __ very informative and clear.', choices: ['were', 'was', 'is'], answer: 'was' },
    { id: 'q5', text: '__, we packed our bags and went home.', choices: ['First', 'Finally', 'Next'], answer: 'Finally' }
  ],
  [
    { id: 'q1', text: 'He __ the meeting because he was sick.', choices: ['missed', 'miss', 'missing'], answer: 'missed' },
    { id: 'q2', text: 'My friends and I __ amazed by the robotic arms.', choices: ['was', 'were', 'are'], answer: 'were' },
    { id: 'q3', text: 'We finished the project on time. __, we celebrated with a pizza.', choices: ['After that', 'First', 'Although'], answer: 'After that' },
    { id: 'q4', text: 'The manager __ us a tour around the factory.', choices: ['give', 'gave', 'given'], answer: 'gave' },
    { id: 'q5', text: '__ I entered the room, the seminar had already started.', choices: ['Next', 'Finally', 'When'], answer: 'When' }
  ]
];

let l3_current_data = null;

function renderL3(){
  l3_current_data = L3_VARIATIONS[Math.floor(Math.random() * L3_VARIATIONS.length)];
  const quiz = document.getElementById('l3-quiz');
  quiz.innerHTML = '';
  l3_current_data.forEach(q => {
    const box = document.createElement('div'); box.className='quiz-q';
    box.innerHTML = `<strong style="font-size: 1.1rem; color: var(--primary);">${q.text}</strong>`;
    const choices = document.createElement('div'); choices.className='quiz-choices';
    q.choices.forEach(c => {
      choices.innerHTML += `<label><input type="radio" name="${q.id}" value="${c}"> ${c}</label>`;
    });
    box.appendChild(choices);
    quiz.appendChild(box);
  });
  document.getElementById('l3-feedback').className = 'feedback';
  
  startTimer('l3-timer', 60, () => {
    document.getElementById('l3-check').click();
    showFeedback(document.getElementById('l3-feedback'), false, `Waktu Habis!`);
  });
}

document.getElementById('l3-reset')?.addEventListener('click', renderL3);
document.getElementById('l3-check')?.addEventListener('click', () => {
  stopTimer();
  let correct = 0;
  l3_current_data.forEach(q => {
    const ans = document.querySelector(`input[name="${q.id}"]:checked`)?.value;
    if(ans === q.answer) correct++;
  });
  const score = Math.round((correct / l3_current_data.length) * 100);
  showFeedback(document.getElementById('l3-feedback'), score >= 80, `Skor L3: <b>${score}</b>. ${score>=80?'Pemahaman Grammar masa lalu sangat baik!':'Masih ada yang keliru, ingat penggunaan Past Tense (V2).'}`);
  recordScore('3 (Language)', score);
});
renderL3();

// ------------------ Level 4: Experience (Build) ------------------
const L4_VARIATIONS = [
  'Ceritakan pengalaman Praktik Kerja Lapangan (PKL) yang paling berkesan.',
  'Ceritakan pengalaman Kunjungan Industri yang pernah kamu ikuti.',
  'Ceritakan pengalamanmu saat pertama kali merakit komputer atau membuat proyek teknologi.',
  'Ceritakan pengalamanmu mengikuti Lomba Kompetensi Siswa (LKS).'
];

function renderL4() {
  document.getElementById('l4-form').reset();
  document.getElementById('l4-feedback').className = 'feedback';
  
  // Variasi instruksi
  const prompt = L4_VARIATIONS[Math.floor(Math.random() * L4_VARIATIONS.length)];
  const labelTopic = document.querySelector('.topic label');
  if(labelTopic) labelTopic.textContent = `Tantangan Menulis: ${prompt}`;
  
  startTimer('l4-timer', 300, () => {
    document.getElementById('l4-check').click();
    showFeedback(document.getElementById('l4-feedback'), false, `Waktu Habis!`);
  });
}

document.getElementById('l4-reset')?.addEventListener('click', renderL4);

document.getElementById('l4-check')?.addEventListener('click', () => {
  stopTimer();
  const ori = document.getElementById('l4-ori').value.trim();
  const ev = document.getElementById('l4-events').value.trim();
  const reit = document.getElementById('l4-reit').value.trim();
  
  let score = 0;
  let feedback = [];
  
  // 1. Structure (30%)
  if(ori && ev && reit) { score += 30; } 
  else { feedback.push('Struktur belum lengkap. Pastikan ketiga bagian terisi.'); }
  
  // 2. Length & Depth (Deep Learning aspect) (30%)
  const evWords = ev.split(/\s+/).length;
  if(evWords > 30) { score += 30; }
  else if(evWords > 10) { score += 15; feedback.push('Events (Peristiwa) kurang detail. Elaborasi lagi apa saja yang kamu lakukan.'); }
  else { feedback.push('Events terlalu singkat. Tuliskan lebih banyak tindakan.'); }

  // 3. Language Features (Past Tense & Connectives) (40%)
  const allText = (ori + " " + ev + " " + reit).toLowerCase();
  const pastVerbs = ['was', 'were', 'went', 'did', 'visited', 'learned', 'saw', 'helped', 'arrived', 'started', 'finished', 'got', 'made', 'took', 'met', 'had'];
  const connectives = ['first', 'then', 'next', 'after', 'finally', 'when', 'last'];
  
  const hasPastVerbs = pastVerbs.filter(v => allText.includes(` ${v} `) || allText.includes(`${v} `)).length;
  if(hasPastVerbs >= 3) { score += 20; }
  else { score += 5; feedback.push('Gunakan lebih banyak Action Verbs dalam bentuk Past Tense (V2) seperti went, did, visited.'); }
  
  const hasConn = connectives.filter(c => allText.includes(c)).length;
  if(hasConn >= 2) { score += 20; }
  else { score += 5; feedback.push('Gunakan Time Connectives (First, Then, After that, dll) untuk merangkai peristiwa secara kronologis.'); }
  
  showFeedback(document.getElementById('l4-feedback'), score >= 75, `Skor Penulisan: <b>${score}</b>.<br>` + (feedback.length ? '<ul>'+feedback.map(f=>`<li>${f}</li>`).join('')+'</ul>' : 'Luar biasa! Refleksi dan penulisan teks Recount-mu sudah sangat baik. Struktur, bahasa, dan kronologi terlihat jelas.'));
  recordScore('4 (Reflection)', score);
});

document.getElementById('l4-export')?.addEventListener('click', () => {
  const topic = document.getElementById('topicSelect').value;
  const ori = document.getElementById('l4-ori').value;
  const ev = document.getElementById('l4-events').value;
  const reit = document.getElementById('l4-reit').value;
  const content = `Topic: ${topic}\n\n[Orientation]\n${ori}\n\n[Events]\n${ev}\n\n[Reorientation]\n${reit}`;
  const blob = new Blob([content], {type: 'text/plain'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'My_Recount_Text.txt';
  a.click();
});
