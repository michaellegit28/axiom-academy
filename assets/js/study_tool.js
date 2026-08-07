// Axiom Academy Study Tools Engine
// Flashcards, Quizzes, and Past Questions

// ========== DATA ==========
const flashcards = [
  { q: "What is the SI unit of force?", a: "Newton (N) — 1 N = 1 kg·m/s²" },
  { q: "State Newton's Second Law.", a: "F = ma. Force equals mass times acceleration." },
  { q: "What is the least count of a vernier caliper?", a: "0.01 cm (or 0.1 mm)" },
  { q: "What is the least count of a micrometer screw gauge?", a: "0.01 mm (or 0.001 cm)" },
  { q: "Convert 72 km/h to m/s.", a: "20 m/s (divide km/h by 3.6)" },
  { q: "What is the difference between speed and velocity?", a: "Speed is scalar (magnitude only). Velocity is vector (magnitude + direction)." },
  { q: "What is the dimension of power?", a: "ML²T⁻³ (or kg·m²/s³)" },
  { q: "A body remains at rest or in uniform motion unless acted upon by a force. Which law?", a: "Newton's First Law (Law of Inertia)." },
  { q: "Action and reaction are equal and opposite. Which law?", a: "Newton's Third Law. They act on DIFFERENT bodies." },
  { q: "What is the formula for kinetic energy?", a: "KE = ½mv²" },
  { q: "What is the formula for gravitational potential energy?", a: "PE = mgh" },
  { q: "Define acceleration.", a: "Rate of change of velocity with time. a = (v - u) / t" },
  { q: "What is a null result in an experiment?", a: "An experiment that finds no effect where one was expected. It rules out a hypothesis." },
  { q: "What is the difference between systematic and random error?", a: "Systematic shifts all data one direction (calibration fault). Random scatters symmetrically (statistical noise)." },
  { q: "What is the geometric mean of 100 and 10,000?", a: "1,000. √(100 × 10,000) = √1,000,000 = 1,000." }
];

const quizQuestions = [
  {
    question: "Which of the following is a vector quantity?",
    options: ["Speed", "Distance", "Mass", "Velocity"],
    answer: 3,
    explanation: "Velocity has both magnitude and direction. Speed, distance, and mass are scalars."
  },
  {
    question: "The dimension of power is:",
    options: ["ML²T⁻²", "ML²T⁻³", "MLT⁻²", "ML⁻¹T⁻²"],
    answer: 1,
    explanation: "Power = Work/time = (Force × distance)/time = (MLT⁻² × L)/T = ML²T⁻³."
  },
  {
    question: "A car accelerates uniformly from rest at 2 m/s² for 5 seconds. The distance traveled is:",
    options: ["10 m", "25 m", "50 m", "100 m"],
    answer: 1,
    explanation: "s = ½at² = 0.5 × 2 × 25 = 25 m."
  },
  {
    question: "A ball is thrown vertically upward at 20 m/s. How long until it returns? (g = 10 m/s²)",
    options: ["2 s", "4 s", "5 s", "10 s"],
    answer: 1,
    explanation: "Time up = v/g = 20/10 = 2 s. Time down = 2 s. Total = 4 s."
  },
  {
    question: "A force of 10 N acts on a 2 kg mass. The acceleration is:",
    options: ["0.2 m/s²", "5 m/s²", "12 m/s²", "20 m/s²"],
    answer: 1,
    explanation: "a = F/m = 10/2 = 5 m/s²."
  },
  {
    question: "The least count of a micrometer screw gauge is:",
    options: ["0.1 mm", "0.01 mm", "0.001 mm", "1.0 mm"],
    answer: 1,
    explanation: "A micrometer measures to 0.01 mm precision."
  },
  {
    question: "Which statement is correct according to Newton's Third Law?",
    options: [
      "Action and reaction act on the same body",
      "Action and reaction are equal only when bodies are at rest",
      "Action and reaction are equal and opposite and act on different bodies",
      "Action is always greater than reaction"
    ],
    answer: 2,
    explanation: "Newton's Third Law: equal, opposite, and on DIFFERENT bodies."
  },
  {
    question: "A block of mass 10 kg rests on a rough surface. μₛ = 0.4. Minimum force to move it? (g = 10 m/s²)",
    options: ["4 N", "25 N", "40 N", "100 N"],
    answer: 2,
    explanation: "F_min = μₛmg = 0.4 × 10 × 10 = 40 N."
  }
];

const pastQuestions = [
  {
    exam: "waec",
    topic: "measurements",
    year: "2023",
    text: "Which of the following is a vector quantity?",
    options: ["Speed", "Distance", "Mass", "Velocity"],
    answer: 3,
    explanation: "Velocity has both magnitude and direction, making it a vector. The others are scalars."
  },
  {
    exam: "waec",
    topic: "measurements",
    year: "2022",
    text: "The least count of a micrometer screw gauge is:",
    options: ["0.1 mm", "0.01 mm", "0.001 mm", "1.0 mm"],
    answer: 1,
    explanation: "A micrometer screw gauge measures to 0.01 mm precision."
  },
  {
    exam: "waec",
    topic: "measurements",
    year: "2021",
    text: "Explain the difference between accuracy and precision.",
    options: null,
    answer: null,
    explanation: "Accuracy refers to how close a measurement is to the true value. Precision refers to how reproducible the measurement is. A measurement can be precise but not accurate (systematic error), or accurate but not precise (large random error)."
  },
  {
    exam: "jamb",
    topic: "motion",
    year: "2023",
    text: "A car accelerates uniformly from rest at 2 m/s² for 5 seconds. The distance traveled is:",
    options: ["10 m", "25 m", "50 m", "100 m"],
    answer: 1,
    explanation: "Using s = ut + ½at² with u = 0, a = 2, t = 5: s = 0 + 0.5 × 2 × 25 = 25 m."
  },
  {
    exam: "jamb",
    topic: "motion",
    year: "2022",
    text: "A ball is thrown vertically upward with a velocity of 20 m/s. How long does it take to return to the thrower's hand? (g = 10 m/s²)",
    options: ["2 s", "4 s", "5 s", "10 s"],
    answer: 1,
    explanation: "Time to reach max height: t = v/g = 20/10 = 2 s. Time down = 2 s. Total time = 4 s."
  },
  {
    exam: "jamb",
    topic: "forces",
    year: "2023",
    text: "A force of 10 N acts on a body of mass 2 kg. The acceleration produced is:",
    options: ["0.2 m/s²", "5 m/s²", "12 m/s²", "20 m/s²"],
    answer: 1,
    explanation: "From Newton's Second Law: a = F/m = 10/2 = 5 m/s²."
  },
  {
    exam: "jamb",
    topic: "forces",
    year: "2021",
    text: "A body of mass 5 kg is moving with velocity 10 m/s. A constant force acts for 2 s, after which velocity is 20 m/s. The magnitude of the force is:",
    options: ["12.5 N", "25 N", "50 N", "100 N"],
    answer: 1,
    explanation: "a = (v-u)/t = (20-10)/2 = 5 m/s². F = ma = 5 × 5 = 25 N."
  }
];

// ========== FLASHCARDS ==========
let fcIndex = 0;
let fcFlipped = false;

function renderCard() {
  const card = flashcards[fcIndex];
  document.getElementById('fc-question').textContent = card.q;
  document.getElementById('fc-answer').textContent = card.a;
  document.getElementById('fc-counter').textContent = (fcIndex + 1) + ' / ' + flashcards.length;
  document.getElementById('flashcard').classList.remove('flipped');
  fcFlipped = false;
}

function flipCard() {
  fcFlipped = !fcFlipped;
  document.getElementById('flashcard').classList.toggle('flipped', fcFlipped);
}

function nextCard() {
  fcIndex = (fcIndex + 1) % flashcards.length;
  renderCard();
}

function prevCard() {
  fcIndex = (fcIndex - 1 + flashcards.length) % flashcards.length;
  renderCard();
}

function shuffleCards() {
  for (let i = flashcards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flashcards[i], flashcards[j]] = [flashcards[j], flashcards[i]];
  }
  fcIndex = 0;
  renderCard();
}

// ========== QUIZ ==========
let qzIndex = 0;
let qzScore = 0;
let qzAnswered = false;

function renderQuiz() {
  const q = quizQuestions[qzIndex];
  document.getElementById('quiz-question').textContent = (qzIndex + 1) + '. ' + q.question;
  const optsDiv = document.getElementById('quiz-options');
  optsDiv.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('div');
    btn.className = 'quiz-option';
    btn.textContent = String.fromCharCode(65 + i) + '. ' + opt;
    btn.onclick = () => selectOption(i);
    optsDiv.appendChild(btn);
  });
  document.getElementById('quiz-explanation').classList.remove('show');
  document.getElementById('quiz-explanation').textContent = '';
  qzAnswered = false;
  updateScore();
}

function selectOption(idx) {
  if (qzAnswered) return;
  qzAnswered = true;
  const q = quizQuestions[qzIndex];
  const opts = document.querySelectorAll('.quiz-option');
  opts[idx].classList.add(idx === q.answer ? 'correct' : 'wrong');
  if (idx !== q.answer) opts[q.answer].classList.add('correct');
  if (idx === q.answer) qzScore++;
  const expl = document.getElementById('quiz-explanation');
  expl.textContent = q.explanation;
  expl.classList.add('show');
  updateScore();
}

function nextQuiz() {
  if (qzIndex < quizQuestions.length - 1) {
    qzIndex++;
    renderQuiz();
  } else {
    document.getElementById('quiz-container').innerHTML = 
      '<div class="quiz-score">Quiz Complete! Score: ' + qzScore + ' / ' + quizQuestions.length + '</div>' +
      '<div style="text-align:center;"><button class="fc-btn" onclick="resetQuiz()">Restart Quiz</button></div>';
  }
}

function prevQuiz() {
  if (qzIndex > 0) {
    qzIndex--;
    renderQuiz();
  }
}

function resetQuiz() {
  qzIndex = 0;
  qzScore = 0;
  document.getElementById('quiz-container').innerHTML = 
    '<div class="quiz-card" id="quiz-card"><div class="quiz-question" id="quiz-question"></div><div class="quiz-options" id="quiz-options"></div><div class="quiz-explanation" id="quiz-explanation"></div></div><div class="quiz-nav"><button class="fc-btn" onclick="prevQuiz()">← Prev</button><button class="fc-btn" onclick="nextQuiz()">Next →</button></div>';
  renderQuiz();
}

function updateScore() {
  document.getElementById('quiz-score').textContent = 'Score: ' + qzScore + ' / ' + (qzAnswered ? qzIndex + 1 : qzIndex);
}

// ========== PAST QUESTIONS ==========
function renderPQ(filter) {
  const list = document.getElementById('pq-list');
  list.innerHTML = '';
  pastQuestions.forEach((pq, i) => {
    if (filter !== 'all' && pq.exam !== filter && pq.topic !== filter) return;
    const item = document.createElement('div');
    item.className = 'pq-item';
    let html = '<div class="pq-header"><span class="pq-topic">' + pq.exam.toUpperCase() + ' · ' + pq.topic + '</span><span class="pq-year">' + pq.year + '</span></div>';
    html += '<div class="pq-text">' + pq.text + '</div>';
    if (pq.options) {
      html += '<div class="pq-options">';
      pq.options.forEach((opt, j) => {
        html += '<div class="pq-opt" id="pq-' + i + '-opt-' + j + '" onclick="revealPQ(' + i + ', ' + j + ')">' + String.fromCharCode(65 + j) + '. ' + opt + '</div>';
      });
      html += '</div>';
    }
    html += '<button class="pq-reveal-btn" onclick="showExplanation(' + i + ')">Reveal Answer</button>';
    html += '<div class="pq-explanation" id="pq-expl-' + i + '">' + (pq.options ? 'Correct: ' + String.fromCharCode(65 + pq.answer) + '<br>' : '') + pq.explanation + '</div>';
    item.innerHTML = html;
    list.appendChild(item);
  });
}

function revealPQ(pqIdx, optIdx) {
  const pq = pastQuestions[pqIdx];
  document.querySelectorAll('[id^="pq-' + pqIdx + '-opt-"]').forEach((el, i) => {
    if (i === pq.answer) el.classList.add('reveal-correct');
  });
  showExplanation(pqIdx);
}

function showExplanation(idx) {
  document.getElementById('pq-expl-' + idx).style.display = 'block';
}

function filterPQ(type) {
  document.querySelectorAll('.pq-filter').forEach(f => f.classList.remove('active'));
  event.target.classList.add('active');
  renderPQ(type);
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('flashcard')) renderCard();
  if (document.getElementById('quiz-question')) renderQuiz();
  if (document.getElementById('pq-list')) renderPQ('all');
});
