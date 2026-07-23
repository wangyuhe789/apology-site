const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let width, height;
let stars = [];
let meteors = [];
let hearts = [];

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
    switchScene('wait');
});

window.addEventListener('load', () => {
    gsap.fromTo('body', { opacity: 0 }, { opacity: 1, duration: 1.2 });
});
