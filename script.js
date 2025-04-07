let soundEnabled;
const soundBtn = document.getElementById('soundBtn');

const sounds = {
  click: document.getElementById('clickSound'),
  win:   document.getElementById('winSound'),
  loss:  document.getElementById('lossSound'),
  rules: document.getElementById('rulesSound'),
  bgm:   document.getElementById('bgm')
};


Object.values(sounds).forEach(s => s.volume = 0.3);

sounds.bgm.volume = 0.2;


function setupSoundButton() {
  soundEnabled = true;
  soundBtn.textContent = '🔇 MUTE';
  soundBtn.style.cssText = `
    position: fixed;
    top: 10px;
    left: 10px;
    z-index: 1000;
    font-family: 'Press Start 2P';
    padding: 5px 10px;
    background: #00cc66;
    color: white;
    border: 3px solid black;
    cursor: pointer;
    box-shadow: 3px 3px 0 black;
  `;

  playBGM();

  soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;

    if (soundEnabled) {
      soundBtn.textContent = '🔇 MUTE';
      soundBtn.style.background = '#00cc66';
      playSound('click');
      playBGM();
    } else {
      soundBtn.textContent = '🔈 UNMUTE';
      soundBtn.style.background = '#ff3355';
      pauseBGM();
    }
  });
}


function playSound(type) {
  if (!soundEnabled) return;
  const s = sounds[type];
  if (!s) return;
  try {
    s.currentTime = 0;
    s.play().catch(e => {
      console.warn('Audio error:', e);
      playFallbackSound(type);
    });
  } catch {
    playFallbackSound(type);
  }
}


function playBGM() {
  if (!soundEnabled) return;
  try {
    sounds.bgm.currentTime = 0;
    sounds.bgm.play().catch(e => console.warn('BGM play failed:', e));
  } catch {
    console.warn('BGM play error');
  }
}


function pauseBGM() {
  try {
    sounds.bgm.pause();
  } catch {
    console.warn('BGM pause error');
  }
}


function playFallbackSound(type) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  gain.gain.value = 0.1;

  switch (type) {
    case 'win':
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);      
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2); 
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.4); 
      break;
    case 'loss':
      osc.frequency.setValueAtTime(220, ctx.currentTime);         
      osc.frequency.setValueAtTime(174.61, ctx.currentTime + 0.2); 
      osc.frequency.setValueAtTime(130.81, ctx.currentTime + 0.4); 
      break;
    default:
      osc.frequency.value = 440; // A4
  }

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.5);
}

//Password Validation 

function containsSequential(password) {
  const pw = password.toLowerCase();
  for (let i = 0; i < pw.length - 2; i++) {
    const a = pw.charCodeAt(i),
          b = pw.charCodeAt(i + 1),
          c = pw.charCodeAt(i + 2);
    if (b === a + 1 && c === b + 1) return true;
  }
  return false;
}

function isStrongPassword(password) {
  if (password.length < 10) return false;
  let hasUpper = false, hasLower = false, hasDigit = false, hasSpecial = false;
  for (let ch of password) {
    if (/[A-Z]/.test(ch)) hasUpper = true;
    else if (/[a-z]/.test(ch)) hasLower = true;
    else if (/[0-9]/.test(ch)) hasDigit = true;
    else if (/[_\.@*]/.test(ch)) hasSpecial = true;
  }
  return hasUpper && hasLower && hasDigit && hasSpecial && !containsSequential(password);
}

function checkPassword() {
  playSound('click');
  const pw = document.getElementById('password').value;
  const result = document.getElementById('result');

  if (isStrongPassword(pw)) {
    result.textContent = 'ACCESS GRANTED! STRONG PASSWORD DETECTED!';
    result.style.color = '#00ff00';
    result.style.textShadow = '0 0 5px #00ff00';
    playSound('win');
  } else {
    result.textContent = 'WEAK PASSWORD! TRY AGAIN HACKER!';
    result.style.color = '#ff3355';
    result.style.textShadow = '0 0 5px #ff3355';
    playSound('loss');
  }
}

function tryAgain() {
  playSound('click');
  document.getElementById('password').value = '';
  document.getElementById('result').textContent = '';
}

// ربط أزرار واجهة المستخدم
function initializeEventListeners() {
  document.querySelector('.rules-btn').addEventListener('click', () => {
    playSound('rules');
    document.querySelector('.rules-overlay').classList.add('active');
  });
  document.querySelector('.close-rules').addEventListener('click', () => {
    playSound('click');
    document.querySelector('.rules-overlay').classList.remove('active');
  });
  document.getElementById('checkBtn').addEventListener('click', checkPassword);
  document.getElementById('resetBtn').addEventListener('click', tryAgain);
}

// بدء التهيئة بعد تحميل DOM
document.addEventListener('DOMContentLoaded', () => {
  setupSoundButton();
  initializeEventListeners();
});
