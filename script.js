const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;
const CIRCUMFERENCE = 2 * Math.PI * 120;

let currentMode = 'work';
let timeLeft = WORK_TIME;
let totalTime = WORK_TIME;
let timerId = null;
let rounds = 0;

const timeEl = document.getElementById('timeDisplay');
const sessionLabel = document.getElementById('sessionLabel');
const ringEl = document.getElementById('ringProgress');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const workBtn = document.getElementById('workModeBtn');
const breakBtn = document.getElementById('breakModeBtn');
const roundsEl = document.getElementById('roundsCount');

function updateDisplay() {
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const formatted = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  timeEl.textContent = formatted;
  document.title = `(${formatted}) ${currentMode === 'work' ? 'Focus' : 'Break'} - Pomodoro`;

  const progress = timeLeft / totalTime;
  const offset = CIRCUMFERENCE * (1 - progress);
  ringEl.style.strokeDashoffset = offset;
}

function switchMode(mode) {
  clearInterval(timerId);
  timerId = null;
  startBtn.textContent = 'Start';
  currentMode = mode;

  if (mode === 'work') {
    workBtn.classList.add('active');
    breakBtn.classList.remove('active');
    sessionLabel.textContent = 'Focus Session';
    document.documentElement.style.setProperty('--current-accent', 'var(--work-accent)');
    document.documentElement.style.setProperty('--current-glow', 'var(--work-glow)');
    totalTime = WORK_TIME;
  } else {
    breakBtn.classList.add('active');
    workBtn.classList.remove('active');
    sessionLabel.textContent = 'Short Break';
    document.documentElement.style.setProperty('--current-accent', 'var(--break-accent)');
    document.documentElement.style.setProperty('--current-glow', 'var(--break-glow)');
    totalTime = BREAK_TIME;
  }

  timeLeft = totalTime;
  updateDisplay();
}

function toggleTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
    startBtn.textContent = 'Resume';
  } else {
    startBtn.textContent = 'Pause';
    timerId = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
      } else {
        clearInterval(timerId);
        timerId = null;
        startBtn.textContent = 'Start';
        playAlertSound();
        if (currentMode === 'work') {
          rounds++;
          roundsEl.textContent = rounds;
          switchMode('break');
        } else {
          switchMode('work');
        }
      }
    }, 1000);
  }
}

function playAlertSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (err) {
    // audio context might require user interaction first
  }
}

startBtn.addEventListener('click', toggleTimer);
resetBtn.addEventListener('click', () => switchMode(currentMode));
workBtn.addEventListener('click', () => switchMode('work'));
breakBtn.addEventListener('click', () => switchMode('break'));

updateDisplay();
