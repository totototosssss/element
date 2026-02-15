/* ここに前回の allElements データ（1〜118番）を貼り付けてください。
   例: const allElements = [{ n: 1, s: 'H', e: 'Hydrogen' }, ... ];
*/
const allElements = [
    { n: 1, s: 'H', e: 'Hydrogen' }, { n: 2, s: 'He', e: 'Helium' },
    { n: 3, s: 'Li', e: 'Lithium' }, { n: 4, s: 'Be', e: 'Beryllium' },
    { n: 5, s: 'B', e: 'Boron' }, { n: 6, s: 'C', e: 'Carbon' },
    { n: 7, s: 'N', e: 'Nitrogen' }, { n: 8, s: 'O', e: 'Oxygen' },
    { n: 9, s: 'F', e: 'Fluorine' }, { n: 10, s: 'Ne', e: 'Neon' },
    { n: 11, s: 'Na', e: 'Sodium' }, { n: 12, s: 'Mg', e: 'Magnesium' },
    { n: 13, s: 'Al', e: 'Aluminium' }, { n: 14, s: 'Si', e: 'Silicon' },
    { n: 15, s: 'P', e: 'Phosphorus' }, { n: 16, s: 'S', e: 'Sulfur' },
    { n: 17, s: 'Cl', e: 'Chlorine' }, { n: 18, s: 'Ar', e: 'Argon' },
    { n: 19, s: 'K', e: 'Potassium' }, { n: 20, s: 'Ca', e: 'Calcium' },
    // ... 必要な分だけデータをここに追加 ...
    { n: 60, s: 'Nd', e: 'Neodymium' } 
];

// 状態管理
let queue = [];
let currentIndex = 0;
let mistakes = JSON.parse(localStorage.getItem('elementMistakes')) || [];
let isProcessing = false; // 連打防止

function init() {
    updateStats();
    document.getElementById('answer-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer();
    });
}

function updateStats() {
    const el = document.getElementById('stats-msg');
    el.innerText = mistakes.length > 0 ? `Mistakes stored: ${mistakes.length}` : "";
}

function goHome() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('menu-screen').classList.add('active');
    updateStats();
}

function startMode(mode) {
    // 範囲選択
    const range = document.querySelector('input[name="range"]:checked').value;
    
    if (range === '60') {
        queue = allElements.filter(e => e.n <= 60);
    } else if (range === 'all') {
        queue = allElements.slice();
    } else {
        queue = allElements.filter(e => mistakes.includes(e.n));
        if (queue.length === 0) return alert("No mistakes yet!");
    }

    // シャッフル
    queue.sort(() => Math.random() - 0.5);
    currentIndex = 0;
    
    // 画面切り替え
    document.getElementById('menu-screen').classList.remove('active');
    
    if (mode === 'quiz') {
        document.getElementById('quiz-screen').classList.add('active');
        loadQuiz();
    } else {
        document.getElementById('study-screen').classList.add('active');
        loadStudy();
    }
}

// --- Quiz Logic ---

function loadQuiz() {
    if (currentIndex >= queue.length) {
        alert("Finished!");
        goHome();
        return;
    }
    
    isProcessing = false;
    const item = queue[currentIndex];
    
    document.getElementById('q-num').innerText = item.n;
    document.getElementById('q-sym').innerText = item.s;
    document.getElementById('quiz-progress').innerText = `${currentIndex + 1} / ${queue.length}`;
    
    const input = document.getElementById('answer-input');
    input.value = '';
    input.focus();
    
    document.getElementById('result-msg').innerText = '';
}

function checkAnswer() {
    if (isProcessing) return; // 連打防止
    
    const input = document.getElementById('answer-input').value.trim();
    const item = queue[currentIndex];
    const msg = document.getElementById('result-msg');
    
    isProcessing = true; // 処理中フラグON

    if (input.toLowerCase() === item.e.toLowerCase()) {
        msg.innerText = "Correct!";
        msg.className = "correct";
        
        // 正解ならmistakesから削除
        if (mistakes.includes(item.n)) {
            mistakes = mistakes.filter(n => n !== item.n);
            localStorage.setItem('elementMistakes', JSON.stringify(mistakes));
        }
    } else {
        msg.innerText = `Wrong! It was ${item.e}`;
        msg.className = "wrong";
        
        // 間違いならmistakesに追加
        if (!mistakes.includes(item.n)) {
            mistakes.push(item.n);
            localStorage.setItem('elementMistakes', JSON.stringify(mistakes));
        }
    }

    // 正解・不正解にかかわらず、1.5秒後に次へ
    setTimeout(() => {
        currentIndex++;
        loadQuiz();
    }, 1500);
}

// --- Study Logic ---

function loadStudy() {
    if (currentIndex >= queue.length) {
        alert("End of cards");
        goHome();
        return;
    }
    const item = queue[currentIndex];
    document.getElementById('s-num').innerText = item.n;
    document.getElementById('s-sym').innerText = item.s;
    document.getElementById('s-ans').innerText = item.e;
    document.getElementById('s-ans').style.display = 'none'; // 隠す
    document.getElementById('study-progress').innerText = `${currentIndex + 1} / ${queue.length}`;
}

function toggleStudyCard() {
    const ans = document.getElementById('s-ans');
    ans.style.display = (ans.style.display === 'none') ? 'block' : 'none';
}

function nextCard() {
    currentIndex++;
    loadStudy();
}

init();
