
/**
 * Analytical Exposition RPG – SMK Fase E (Kelas 10)
 * Murni HTML/CSS/JS, kompatibel GitHub Pages.
 * Kontrol: WASD/Arrow, Interaksi: Space, Reset: R
 */

(() => {
  const TILE = 32; // px per tile
  const MAP_W = 20, MAP_H = 15; // 640x480

  // Tile types
  const T = { FLOOR:0, WALL:1, NPC:2, PORTAL:3, QUIZ:4, FINAL:5 };

  // Simple school map
  const map = [
    // 0=floor,1=wall,2=npc,3=portal,4=quiz,5=final
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,4,0,0,0,0,1,0,0,0,0,5,0,1],
    [1,0,1,1,1,0,0,0,0,1,1,0,1,0,1,1,0,0,0,1],
    [1,0,0,0,1,0,2,0,0,0,1,0,0,0,0,1,0,1,0,1],
    [1,0,1,0,1,0,0,0,1,0,1,0,1,4,0,1,0,1,0,1],
    [1,0,1,0,0,0,1,0,1,0,0,0,1,0,0,1,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,1],
    [1,0,1,1,0,1,1,1,1,0,1,1,1,0,1,0,0,1,0,1],
    [1,0,0,1,0,0,0,0,1,0,0,0,1,0,1,0,1,1,0,1],
    [1,0,1,1,1,1,1,0,1,1,1,0,1,0,0,0,1,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,3,1],
    [1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1],
    [1,4,0,0,0,0,0,0,0,0,1,0,0,0,0,0,4,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ];

  // Player state
  const player = { x: 2, y: 2, points: 0, badges: [], mission: 'Temui Guru Bahasa (🟩 kotak hijau).', visited: {} };

  // Canvas setup
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  // UI elements
  const pointsEl = document.getElementById('points');
  const badgeEl = document.getElementById('badge');
  const missionEl = document.getElementById('mission');
  const overlay = document.getElementById('overlay');
  const dialogContent = document.getElementById('dialog-content');
  const dialogClose = document.getElementById('dialog-close');
  const quiz = document.getElementById('quiz');
  const quizBody = document.getElementById('quiz-body');
  const quizActions = document.getElementById('quiz-actions');
  const quizTitle = document.getElementById('quiz-title');

  function save() {
    localStorage.setItem('ae_rpg_save', JSON.stringify(player));
  }
  function load() {
    try {
      const data = JSON.parse(localStorage.getItem('ae_rpg_save'));
      if (data) Object.assign(player, data);
    } catch {}
  }
  load();

  function tileAt(x, y) {
    if (x < 0 || x >= MAP_W || y < 0 || y >= MAP_H) return T.WALL;
    return map[y][x];
  }

  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    for (let y=0; y<MAP_H; y++) {
      for (let x=0; x<MAP_W; x++) {
        const t = map[y][x];
        switch(t){
          case T.WALL: ctx.fillStyle = '#334155'; break;
          case T.NPC: ctx.fillStyle = '#22c55e'; break;
          case T.PORTAL: ctx.fillStyle = '#2563eb'; break;
          case T.QUIZ: ctx.fillStyle = '#eab308'; break;
          case T.FINAL: ctx.fillStyle = '#f43f5e'; break;
          default: ctx.fillStyle = '#0f172a';
        }
        ctx.fillRect(x*TILE, y*TILE, TILE-1, TILE-1);
      }
    }

    // Player
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(player.x*TILE+4, player.y*TILE+4, TILE-8, TILE-8);
  }

  function updateUI(){
    pointsEl.textContent = player.points;
    badgeEl.textContent = player.badges[player.badges.length-1] || '-';
    missionEl.textContent = player.mission;
  }

  function canWalk(x,y){ return tileAt(x,y) !== T.WALL; }

  function move(dx,dy){
    const nx = player.x + dx, ny = player.y + dy;
    if (canWalk(nx,ny)) { player.x = nx; player.y = ny; onStep(nx,ny); save(); draw(); }
  }

  function nearType(type){
    const dirs = [[0,0],[1,0],[-1,0],[0,1],[0,-1]];
    for (const [dx,dy] of dirs) {
      if (tileAt(player.x+dx, player.y+dy) === type) return {x:player.x+dx,y:player.y+dy};
    }
    return null;
  }

  function openDialog(html){
    dialogContent.innerHTML = html;
    overlay.classList.remove('hidden');
  }

  dialogClose.addEventListener('click', ()=> overlay.classList.add('hidden'));

  // Content: quests & quizzes
  const content = {
    npcIntro: `
      <h2>Guru Bahasa</h2>
      <p>Selamat datang di <strong>Kota Logika</strong>! Tugasmu: mengusir kabut misinformasi dengan <em>Analytical Exposition</em>.</p>
      <ol>
        <li>Kenali struktur: <strong>Thesis – Arguments – Reiteration</strong>.</li>
        <li>Bedakan <strong>opini vs fakta</strong>.</li>
        <li>Susun paragraf menjadi teks yang koheren.</li>
      </ol>
      <p>Temukan terminal kuning (🟨) untuk memulai tantangan. Setelah semua selesai, menuju portal merah (🟥) untuk Ujian Akhir.</p>
    `,

    quizzes: [
      {
        id: 'structure',
        title: 'Tantangan 1 – Struktur Teks',
        type: 'mcq',
        q: 'Bagian manakah yang merupakan <em>Thesis</em>?',
        choices: [
          'Pernyataan isu utama dan posisi penulis',
          'Rangkaian alasan logis yang mendukung posisi',
          'Penegasan ulang posisi di bagian akhir'
        ],
        correct: 0,
        explain: 'Thesis memperkenalkan isu dan posisi penulis yang akan didukung oleh argumen.'
      },
      {
        id: 'factopinion',
        title: 'Tantangan 2 – Opini vs Fakta',
        type: 'mcq',
        q: 'Pilih kalimat yang termasuk <em>fakta</em>.',
        choices: [
          'Game edukatif adalah cara terbaik belajar.',
          'Sebagian besar siswa SMK berusia 15–18 tahun.',
          'Menurut saya, pelajaran bahasa itu mudah.'
        ],
        correct: 1,
        explain: 'Fakta dapat diverifikasi, misalnya data usia; opini bersifat penilaian atau preferensi.'
      },
      {
        id: 'ordering',
        title: 'Tantangan 3 – Susun Paragraf',
        type: 'order',
        parts: [
          'Oleh karena itu, literasi digital harus ditanamkan sejak dini agar siswa mampu mengevaluasi informasi secara kritis. (Reiteration)',
          'Banyak informasi palsu tersebar cepat di media sosial. Literasi digital membantu siswa menilai kredibilitas sumber. (Argument)',
          'Penguatan literasi digital di sekolah sangat penting untuk mencegah misinformasi. (Thesis)'
        ],
        solution: [2,1,0],
        explain: 'Urutan yang benar: Thesis → Arguments → Reiteration.'
      }
    ]
  };

  // Quiz engine
  const progress = { structure:false, factopinion:false, ordering:false };

  function launchQuiz(quizId){
    const item = content.quizzes.find(q=>q.id===quizId);
    if (!item) return;

    quiz.classList.remove('hidden');
    quizTitle.textContent = item.title;
    quizBody.innerHTML = '';
    quizActions.innerHTML = '';

    if (item.type === 'mcq') {
      const p = document.createElement('p');
      p.innerHTML = item.q;
      quizBody.appendChild(p);

      item.choices.forEach((c, i)=>{
        const btn = document.createElement('button');
        btn.textContent = c;
        btn.onclick = ()=>{
          if (i === item.correct) {
            alert('Benar!');
            player.points += 10; progress[item.id] = true; player.mission = 'Cari terminal kuning berikutnya atau menuju portal merah.';
            save(); updateUI();
            quiz.classList.add('hidden');
            openDialog(`<p>✅ ${item.explain}</p>`);
          } else {
            alert('Kurang tepat, coba lagi.');
          }
        };
        quizActions.appendChild(btn);
      });
    }

    if (item.type === 'order') {
      // draggable list minimalism
      const info = document.createElement('p');
      info.textContent = 'Urutkan paragraf menjadi teks Analytical Exposition yang benar (atas ke bawah).';
      quizBody.appendChild(info);

      const list = document.createElement('ol');
      list.id = 'order-list';
      list.style.listStyle = 'decimal';
      list.style.display = 'grid';
      list.style.gap = '8px';

      item.parts.forEach((txt, idx)=>{
        const li = document.createElement('li');
        li.textContent = txt;
        li.draggable = true;
        li.dataset.idx = idx;
        li.style.background = '#111827';
        li.style.border = '1px solid #374151';
        li.style.padding = '8px';
        li.style.borderRadius = '8px';
        li.addEventListener('dragstart', e=>{
          e.dataTransfer.setData('text/plain', li.dataset.idx);
        });
        li.addEventListener('dragover', e=> e.preventDefault());
        li.addEventListener('drop', e=>{
          e.preventDefault();
          const from = e.dataTransfer.getData('text/plain');
          const toNode = e.currentTarget;
          const fromNode = [...list.children].find(ch=>ch.dataset.idx===from);
          if (fromNode && toNode) {
            // swap
            const ref = toNode.nextSibling;
            list.insertBefore(fromNode, toNode);
            if (ref) list.insertBefore(toNode, ref);
          }
        });
        list.appendChild(li);
      });
      quizBody.appendChild(list);

      const cek = document.createElement('button');
      cek.textContent = 'Periksa Urutan';
      cek.onclick = ()=>{
        const order = [...document.querySelectorAll('#order-list li')].map(li=>parseInt(li.dataset.idx));
        const ok = JSON.stringify(order) === JSON.stringify(item.solution);
        if (ok) {
          alert('Mantap! Urutan benar.');
          player.points += 15; progress[item.id] = true; player.mission = 'Semua tantangan selesai? Arahkan ke portal merah untuk Ujian Akhir!';
          save(); updateUI();
          quiz.classList.add('hidden');
          openDialog(`<p>✅ ${item.explain}</p>`);
        } else {
          alert('Belum tepat. Hint: mulai dengan Thesis.');
        }
      };
      quizActions.appendChild(cek);
    }
  }

  function allChallengesDone(){
    return Object.values(progress).every(Boolean);
  }

  function onInteract(){
    const nearNpc = nearType(T.NPC);
    const nearQuiz = nearType(T.QUIZ);
    const nearFinal = nearType(T.FINAL);

    if (nearNpc) {
      openDialog(content.npcIntro);
      player.mission = 'Selesaikan 3 tantangan di terminal kuning (🟨).';
      save(); updateUI();
      return;
    }

    if (nearQuiz){
      // choose next quiz based on progress
      const q = content.quizzes.find(q=>!progress[q.id]);
      if (q) launchQuiz(q.id); else openDialog('<p>Semua tantangan kuis selesai. Menuju portal merah (🟥) untuk Ujian Akhir.</p>');
      return;
    }

    if (nearFinal){
      if (!allChallengesDone()) { openDialog('<p>Lengkapi semua tantangan (🟨) sebelum Ujian Akhir.</p>'); return; }
      finalExam();
      return;
    }

    const nearPortal = nearType(T.PORTAL);
    if (nearPortal){ openDialog('<p>Portal biru (🟦) hanyalah shortcut—lanjutkan tantanganmu!</p>'); return; }
  }

  function onStep(x,y){
    // one-time hints
    const key = x+','+y;
    if (!player.visited[key]){
      player.visited[key] = true;
      if (tileAt(x,y)===T.QUIZ) {
        player.mission = 'Tekan Spasi untuk memulai tantangan di terminal kuning.'; updateUI();
      }
      if (tileAt(x,y)===T.FINAL) {
        player.mission = 'Tekan Spasi untuk mulai Ujian Akhir.'; updateUI();
      }
    }
  }

  function finalExam(){
    quiz.classList.remove('hidden');
    quizTitle.textContent = 'Ujian Akhir – Tulis Analytical Exposition (3 paragraf)';
    quizBody.innerHTML = '';
    quizActions.innerHTML = '';

    const topic = 'Penggunaan transportasi umum lebih baik daripada kendaraan pribadi di kota besar.';

    const instr = document.createElement('div');
    instr.innerHTML = `<p>Tulis 3 paragraf: <strong>Thesis</strong>, <strong>Arguments</strong>, <strong>Reiteration</strong>. Topik: <em>${topic}</em></p>`;
    quizBody.appendChild(instr);

    const ta = document.createElement('textarea');
    ta.rows = 12; ta.style.width = '100%'; ta.placeholder = 'Tulis di sini... (ID/EN sederhana diperbolehkan)';
    quizBody.appendChild(ta);

    const nilai = document.createElement('button');
    nilai.textContent = 'Nilai Otomatis';
    nilai.onclick = ()=>{
      const text = (ta.value||'').trim();
      const res = autoGrade(text);
      const msg = `Skor: ${res.score}/100

Catatan:
- Struktur: ${res.details.structure}
- Argumentasi: ${res.details.arguments}
- Koherensi: ${res.details.coherence}`;
      alert(msg);
      if (res.score >= 70) {
        player.points += 30; player.badges.push('Penjaga Kota Logika'); player.mission = 'Selesai! Bagikan hasilmu.'; save(); updateUI();
        quiz.classList.add('hidden');
        openDialog('<h3>Selamat! 🎉</h3><p>Kamu lulus Ujian Akhir dan mendapatkan badge <strong>Penjaga Kota Logika</strong>.</p>');
      } else {
        openDialog('<p>Skor belum mencapai 70. Perbaiki struktur dan kejelasan argumen, lalu nilai ulang.</p>');
      }
    };
    quizActions.appendChild(nilai);

    const tutup = document.createElement('button');
    tutup.textContent = 'Batal'; tutup.className = 'secondary';
    tutup.onclick = ()=> quiz.classList.add('hidden');
    quizActions.appendChild(tutup);
  }

  function autoGrade(text){
    if (!text) return { score: 0, details: { structure:'Tidak ada', arguments:'Tidak ada', coherence:'Tidak ada' } };

    // naive split into paragraphs
    const paras = text.split(/
\s*
|

/).map(p=>p.trim()).filter(Boolean);
    let structureScore = 0;
    if (paras.length >= 3) structureScore += 40; // basic structure present

    // check connectors
    const thesisHints = /(thesis|menurut|saya percaya|saya berpendapat|in my opinion|i believe)/i;
    const argHints = /(pertama|kedua|selain itu|di samping itu|in addition|firstly|secondly|moreover)/i;
    const reiterHints = /(oleh karena itu|dengan demikian|kesimpulannya|therefore|in conclusion|to conclude)/i;

    if (paras[0] && thesisHints.test(paras[0])) structureScore += 10;
    if (paras[1] && argHints.test(paras[1])) structureScore += 10;
    if (paras[2] && reiterHints.test(paras[2])) structureScore += 10;
    if (structureScore > 60) structureScore = 60;

    // argument quality: presence of because/why/fact words
    const factWords = /(data|survei|menurut laporan|statistik|research|study|evidence)/i;
    const reasonWords = /(karena|sebab|ini membuat|hal ini menyebabkan|this leads|because)/i;
    let argScore = 0;
    if (paras[1]) argScore += 15;
    if (factWords.test(text)) argScore += 10;
    if (reasonWords.test(text)) argScore += 15;
    if (argScore > 40) argScore = 40;

    // coherence: simple checks for length and connectors across text
    const words = text.split(/\s+/).filter(Boolean);
    let coh = 0;
    if (words.length >= 120) coh += 10; // encourage substance (~120+ words)
    if (/(selain itu|sebagai hasil|di sisi lain|on the other hand|furthermore|however)/i.test(text)) coh += 10;
    if (coh > 20) coh = 20;

    const score = Math.min(100, structureScore + argScore + coh);

    const details = {
      structure: `${structureScore}/60`,
      arguments: `${argScore}/40`,
      coherence: `${coh}/20`
    };
    return { score, details };
  }

  // Keyboard
  const pressed = new Set();
  document.addEventListener('keydown', (e)=>{
    if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," ","w","a","s","d","W","A","S","D","r","R"].includes(e.key)) {
      e.preventDefault();
    }
    pressed.add(e.key);

    if (e.key === ' '){ onInteract(); }
    if (e.key === 'r' || e.key === 'R'){ localStorage.removeItem('ae_rpg_save'); location.reload(); }

    switch(e.key){
      case 'ArrowUp': case 'w': case 'W': move(0,-1); break;
      case 'ArrowDown': case 's': case 'S': move(0,1); break;
      case 'ArrowLeft': case 'a': case 'A': move(-1,0); break;
      case 'ArrowRight': case 'd': case 'D': move(1,0); break;
    }
  });
  document.addEventListener('keyup', (e)=> pressed.delete(e.key));

  // Initial draw
  updateUI();
  draw();
})();
