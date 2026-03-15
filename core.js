// ===== CONSTANTS =====
var C = {
    GRAVITY: 1000, JUMP_VEL: -620, PLAYER_SPEED: 280, MAX_HP: 3, P_W: 56, P_H: 86, PR_W: 44, PR_H: 68,
    ENEMY_SPEED: 100, ENEMY_PATROL: 150, BOSS_SPEED: 150, BOSS_HP: 20, BOOST_DUR: 5000, BOOST_MULT: 2,
    DIALOG_DUR: 3000, LEVELS: 5, PLAYER_NAME: 'Aşkım', PRINCESS_NAME: 'Hanım'
};

// ===== SOUND SYSTEM (Web Audio API - no files needed) =====
var SND = {
    ctx: null, unlocked: false, _musicTimer: null, _musicPlaying: null,
    init: function () { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } },
    unlock: function () { if (!this.unlocked && this.ctx) { this.ctx.resume(); this.unlocked = true; } },
    tone: function (f, d, tp, v, dl) {
        if (!this.ctx) this.init(); if (!this.ctx) return;
        var t = this.ctx.currentTime + (dl || 0);
        var o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = tp || 'square'; o.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(v || 0.15, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
        o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + d);
    },
    jump: function () { this.tone(350, 0.08, 'square', 0.12); this.tone(520, 0.1, 'square', 0.1, 0.06); },
    swing: function () { this.tone(180, 0.1, 'sawtooth', 0.12); this.tone(350, 0.06, 'triangle', 0.08, 0.05); },
    hit: function () { this.tone(120, 0.2, 'sawtooth', 0.2); this.tone(80, 0.15, 'square', 0.15, 0.1); },
    collect: function () { this.tone(780, 0.08, 'sine', 0.15); this.tone(1100, 0.12, 'sine', 0.12, 0.08); },
    checkpoint: function () { this.tone(523, 0.1, 'sine', 0.15); this.tone(659, 0.1, 'sine', 0.12, 0.1); this.tone(784, 0.15, 'sine', 0.12, 0.2); },
    die: function () { this.tone(350, 0.15, 'square', 0.2); this.tone(180, 0.25, 'square', 0.18, 0.12); this.tone(90, 0.3, 'sawtooth', 0.15, 0.3); },
    bosshit: function () { this.tone(100, 0.15, 'sawtooth', 0.2); this.tone(200, 0.1, 'square', 0.12, 0.08); },
    win: function () { this.tone(523, 0.12, 'sine', 0.15); this.tone(659, 0.12, 'sine', 0.12, 0.12); this.tone(784, 0.12, 'sine', 0.12, 0.24); this.tone(1047, 0.3, 'sine', 0.15, 0.36); },
    stomp: function () { this.tone(250, 0.08, 'square', 0.15); this.tone(400, 0.06, 'square', 0.1, 0.05); },
    door: function () { this.tone(440, 0.1, 'sine', 0.12); this.tone(554, 0.1, 'sine', 0.1, 0.1); this.tone(659, 0.15, 'sine', 0.12, 0.2); },
    stopMusic: function () {
        if (this._musicTimer) { clearInterval(this._musicTimer); this._musicTimer = null; }
        this._musicPlaying = null;
    },
    playLevelMusic: function () {
        if (this._musicPlaying === 'level') return;
        this.stopMusic();
        this._musicPlaying = 'level';
        var s = this, v = 0.06;
        var melody = [
            [523, 0.14], [659, 0.14], [784, 0.14], [880, 0.22], [784, 0.14], [659, 0.14],
            [523, 0.14], [587, 0.14], [659, 0.14], [523, 0.22], [440, 0.14], [494, 0.14],
            [523, 0.28], [0, 0.14],
            [659, 0.14], [784, 0.14], [880, 0.14], [1047, 0.22], [880, 0.14], [784, 0.14],
            [659, 0.14], [587, 0.14], [523, 0.14], [659, 0.22], [523, 0.14], [494, 0.14],
            [440, 0.28], [0, 0.14]
        ];
        var bass = [
            [131, 0.28], [165, 0.28], [175, 0.28], [220, 0.28],
            [131, 0.28], [165, 0.28], [175, 0.28], [220, 0.28]
        ];
        var playLoop = function () {
            if (s._musicPlaying !== 'level') return;
            var t = 0;
            for (var i = 0; i < melody.length; i++) {
                if (melody[i][0] > 0) s.tone(melody[i][0], melody[i][1] * 0.9, 'square', v, t);
                t += melody[i][1];
            }
            var bt = 0;
            for (var j = 0; j < bass.length; j++) {
                s.tone(bass[j][0], bass[j][1] * 0.85, 'triangle', v * 0.8, bt);
                bt += bass[j][1];
            }
        };
        playLoop();
        var totalDur = 0; for (var i = 0; i < melody.length; i++) totalDur += melody[i][1];
        this._musicTimer = setInterval(playLoop, totalDur * 1000);
    },
    playBossMusic: function () {
        if (this._musicPlaying === 'boss') return;
        this.stopMusic();
        this._musicPlaying = 'boss';
        var s = this, v = 0.07;
        var melody = [
            [165, 0.2], [156, 0.2], [147, 0.2], [139, 0.3], [147, 0.2], [156, 0.2],
            [165, 0.3], [0, 0.1], [196, 0.2], [185, 0.2], [175, 0.2], [165, 0.3],
            [139, 0.2], [147, 0.2], [131, 0.4], [0, 0.1]
        ];
        var playLoop = function () {
            if (s._musicPlaying !== 'boss') return;
            var t = 0;
            for (var i = 0; i < melody.length; i++) {
                if (melody[i][0] > 0) {
                    s.tone(melody[i][0], melody[i][1] * 0.9, 'sawtooth', v, t);
                    s.tone(melody[i][0] * 0.5, melody[i][1] * 0.85, 'triangle', v * 0.6, t);
                }
                t += melody[i][1];
            }
        };
        playLoop();
        var totalDur = 0; for (var i = 0; i < melody.length; i++) totalDur += melody[i][1];
        this._musicTimer = setInterval(playLoop, totalDur * 1000);
    }
};

// ===== MOBILE CONTROLS =====
// Global touch state - tracks all active touches for multitouch support
var MOBILE_TOUCH = {
    activeButtons: {},
    register: function(id, btn) { this.activeButtons[id] = btn; },
    unregister: function(id) { delete this.activeButtons[id]; }
};

function setupMobile(sc) {
    var w = sc.cameras.main.width;
    var h = sc.cameras.main.height;

    // Button sizes - scale with screen size for mobile
    var btnSize = Math.max(60, Math.min(80, h * 0.1));
    var btnY = h - btnSize * 0.6 - 8;
    var pad = 10;

    sc.mL = false; sc.mR = false;

    // ── Left / Right ──────────────────────────────────────────────
    function makeNavBtn(x, label, onDown, onUp) {
        var bg = sc.add.rectangle(x, btnY, btnSize, btnSize, 0x000000, 0.55)
            .setScrollFactor(0).setDepth(300)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive({ useHandCursor: true });

        sc.add.text(x, btnY, label, {
            font: 'bold ' + Math.round(btnSize * 0.42) + 'px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

        bg.on('pointerdown', function (ptr) {
            SND.unlock(); onDown();
            MOBILE_TOUCH.register(ptr.id, bg);
        });
        bg.on('pointerup',  function (ptr) { MOBILE_TOUCH.unregister(ptr.id); onUp(); });
        bg.on('pointerout', function (ptr) { MOBILE_TOUCH.unregister(ptr.id); onUp(); });
        return bg;
    }

    makeNavBtn(pad + btnSize * 0.5,               '◀', function(){ sc.mL = true;  }, function(){ sc.mL = false; });
    makeNavBtn(pad + btnSize * 0.5 + btnSize + 8, '▶', function(){ sc.mR = true;  }, function(){ sc.mR = false; });

    // ── Jump ──────────────────────────────────────────────────────
    var jumpX = w - pad - btnSize * 0.5;
    var jumpBg = sc.add.rectangle(jumpX, btnY, btnSize, btnSize, 0x1a5276, 0.75)
        .setScrollFactor(0).setDepth(300)
        .setStrokeStyle(2, 0x5dade2)
        .setInteractive({ useHandCursor: true });
    sc.add.text(jumpX, btnY, '⬆', {
        font: 'bold ' + Math.round(btnSize * 0.42) + 'px Arial', fill: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    jumpBg.on('pointerdown', function () { SND.unlock(); sc.doJump(); });

    // ── Attack ────────────────────────────────────────────────────
    var atkX = w - pad - btnSize * 0.5 - btnSize - 8;
    var atkBg = sc.add.rectangle(atkX, btnY, btnSize, btnSize, 0x7b241c, 0.75)
        .setScrollFactor(0).setDepth(300)
        .setStrokeStyle(2, 0xf1948a)
        .setInteractive({ useHandCursor: true });
    sc.add.text(atkX, btnY, '⚔️', {
        font: Math.round(btnSize * 0.38) + 'px Arial', fill: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    atkBg.on('pointerdown', function () { SND.unlock(); sc.doAttack(); });

    // ── Enable true multitouch in Phaser ─────────────────────────
    if (sc.input && sc.input.addPointer) {
        sc.input.addPointer(3); // support up to 5 simultaneous touches
    }
}

// ===== HELPER: Dialog =====
function showDlg(sc, txt, who, dur) {
    if (sc._dlg) sc._dlg.destroy(true);
    var cx = sc.cameras.main.centerX, cy = sc.cameras.main.centerY - 130;
    var bg = sc.add.rectangle(cx, cy, Math.min(400, txt.length * 8 + 80), 55, 0x000000, 0.88).setScrollFactor(0).setDepth(500).setStrokeStyle(2, 0xFFD700);
    var t = sc.add.text(cx, cy + 2, txt, { font: '14px Segoe UI', fill: '#fff', align: 'center', wordWrap: { width: 370 } }).setOrigin(0.5).setScrollFactor(0).setDepth(501);
    var n = sc.add.text(cx, cy - 22, who, { font: 'bold 12px Segoe UI', fill: '#FFD700' }).setOrigin(0.5).setScrollFactor(0).setDepth(501);
    sc._dlg = sc.add.group([bg, t, n]);
    sc.time.delayedCall(dur || C.DIALOG_DUR, function () { if (sc._dlg) { sc._dlg.destroy(true); sc._dlg = null; } });
}

// ===== BOOT SCENE =====
class BootScene extends Phaser.Scene {
    constructor() { super({ key: 'Boot' }); }
    preload() {
        this.load.on('loaderror', function () { });
        this.load.image('askim_face', './askim_face.png');
        this.load.image('hanim_face', './hanim_face.png');
        this.load.image('couple_photo', './couple_photo.png');
    }
    create() {
        SND.init();
        var g = this.make.graphics({ add: false });
        // Player (human)
        g.fillStyle(0xFFCBA4); g.fillCircle(20, 12, 12);
        g.fillStyle(0xE63946); g.fillRoundedRect(8, 24, 24, 22, 3);
        g.fillStyle(0xE63946); g.fillRect(2, 26, 7, 14); g.fillRect(31, 26, 7, 14);
        g.fillStyle(0xFFCBA4); g.fillCircle(5, 42, 4); g.fillCircle(35, 42, 4);
        g.fillStyle(0x1D3557); g.fillRect(10, 46, 9, 14); g.fillRect(21, 46, 9, 14);
        g.fillStyle(0x333); g.fillRect(10, 58, 9, 4); g.fillRect(21, 58, 9, 4);
        g.generateTexture('player', 40, 62);
        // Princess
        g.clear(); g.fillStyle(0xFFCBA4); g.fillCircle(16, 10, 10);
        g.fillStyle(0xFF69B4); g.fillRoundedRect(7, 20, 18, 16, 3);
        g.fillStyle(0xFF69B4); g.fillRect(2, 22, 6, 10); g.fillRect(24, 22, 6, 10);
        g.fillStyle(0xFFCBA4); g.fillCircle(4, 34, 3); g.fillCircle(27, 34, 3);
        g.fillStyle(0xFF69B4); g.fillTriangle(5, 36, 27, 36, 16, 50);
        g.generateTexture('princess', 32, 50);
        // Boss (big)
        g.clear(); g.fillStyle(0x3A3A3A); g.fillRoundedRect(0, 0, 100, 100, 8);
        g.fillStyle(0x555); g.fillRect(10, 60, 80, 35);
        g.fillStyle(0xFF0000, 0.9); g.fillCircle(30, 28, 12); g.fillCircle(70, 28, 12);
        g.fillStyle(0xFF4444); g.fillCircle(30, 28, 6); g.fillCircle(70, 28, 6);
        g.fillStyle(0x777); g.fillRect(35, 50, 30, 15);
        g.fillStyle(0x444); g.fillRect(3, 15, 18, 30); g.fillRect(79, 15, 18, 30);
        g.fillStyle(0xAAA); g.fillRect(40, 95, 20, 12);
        g.fillStyle(0xFF6600); g.fillTriangle(42, 107, 58, 107, 50, 118);
        g.generateTexture('boss', 100, 118);
        // MiniBoss
        g.clear(); g.fillStyle(0x6C757D); g.fillRoundedRect(0, 0, 40, 40, 5);
        g.fillStyle(0x00FF88); g.fillCircle(12, 14, 5); g.fillCircle(28, 14, 5);
        g.lineStyle(2, 0x00FF88); g.beginPath(); g.arc(20, 28, 6, 0, Math.PI); g.strokePath();
        g.generateTexture('miniboss', 40, 40);
        // Mushroom enemy (Mario-style)
        g.clear(); g.fillStyle(0xCC3333); g.fillCircle(15, 8, 13);
        g.fillStyle(0xFFFFFF); g.fillCircle(8, 5, 3); g.fillCircle(20, 4, 4); g.fillCircle(14, 10, 2);
        g.fillStyle(0xFFEBCD); g.fillRect(7, 18, 16, 10);
        g.fillStyle(0x222); g.fillCircle(11, 21, 2); g.fillCircle(19, 21, 2);
        g.fillStyle(0x8B4513); g.fillRect(6, 27, 7, 5); g.fillRect(17, 27, 7, 5);
        g.generateTexture('mushroom', 30, 32);
        // Spike
        g.clear(); g.fillStyle(0x666);
        for (var i = 0; i < 4; i++) { g.fillTriangle(i * 12, 24, (i * 12) + 6, 0, (i * 12) + 12, 24); }
        g.fillStyle(0x888);
        for (var i = 0; i < 4; i++) { g.fillTriangle(i * 12 + 1, 24, (i * 12) + 6, 4, (i * 12) + 11, 24); }
        g.generateTexture('spike', 48, 24);
        // Platform
        g.clear(); g.fillStyle(0x8B5E3C); g.fillRect(0, 0, 100, 20);
        g.fillStyle(0x6B3F1F); g.fillRect(0, 16, 100, 4); g.fillStyle(0xA0724B); g.fillRect(0, 0, 100, 3);
        g.generateTexture('platform', 100, 20);
        // Heart
        g.clear(); g.fillStyle(0xFF1744); g.fillCircle(8, 6, 6); g.fillCircle(18, 6, 6); g.fillTriangle(2, 8, 24, 8, 13, 22);
        g.generateTexture('heart', 26, 24);
        // Rocket
        g.clear(); g.fillStyle(0xFFD600); g.fillCircle(12, 12, 12); g.fillStyle(0xFF6D00); g.fillTriangle(12, 2, 6, 16, 18, 16);
        g.generateTexture('rocket', 25, 25);
        // Fire
        g.clear(); g.fillStyle(0xFF4500); g.fillTriangle(15, 0, 0, 30, 30, 30);
        g.fillStyle(0xFF6600); g.fillTriangle(15, 5, 5, 28, 25, 28);
        g.fillStyle(0xFFFF00); g.fillTriangle(15, 12, 8, 26, 22, 26);
        g.generateTexture('fire', 30, 30);
        // Poison water
        g.clear(); g.fillStyle(0x00FF66, 0.7); g.fillRect(0, 5, 50, 15);
        g.fillStyle(0x00CC44, 0.5); g.fillCircle(10, 5, 8); g.fillCircle(25, 5, 8); g.fillCircle(40, 5, 8);
        g.generateTexture('water', 50, 20);
        // Slash
        g.clear(); g.lineStyle(4, 0xFFFFFF, 0.9); g.beginPath(); g.arc(5, 20, 28, -0.8, 0.8); g.strokePath();
        g.lineStyle(2, 0xAAAAFF, 0.7); g.beginPath(); g.arc(5, 20, 24, -0.6, 0.6); g.strokePath();
        g.fillStyle(0xFFFFFF, 0.4); g.fillTriangle(10, 0, 35, 15, 10, 35);
        g.generateTexture('slash', 40, 45);
        // Sword icon (for UI button)
        g.clear();
        g.fillStyle(0xCCCCCC); g.fillRect(17, 0, 5, 26);
        g.fillStyle(0xFFFFFF); g.fillRect(18, 0, 2, 24);
        g.fillStyle(0x8B4513); g.fillRect(11, 25, 17, 5);
        g.fillStyle(0x654321); g.fillRect(16, 30, 7, 10);
        g.fillStyle(0xFFD700); g.fillCircle(19, 42, 3);
        g.generateTexture('sword_icon', 40, 45);
        // Door (pink)
        g.clear(); g.fillStyle(0xFF69B4); g.fillRoundedRect(0, 0, 40, 65, 5);
        g.fillStyle(0xFF1493); g.fillRoundedRect(4, 4, 32, 57, 3);
        g.fillStyle(0xFFD700); g.fillCircle(30, 32, 4);
        g.generateTexture('door', 40, 65);
        // Projectile
        g.clear(); g.fillStyle(0xFF6600); g.fillCircle(8, 8, 8); g.fillStyle(0xFFAA00); g.fillCircle(8, 8, 4);
        g.generateTexture('projectile', 16, 16);
        // Checkpoint flag
        g.clear(); g.fillStyle(0xFFD700); g.fillRect(0, 0, 4, 40);
        g.fillStyle(0xFF1493); g.fillTriangle(4, 0, 28, 10, 4, 20);
        g.generateTexture('flag', 28, 40);
        g.destroy();
        // Animations
        var a = [['player_idle', 'player'], ['player_run', 'player'], ['player_jump', 'player'],
        ['player_attack', 'player'], ['player_hurt', 'player'], ['princess_idle', 'princess'],
        ['princess_happy', 'princess'], ['boss_hit', 'boss'], ['boss_die', 'boss'],
        ['miniboss_hit', 'miniboss'], ['miniboss_die', 'miniboss']];
        for (var i = 0; i < a.length; i++) {
            if (!this.anims.exists(a[i][0])) this.anims.create({ key: a[i][0], frames: [{ key: a[i][1] }], frameRate: 10, repeat: -1 });
        }
        this.scene.start('Intro');
    }
}

// ===== INTRO SCENE =====
class IntroScene extends Phaser.Scene {
    constructor() { super({ key: 'Intro' }); }
    create() {
        var w = this.cameras.main.width, h = this.cameras.main.height;
        this.add.rectangle(w / 2, h / 2, w, h, 0x0a0e27);
        for (var i = 0; i < 50; i++) {
            var s = this.add.circle(Phaser.Math.Between(0, w), Phaser.Math.Between(0, h), Phaser.Math.Between(1, 3), 0xffffff, Phaser.Math.FloatBetween(0.3, 1));
            this.tweens.add({ targets: s, alpha: 0.1, duration: Phaser.Math.Between(800, 2000), yoyo: true, repeat: -1 });
        }
        for (var i = 0; i < 10; i++) {
            var hx = Phaser.Math.Between(30, w - 30);
            var ht = this.add.text(hx, Phaser.Math.Between(h + 10, h + 150), '❤️', { font: Phaser.Math.Between(16, 28) + 'px Arial' }).setAlpha(0.4);
            this.tweens.add({ targets: ht, y: -40, duration: Phaser.Math.Between(4000, 7000), repeat: -1, delay: Phaser.Math.Between(0, 2500) });
        }
        var t1 = this.add.text(w / 2, h * 0.13, 'Onu Geri Alacağım', { font: 'bold 36px Segoe UI', fill: '#FF69B4' }).setOrigin(0.5);
        this.tweens.add({ targets: t1, scaleX: 1.05, scaleY: 1.05, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.add.text(w / 2, h * 0.23, 'Bir Aşk Hikâyesi 💕', { font: 'italic 20px Segoe UI', fill: '#FFD700' }).setOrigin(0.5);
        this.add.text(w / 2, h * 0.35, '✨ Bu oyun sadece bir kişi için yapıldı. ✨', { font: '18px Segoe UI', fill: '#E0E0FF', align: 'center', wordWrap: { width: w * 0.85 } }).setOrigin(0.5);
        var pc = this.add.image(w / 2 - 55, h * 0.50, 'player').setDisplaySize(56, 86);
        var pr = this.add.image(w / 2 + 55, h * 0.50, 'princess').setDisplaySize(44, 68);
        if (this.textures.exists('askim_face')) this.add.image(pc.x, pc.y - 30, 'askim_face').setDisplaySize(30, 30);
        if (this.textures.exists('hanim_face')) this.add.image(pr.x, pr.y - 22, 'hanim_face').setDisplaySize(24, 24);
        this.tweens.add({ targets: pc, y: pc.y - 8, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.tweens.add({ targets: pr, y: pr.y - 8, duration: 1400, yoyo: true, repeat: -1, delay: 300, ease: 'Sine.easeInOut' });
        this.add.text(w / 2, h * 0.48, '❤️', { font: '24px Arial' }).setOrigin(0.5);
        var bb = this.add.rectangle(w / 2, h * 0.70, 220, 50, 0xFF1493).setInteractive({ useHandCursor: true }).setStrokeStyle(3, 0xFFD700);
        this.add.text(w / 2, h * 0.70, '🎮 Oyunu Başlat', { font: 'bold 20px Segoe UI', fill: '#fff' }).setOrigin(0.5);
        this.tweens.add({ targets: bb, scaleX: 1.06, scaleY: 1.06, duration: 900, yoyo: true, repeat: -1 });
        bb.on('pointerover', function () { bb.setFillStyle(0xFF69B4); });
        bb.on('pointerout', function () { bb.setFillStyle(0xFF1493); });
        bb.on('pointerdown', function () { SND.unlock(); this.scene.start('Tutorial'); }.bind(this));
        this.add.text(w / 2, h * 0.88, '❤️ Seni her zaman seveceğim ❤️', { font: '13px Segoe UI', fill: '#666' }).setOrigin(0.5);
    }
}

// ===== TUTORIAL SCENE =====
class TutorialScene extends Phaser.Scene {
    constructor() { super({ key: 'Tutorial' }); }
    create() {
        var w = this.cameras.main.width, h = this.cameras.main.height;
        this.add.rectangle(w / 2, h / 2, w, h, 0x1a1a2e);
        this.add.text(w / 2, h * 0.06, '📖 Nasıl Oynanır?', { font: 'bold 26px Segoe UI', fill: '#FFD700' }).setOrigin(0.5);
        var items = [
            ['◀ ▶  veya  A / D', 'Sağa sola hareket', '#4FC3F7'],
            ['⬆  veya  W / Space', 'Zıplama', '#4FC3F7'],
            ['⚔️  veya  X tuşu', 'Kılıç saldırısı', '#FF5252'],
            ['❤️ Kalpler', 'Topla → Can yenile', '#FF1744'],
            ['🚀 Roket', 'Topla → Geçici hız artışı', '#FFD600'],
            ['🔥 Ateş / 💧 Zehirli Su', 'DOKUNMA! Can kaybedersin', '#FF6D00'],
            ['📌 Dikenleri', 'Üstüne basma! Can gider', '#999'],
            ['🍄 Mantarlar', 'Düşmanlar! Kılıçla yen', '#CC3333'],
            ['🚪 Pembe Kapı', 'Bölümü geçmek için temas et', '#FF69B4'],
            ['👾 Mini Bosslar', 'Her biri farklı savaşır!', '#B388FF']
        ];
        for (var i = 0; i < items.length; i++) {
            var y = h * 0.15 + i * (h * 0.07);
            this.add.text(w * 0.08, y, items[i][0], { font: 'bold 13px Segoe UI', fill: items[i][2] });
            this.add.text(w * 0.52, y, items[i][1], { font: '13px Segoe UI', fill: '#ccc' });
        }
        this.add.text(w / 2, h * 0.84, '🎯 Amacın: Hanım\'ı Küslük-9000\'den kurtar!', { font: 'bold 15px Segoe UI', fill: '#FF69B4', wordWrap: { width: w * 0.8 } }).setOrigin(0.5);
        var bb = this.add.rectangle(w / 2, h * 0.93, 180, 42, 0xFF1493).setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0xFFD700);
        this.add.text(w / 2, h * 0.93, '▶ Başla!', { font: 'bold 20px Segoe UI', fill: '#fff' }).setOrigin(0.5);
        bb.on('pointerdown', function () { SND.unlock(); this.scene.start('Level', { level: 1 }); }.bind(this));
    }
}
