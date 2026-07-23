const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let width, height;
let stars = [];
let meteors = [];
let hearts = [];

// 歌词：[开始时间, 结束时间, 歌词] — 由 Whisper AI 语音识别自动生成时间戳
const lyrics = [
    [0, 16, '♪'],
    [16, 17.8, '我的心在颤抖'],
    [17.8, 19.9, '是对你心动后'],
    [19.9, 23.8, '留在原地 扑通 扑通'],
    [23.8, 25.6, '好像被你占有'],
    [25.6, 27.6, '被你知晓的通透'],
    [27.6, 30.7, '小鹿乱撞在三重奏'],
    [30.7, 32.9, 'U r My lady'],
    [32.9, 35.0, '表达的爱我随笔'],
    [35.0, 38.8, '这首歌是你爱我的回礼'],
    [38.8, 40.6, '你柔顺的发尾'],
    [40.6, 42.5, '让你的魅力加倍'],
    [42.5, 46.2, '你穿搭 也是我爱的搭配'],
    [46.2, 48.5, '感谢神明让我与你相见'],
    [48.5, 51.2, '相见后我们就相恋'],
    [51.2, 52.5, '我喜上颜开但闭上眼'],
    [52.5, 54.4, '这心跳加快才会更方便'],
    [54.4, 56.2, '我相信神无所不能'],
    [56.2, 58.1, '委派我做你守护神'],
    [58.1, 60.0, '不能你不是 你是'],
    [60.0, 62.0, '你才是这颗心脏的主人'],
    [62.0, 63.5, '快'],
    [63.5, 66.3, '牵住我的手'],
    [66.3, 67.9, '来'],
    [67.9, 69.9, '让你把我守候'],
    [69.9, 71.7, '爱'],
    [71.7, 74.2, '是彼此都拥有'],
    [74.2, 76.0, '我'],
    [76.0, 76.7, '有你就足够'],
    [76.7, 78.7, 'You are my happiness'],
    [78.7, 80.7, '说出 我爱你'],
    [80.7, 82.9, '肉麻的甜言蜜语'],
    [82.9, 84.8, '我听不腻'],
    [84.8, 86.8, 'You are my happiness'],
    [86.8, 88.5, '对你更在意'],
    [88.5, 91.3, '快为我的心脏来洗礼'],
    [91.3, 108, '♪'],
    [108, 109.7, 'U r My lady'],
    [109.7, 111.7, '表达的爱我随笔'],
    [111.7, 114.5, '这首歌是你爱我的回礼'],
    [115.7, 117.5, '你柔顺的发尾'],
    [117.5, 119.4, '让你的魅力加倍'],
    [119.4, 122.5, '你穿搭 也是我爱的搭配'],
    [122.5, 125.3, '感谢神明让我与你相见'],
    [125.3, 127.2, '相见后我们就相恋'],
    [127.2, 129.1, '我喜上颜开但闭上眼'],
    [129.1, 131.1, '这心跳加快才会更方便'],
    [131.1, 132.5, '我相信神无所不能'],
    [133.0, 134.9, '委派我做你守护神'],
    [134.9, 136.8, '不能你不是 你是'],
    [136.8, 138.8, '你才是这颗心脏的主人'],
    [138.8, 140.8, '快'],
    [140.8, 143.1, '牵住我的手'],
    [143.1, 144.8, '来'],
    [144.8, 146.6, '让你把我守候'],
    [146.6, 148.6, '爱'],
    [148.6, 150.2, '是彼此都拥有'],
    [150.2, 152.8, '我'],
    [152.8, 153.5, '有你就足够'],
    [153.5, 155.5, 'You are my happiness'],
    [155.5, 157.6, '说出 我爱你'],
    [157.6, 159.7, '肉麻的甜言蜜语'],
    [159.7, 161.1, '我听不腻'],
    [161.1, 163.3, 'You are my happiness'],
    [163.3, 165.3, '对你更在意'],
    [165.3, 168, '快为我的心脏来洗礼'],
    [168, 170, '♪'],
];

// 歌曲实际结束时间（175秒后是广告音频，不纳入循环）
const SONG_END = 170;

const lyricsBar = document.getElementById('lyricsBar');
const lyricLine = document.getElementById('lyricLine');
let currentLyricIndex = -1;

function updateLyrics(currentTime) {
    // 循环播放时按实际歌曲长度计算
    const loopTime = currentTime % SONG_END;
    let newIndex = 0;
    for (let i = lyrics.length - 1; i >= 0; i--) {
        if (loopTime >= lyrics[i][0]) {
            newIndex = i;
            break;
        }
    }
    if (newIndex !== currentLyricIndex) {
        currentLyricIndex = newIndex;
        // 淡出旧歌词
        lyricLine.classList.add('fade-out');
        lyricLine.classList.remove('fade-in');
        setTimeout(() => {
            lyricLine.textContent = lyrics[newIndex][2];
            lyricLine.classList.remove('fade-out');
            lyricLine.classList.add('fade-in');
        }, 300);
    }
}

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

class Star {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.8 + 0.5;
        this.alpha = Math.random() * 0.6 + 0.2;
        this.blinkSpeed = Math.random() * 0.02 + 0.005;
        this.blinkPhase = Math.random() * Math.PI * 2;
    }
    draw() {
        this.blinkPhase += this.blinkSpeed;
        const a = this.alpha + Math.sin(this.blinkPhase) * 0.15;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 225, 255, ${Math.max(0, a)})`;
        ctx.fill();
    }
}

class Meteor {
    constructor() { this.reset(true); }
    reset(initial = false) {
        this.x = Math.random() * width * 1.2 + width * 0.1;
        this.y = Math.random() * height * 0.4 - 100;
        this.length = Math.random() * 80 + 60;
        this.speed = Math.random() * 4 + 3;
        this.angle = Math.PI / 4 + Math.random() * 0.2;
        this.life = 0;
        this.maxLife = Math.random() * 60 + 40;
        this.delay = initial ? Math.random() * 200 : Math.random() * 400;
    }
    update() {
        if (this.delay > 0) { this.delay--; return; }
        this.x -= this.speed * Math.cos(this.angle);
        this.y += this.speed * Math.sin(this.angle);
        this.life++;
        if (this.life > this.maxLife || this.x < -200 || this.y > height + 200) this.reset();
    }
    draw() {
        if (this.delay > 0) return;
        const progress = this.life / this.maxLife;
        const alpha = progress < 0.2 ? progress / 0.2 : 1 - progress;
        const tailX = this.x + this.length * Math.cos(this.angle);
        const tailY = this.y - this.length * Math.sin(this.angle);
        const gradient = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

class Heart {
    constructor(x, y, burst = false) {
        this.x = x || Math.random() * width;
        this.y = y || height + 30;
        this.size = Math.random() * 12 + 8;
        this.speedY = burst ? Math.random() * -3 - 1 : Math.random() * -1 - 0.3;
        this.speedX = burst ? (Math.random() - 0.5) * 4 : (Math.random() - 0.5) * 0.8;
        this.alpha = 1;
        this.fade = Math.random() * 0.008 + 0.004;
        this.color = `hsl(${Math.random() * 40 + 220}, 90%, ${Math.random() * 20 + 70}%)`;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.04;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotSpeed;
        this.alpha -= this.fade;
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        const s = this.size;
        ctx.moveTo(0, s * 0.3);
        ctx.bezierCurveTo(-s * 0.5, -s * 0.3, -s, s * 0.1, 0, s);
        ctx.bezierCurveTo(s, s * 0.1, s * 0.5, -s * 0.3, 0, s * 0.3);
        ctx.fill();
        ctx.restore();
    }
}

function initBackground() {
    resize();
    stars = [];
    meteors = [];
    for (let i = 0; i < 160; i++) stars.push(new Star());
    for (let i = 0; i < 4; i++) meteors.push(new Meteor());
    animateBackground();
}

function animateBackground() {
    ctx.clearRect(0, 0, width, height);
    stars.forEach(star => star.draw());
    meteors.forEach(meteor => { meteor.update(); meteor.draw(); });
    if (Math.random() < 0.015) hearts.push(new Heart());
    hearts = hearts.filter(h => h.alpha > 0);
    hearts.forEach(h => { h.update(); h.draw(); });
    requestAnimationFrame(animateBackground);
}

window.addEventListener('resize', () => {
    resize();
    stars = [];
    for (let i = 0; i < 160; i++) stars.push(new Star());
});

initBackground();

const scenes = {
    wait: document.getElementById('scene-wait'),
    letter: document.getElementById('scene-letter'),
    choice: document.getElementById('scene-choice'),
    result: document.getElementById('scene-result')
};

function switchScene(name) {
    Object.values(scenes).forEach(s => s.classList.remove('active'));
    scenes[name].classList.add('active');
}

const bgm = document.getElementById('bgm');
let musicStarted = false;

function startMusic() {
    if (musicStarted) return;
    bgm.volume = 0.45;
    bgm.play().catch(() => {});
    musicStarted = true;
    // 显示歌词条
    lyricsBar.classList.add('show');
    // 同步歌词
    bgm.addEventListener('timeupdate', () => {
        updateLyrics(bgm.currentTime);
    });
}

const characterBtn = document.getElementById('characterBtn');
const envelope = document.getElementById('envelope');
const letterPaper = document.getElementById('letterPaper');

characterBtn.addEventListener('click', () => {
    startMusic();
    gsap.to(characterBtn, { scale: 0.6, opacity: 0, duration: 0.6, ease: 'back.in(1.7)' });
    gsap.to('.hint-text', { opacity: 0, y: -20, duration: 0.4 });
    gsap.to('.glow-ring', { opacity: 0, duration: 0.6 });

    setTimeout(() => {
        switchScene('letter');
        gsap.fromTo(envelope,
            { y: -200, opacity: 0, scale: 0.8 },
            { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }
        );
        setTimeout(() => {
            gsap.to(envelope, {
                rotationY: 180,
                duration: 1,
                ease: 'power2.inOut',
                onComplete: showLetter
            });
        }, 1400);
    }, 700);
});

let skipTimeout;

function showLetter() {
    // 用 flexbox 居中，GSAP 只管淡入，不碰 transform 定位
    letterPaper.style.display = 'flex';
    gsap.to(envelope, { opacity: 0, duration: 0.4 });
    gsap.fromTo(letterPaper,
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out' }
    );

    skipTimeout = setTimeout(() => { goToChoice(); }, 10000);
    letterPaper.addEventListener('click', skipLetter, { once: true });
}

function skipLetter() {
    clearTimeout(skipTimeout);
    goToChoice();
}

function goToChoice() {
    gsap.to(letterPaper, {
        opacity: 0, duration: 0.5,
        onComplete: () => { letterPaper.style.display = 'none'; }
    });
    setTimeout(() => {
        switchScene('choice');
        gsap.fromTo('.choice-box', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 });
    }, 550);
}

const btnYes = document.getElementById('btnYes');
const btnNo = document.getElementById('btnNo');
const modal = document.getElementById('modal');
const btnModalOk = document.getElementById('btnModalOk');
const resultTitle = document.getElementById('resultTitle');
const resultText = document.getElementById('resultText');
const bigHeart = document.querySelector('.big-heart');

btnYes.addEventListener('click', () => {
    for (let i = 0; i < 40; i++) hearts.push(new Heart(width / 2, height / 2, true));
    switchScene('result');
    resultTitle.textContent = '谢谢你';
    resultText.textContent = '我会把这句话刻进星星里。';
    bigHeart.style.color = '#a5b4ff';
    bigHeart.style.filter = 'drop-shadow(0 0 30px rgba(165, 180, 255, 0.7))';
    animateResult();
});

btnNo.addEventListener('click', () => { modal.classList.add('show'); });

btnModalOk.addEventListener('click', () => {
    modal.classList.remove('show');
    switchScene('result');
    resultTitle.textContent = '我会继续等';
    resultText.textContent = '直到你愿意再次看向我的那天。';
    bigHeart.style.color = '#d4a5ff';
    bigHeart.style.filter = 'drop-shadow(0 0 30px rgba(212, 165, 255, 0.6))';
    animateResult();
});

function animateResult() {
    gsap.fromTo('#resultContent', { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' });
    gsap.fromTo('#btnReplay', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.5 });
}

const btnReplay = document.getElementById('btnReplay');
btnReplay.addEventListener('click', () => {
    gsap.set(envelope, { rotationY: 0, opacity: 1, scale: 1, y: 0 });
    letterPaper.style.display = 'none';
    gsap.set(letterPaper, { opacity: 0, scale: 1 });
    gsap.set(characterBtn, { scale: 1, opacity: 1 });
    gsap.set('.hint-text', { opacity: 1, y: 0 });
    gsap.set('.glow-ring', { opacity: 0.6 });
    // 重置歌词
    lyricsBar.classList.remove('show');
    currentLyricIndex = -1;
    lyricLine.textContent = '';
    switchScene('wait');
});

window.addEventListener('load', () => {
    gsap.fromTo('body', { opacity: 0 }, { opacity: 1, duration: 1.2 });
});
