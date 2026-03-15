// ===== LEVEL DATA =====
var BOSS_NAMES = { misunderstanding: 'Yanlış Anlama', mistake: 'Hata', pride: 'Gurur', stubbornness: 'İnat' };
var BOSS_MSGS = { misunderstanding: 'Bazen konuşmak her şeyi çözer.', mistake: 'Hata yapmak insan olmaktır.', pride: 'Gurur kırılmaya değer değildir.', stubbornness: 'İnat kalpten daha güçsüz.' };
var MB_CFG = {
    misunderstanding: { hp: 4, spd: 130, sz: 44, beh: 'charge', intro: 'Beni anlayamazsın!' },
    mistake: { hp: 3, spd: 110, sz: 40, beh: 'jump', intro: 'Herkes hata yapar!' },
    pride: { hp: 5, spd: 60, sz: 50, beh: 'shoot', intro: '' },
    stubbornness: { hp: 6, spd: 80, sz: 48, beh: 'patrol', intro: 'Asla pes etmem!' }
};
var LD = [
    {
        w: 8000, bg: 0x87CEEB, name: 'Tanışma Yolu', cut: true,
        mb: [[1800, 'misunderstanding'], [4500, 'mistake']],
        mush: [800, 1200, 2500, 3200, 4000, 5200, 6000, 6800],
        spikes: [2800, 5800], fires: [3500, 5000], waters: [4200], gaps: [3000, 5500],
        hearts: [1600, 3800, 5500, 7000], rk: 4800, cps: [2000, 4000, 6000]
    },
    {
        w: 8000, bg: 0xC19A6B, name: 'İlk Zorluklar',
        mb: [[2500, 'pride'], [5500, 'stubbornness']],
        mush: [600, 1000, 1500, 2000, 3200, 4000, 4800, 5200, 6200, 7000],
        spikes: [1800, 3800, 5000, 6500], fires: [2200, 4500, 6000], waters: [3500, 5800], gaps: [2800, 4200, 6200],
        hearts: [1200, 3000, 5000, 7200], rk: 4000, cps: [2000, 4000, 6500]
    },
    {
        w: 14000, bg: 0x2F4F4F, name: 'Engeller ve Mini Boss',
        mb: [[3000, 'misunderstanding'], [6500, 'mistake'], [10000, 'pride']],
        mush: [800, 1500, 2200, 3800, 4500, 5200, 6000, 7500, 8200, 9000, 10800, 11500, 12200],
        spikes: [2000, 4000, 5800, 7800, 9500, 11000, 13000], fires: [2500, 5000, 7000, 9200, 11500], waters: [3500, 6500, 8500, 10500], gaps: [2800, 5500, 8000, 10000, 12500],
        hearts: [1800, 4200, 6800, 9500, 12000], rk: 8000, cps: [2500, 5000, 7500, 10000, 12500]
    },
    {
        w: 14000, bg: 0x1a1a2e, name: 'Kovalamaca',
        mb: [[2500, 'stubbornness'], [6000, 'misunderstanding'], [9500, 'mistake'], [12000, 'pride']],
        mush: [700, 1300, 2000, 3500, 4200, 5000, 6800, 7500, 8500, 9000, 10500, 11200, 12800],
        spikes: [1500, 3200, 4800, 6200, 8000, 9800, 11500, 13200], fires: [2000, 4000, 6500, 8800, 10500, 12500], waters: [3000, 5500, 7500, 9200, 11800], gaps: [1800, 3800, 5800, 7800, 10000, 12000],
        hearts: [1500, 4500, 7200, 10000, 13000], rk: 6500, cps: [2000, 4500, 7000, 9500, 12000]
    },
    {
        w: 14000, bg: 0xFF6B6B, name: 'Final Yolu',
        mb: [[2000, 'misunderstanding'], [5000, 'pride'], [8000, 'stubbornness'], [11500, 'mistake']],
        mush: [500, 1000, 1500, 2800, 3500, 4200, 5800, 6500, 7200, 8800, 9500, 10200, 11000, 12000, 12800, 13500],
        spikes: [1200, 2500, 3800, 5200, 6800, 8200, 9800, 11200, 12500, 13800], fires: [1800, 3200, 5500, 7500, 9200, 11000, 13000], waters: [2200, 4500, 6200, 8500, 10500, 12200], gaps: [1500, 3500, 5000, 7000, 9000, 11000, 13500],
        hearts: [1200, 3500, 6000, 8500, 11000, 13200], rk: 9500, cps: [2000, 4500, 7000, 9500, 12000]
    }
];

// ===== LEVEL SCENE =====
class LevelScene extends Phaser.Scene {
    constructor() { super({ key: 'Level' }); }
    init(d) { this.lv = d.level || 1; this.spawnX = 100; this.spawnY = 600; }
    create() {
        var ld = LD[this.lv - 1], W = ld.w, self = this;
        this.physics.world.setBounds(0, 0, W, 900);
        this.add.rectangle(W / 2, 360, W, 720, ld.bg);
        // Platforms
        this.platforms = this.physics.add.staticGroup();
        this.gapSet = new Set();
        (ld.gaps || []).forEach(function (gx) { for (var i = -1; i < 2; i++)self.gapSet.add(Math.floor((gx + i * 100) / 100)); });
        for (var x = 0; x < W; x += 100) {
            if (!this.gapSet.has(Math.floor(x / 100))) this.platforms.create(x + 50, 700, 'platform').refreshBody();
        }
        var np = Math.floor(W / 350);
        for (var i = 0; i < np; i++) {
            this.platforms.create(250 + i * 350 + Phaser.Math.Between(-30, 30), Phaser.Math.Between(400, 580), 'platform').setScale(Phaser.Math.Between(2, 3), 1).refreshBody();
        }
        (ld.gaps || []).forEach(function (gx) {
            self.platforms.create(gx, 600, 'platform').setScale(1.5, 1).refreshBody();
        });
        // Player
        this.player = this.physics.add.sprite(this.spawnX, this.spawnY, 'player').setDisplaySize(C.P_W, C.P_H).setBounce(0.1);
        var p = this.player; p.hp = C.MAX_HP; p.isAtk = false; p.atkCD = 0; p.facingR = true; p.boosted = false; p.spd = C.PLAYER_SPEED;
        this.mushKills = 0;
        this.pLabel = this.add.text(0, 0, C.PLAYER_NAME, { font: 'bold 13px Segoe UI', fill: '#FFD700', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5, 1).setDepth(50);
        if (this.textures.exists('askim_face')) this.pFace = this.add.image(this.spawnX, this.spawnY - 30, 'askim_face').setDisplaySize(30, 30).setDepth(51);
        // Mini bosses
        this.enemies = this.physics.add.group();
        (ld.mb || []).forEach(function (e) {
            var cfg = MB_CFG[e[1]];
            var mb = self.physics.add.sprite(e[0], 500, 'miniboss').setDisplaySize(cfg.sz, cfg.sz).setBounce(0.2).setCollideWorldBounds(true);
            mb.hp = cfg.hp; mb.alive = true; mb.etype = e[1]; mb.startX = e[0]; mb.dir = 1; mb.pd = 200;
            mb.beh = cfg.beh; mb.mspd = cfg.spd; mb.shootCD = 0; mb.spoke = false; mb.jumpCD = 0;
            self.enemies.add(mb);
        });
        // Mushroom enemies
        this.mushrooms = this.physics.add.group();
        (ld.mush || []).forEach(function (mx) {
            var m = self.physics.add.sprite(mx, 650, 'mushroom').setDisplaySize(28, 30).setBounce(0).setCollideWorldBounds(true);
            m.alive = true; m.startX = mx; m.dir = Phaser.Math.Between(0, 1) ? 1 : -1; m.body.setSize(28, 24, 0, 6);
            self.mushrooms.add(m);
        });
        // Hazards
        this.hazards = this.physics.add.staticGroup();
        (ld.fires || []).forEach(function (fx) {
            var f = self.hazards.create(fx, 678, 'fire').setDisplaySize(30, 30).refreshBody(); f.htype = 'fire';
            self.tweens.add({ targets: f, scaleY: 1.3, duration: 350, yoyo: true, repeat: -1 });
        });
        (ld.waters || []).forEach(function (wx) {
            var w2 = self.hazards.create(wx, 690, 'water').setDisplaySize(100, 20).refreshBody(); w2.htype = 'water';
        });
        (ld.spikes || []).forEach(function (sx) {
            var sp = self.hazards.create(sx, 688, 'spike').setDisplaySize(48, 24).refreshBody(); sp.htype = 'spike';
        });
        // Collectibles
        this.collectibles = this.physics.add.group();
        (ld.hearts || []).forEach(function (hx) {
            var h = self.physics.add.sprite(hx, Phaser.Math.Between(400, 550), 'heart').setDisplaySize(22, 20);
            h.ptype = 'heart'; self.collectibles.add(h);
            self.tweens.add({ targets: h, y: h.y - 12, duration: 1000, yoyo: true, repeat: -1 });
        });
        if (ld.rk) {
            var rk = self.physics.add.sprite(ld.rk, 350, 'rocket').setDisplaySize(25, 25);
            rk.ptype = 'rocket'; self.collectibles.add(rk);
            self.tweens.add({ targets: rk, y: rk.y - 10, duration: 800, yoyo: true, repeat: -1 });
        }
        // Checkpoints
        this.cpFlags = []; this.lastCP = { x: this.spawnX, y: this.spawnY };
        (ld.cps || []).forEach(function (cx) {
            var fl = self.physics.add.staticSprite(cx, 660, 'flag').setDisplaySize(28, 40).refreshBody();
            fl.saved = false; self.cpFlags.push(fl);
        });
        // Door at end
        this.door = this.physics.add.staticSprite(W - 150, 635, 'door').setDisplaySize(40, 65).refreshBody();
        this.tweens.add({ targets: this.door, alpha: 0.6, duration: 800, yoyo: true, repeat: -1 });
        // Camera
        this.cameras.main.setBounds(0, 0, W, 720);
        // Collisions
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.collider(this.mushrooms, this.platforms);
        this.physics.add.overlap(this.player, this.collectibles, this.collectItem, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player, this.mushrooms, this.hitMushroom, null, this);
        this.physics.add.overlap(this.player, this.hazards, this.hitHazard, null, this);
        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyA = this.input.keyboard.addKey('A'); this.keyD = this.input.keyboard.addKey('D');
        this.keyW = this.input.keyboard.addKey('W'); this.keyX = this.input.keyboard.addKey('X');
        this.keySpace = this.input.keyboard.addKey('SPACE');
        // Enable multitouch
        this.input.addPointer(3);
        setupMobile(this);
        // UI - positioned safely above mobile buttons
        var uiY = 10;
        this.hpTxt = this.add.text(10, uiY, '', { font: 'bold 18px Segoe UI', fill: '#fff', stroke: '#000', strokeThickness: 3 }).setScrollFactor(0).setDepth(100);
        this.mushTxt = this.add.text(10, uiY + 25, '', { font: 'bold 12px Segoe UI', fill: '#FF6B6B', stroke: '#000', strokeThickness: 2 }).setScrollFactor(0).setDepth(100);
        this.cpNotify = this.add.text(this.cameras.main.width - 10, uiY, '', { font: 'bold 13px Segoe UI', fill: '#00FF88', stroke: '#000', strokeThickness: 2 }).setOrigin(1, 0).setScrollFactor(0).setDepth(100).setAlpha(0);
        var lt = this.add.text(this.cameras.main.width / 2, 25, 'Level ' + this.lv + ' - ' + ld.name, { font: 'bold 18px Segoe UI', fill: '#FFD700', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
        this.tweens.add({ targets: lt, alpha: 0, duration: 800, delay: 3000 });
        this.winDone = false; this.dead = false; this.iFrames = false; this.cutActive = false;
        // Cutscene Level 1
        if (ld.cut) {
            this.cutActive = true;
            var pr = this.add.image(200, 600, 'princess').setDisplaySize(C.PR_W, C.PR_H).setDepth(10);
            var prFace = null;
            if (this.textures.exists('hanim_face')) prFace = this.add.image(200, 600 - 22, 'hanim_face').setDisplaySize(24, 24).setDepth(11);
            this.player.setPosition(130, 600);
            if (this.pFace) this.pFace.setPosition(130, 600 - 30);
            this.pLabel.setPosition(130, 600 - 48);
            showDlg(this, C.PLAYER_NAME + ': Seninle her an çok güzel...', C.PLAYER_NAME, 2500);
            this.time.delayedCall(3000, function () { showDlg(self, C.PRINCESS_NAME + ': Ben de seni çok seviyorum...', C.PRINCESS_NAME, 2500); });
            this.time.delayedCall(6000, function () {
                self.cameras.main.shake(500, 0.01); SND.bosshit();
                var bs = self.add.image(self.cameras.main.width + 50, 300, 'boss').setDisplaySize(80, 90).setDepth(20);
                showDlg(self, 'Ben Küslük-9000! İlişkileri bozmak için geldim!', 'Küslük-9000', 3000);
                self.tweens.add({
                    targets: bs, x: 200, duration: 1500, ease: 'Power2', onComplete: function () {
                        var kidnapTargets = [pr, bs];
                        if (prFace) kidnapTargets.push(prFace);
                        self.tweens.add({
                            targets: kidnapTargets, x: -200, y: 100, duration: 1500, onComplete: function () {
                                pr.destroy(); bs.destroy(); if (prFace) prFace.destroy();
                                showDlg(self, 'Hayır! Onu geri alacağım!', C.PLAYER_NAME, 2500);
                                self.time.delayedCall(2800, function () { self.cutActive = false; self.cameras.main.startFollow(self.player, true); SND.playLevelMusic(); });
                            }
                        });
                    }
                });
            });
        } else {
            this.cameras.main.startFollow(this.player, true);
            SND.playLevelMusic();
            var intros = ['', 'İlk zorluklar başlıyor!', 'Engeller artıyor, yılma!', 'Kovalamaca zamanı!', 'Son yol! Biraz daha!'];
            if (intros[this.lv - 1]) this.time.delayedCall(500, function () { showDlg(self, intros[self.lv - 1], C.PLAYER_NAME, 2500); });
        }
    }
    doJump() { var p = this.player; if (p.body.touching.down || p.body.blocked.down) { p.setVelocityY(C.JUMP_VEL); SND.jump(); } }
    doAttack() {
        var p = this.player; if (p.isAtk || p.atkCD > 0) return;
        p.isAtk = true; p.atkCD = 400; SND.swing();
        var ox = p.facingR ? 30 : -30;
        var sl = this.add.image(p.x + ox, p.y - 5, 'slash').setDisplaySize(42, 50).setDepth(60);
        if (!p.facingR) sl.setFlipX(true);
        this.tweens.add({ targets: sl, alpha: 0, scaleX: 1.8, scaleY: 1.3, duration: 280, onComplete: function () { sl.destroy(); } });
        this.time.delayedCall(300, function () { p.isAtk = false; });
    }
    collectItem(pl, item) {
        SND.collect();
        if (item.ptype === 'heart') { this.player.hp = Math.min(this.player.hp + 1, C.MAX_HP); }
        else if (item.ptype === 'rocket') {
            var p = this.player; p.boosted = true; p.spd = C.PLAYER_SPEED * C.BOOST_MULT; p.setTint(0xFFFF00);
            this.time.delayedCall(C.BOOST_DUR, function () { p.boosted = false; p.spd = C.PLAYER_SPEED; p.clearTint(); });
        }
        item.destroy();
    }
    hitMushroom(pl, m) {
        if (!m.alive) return;
        if (pl.body.velocity.y > 0 && pl.y < m.y - 10) {
            m.alive = false; SND.stomp();
            pl.setVelocityY(-280);
            this.mushKills++;
            if (this.mushKills % 5 === 0) {
                this.player.hp = Math.min(this.player.hp + 1, C.MAX_HP); SND.collect();
                showDlg(this, '🍄x5 Bonus! +1 ❤️', '', 1500);
            }
            this.tweens.add({ targets: m, scaleY: 0.1, alpha: 0, duration: 250, onComplete: function () { m.destroy(); } });
        } else if (!this.iFrames) {
            this.player.hp--; this.iFrames = true; this.player.setTint(0xFF0000); SND.hit();
            this.player.setVelocityX(this.player.facingR ? -200 : 200);
            var self = this;
            this.time.delayedCall(800, function () { self.iFrames = false; if (self.player.active) self.player.clearTint(); });
            if (this.player.hp <= 0) this.doDeath();
        }
    }
    hitEnemy(pl, enemy) {
        if (!enemy.alive) return;
        if (pl.isAtk) {
            enemy.hp--; enemy.setTint(0xFF0000); SND.bosshit();
            this.time.delayedCall(100, function () { if (enemy.active && enemy.alive) enemy.setTint(0x6C757D); });
            if (enemy.hp <= 0) {
                enemy.alive = false; SND.win();
                showDlg(this, BOSS_MSGS[enemy.etype] || 'Yenildin!', BOSS_NAMES[enemy.etype] || '?', 2500);
                this.tweens.add({ targets: enemy, alpha: 0, angle: 180, duration: 500, onComplete: function () { enemy.destroy(); } });
            }
        } else if (!this.iFrames) {
            this.player.hp--; this.iFrames = true; this.player.setTint(0xFF0000); SND.hit();
            this.player.setVelocityX(this.player.facingR ? -220 : 220);
            var self = this;
            this.time.delayedCall(800, function () { self.iFrames = false; if (self.player.active) self.player.clearTint(); });
            if (this.player.hp <= 0) this.doDeath();
        }
    }
    hitHazard(pl, hz) {
        if (this.iFrames) return;
        this.player.hp--; this.iFrames = true; this.player.setTint(0xFF0000); this.player.setVelocityY(-250); SND.hit();
        var self = this;
        this.time.delayedCall(1000, function () { self.iFrames = false; if (self.player.active) self.player.clearTint(); });
        if (this.player.hp <= 0) this.doDeath();
    }
    doDeath() {
        if (this.dead) return; this.dead = true; SND.die();
        this.player.setActive(false).setVisible(false);
        showDlg(this, 'Tekrar deniyorum...', C.PLAYER_NAME, 2000);
        var lv = this.lv, cx = this.lastCP.x, cy = this.lastCP.y;
        this.time.delayedCall(2000, function () { this.scene.restart({ level: lv }); }.bind(this));
    }
    showCPNotify() {
        this.cpNotify.setText('💾 Checkpoint kaydedildi!').setAlpha(1);
        this.tweens.add({ targets: this.cpNotify, alpha: 0, duration: 600, delay: 2000 });
    }
    update(t, dt) {
        if (this.dead || this.winDone || this.cutActive) return;
        var p = this.player; p.atkCD -= dt;
        var left = this.cursors.left.isDown || this.keyA.isDown || this.mL;
        var right = this.cursors.right.isDown || this.keyD.isDown || this.mR;
        if (left) { p.setVelocityX(-p.spd); p.facingR = false; p.setFlipX(true); }
        else if (right) { p.setVelocityX(p.spd); p.facingR = true; p.setFlipX(false); }
        else p.setVelocityX(0);
        if (this.cursors.up.isDown || this.keyW.isDown || this.keySpace.isDown) this.doJump();
        if (Phaser.Input.Keyboard.JustDown(this.keyX)) this.doAttack();
        // Enemy AI
        var px = p.x, py = p.y;
        this.enemies.children.iterate(function (e) {
            if (!e || !e.alive) return;
            e.shootCD = (e.shootCD || 0) - dt;
            e.jumpCD = (e.jumpCD || 0) - dt;
            var dist = Math.abs(e.x - px);
            if (!e.spoke && dist < 280) { e.spoke = true; var intro = MB_CFG[e.etype].intro; if (intro) showDlg(this, intro, BOSS_NAMES[e.etype], 2000); }
            switch (e.beh) {
                case 'charge':
                    if (dist < 300) { var dx = px > e.x ? 1 : -1; e.setVelocityX(e.mspd * 1.5 * dx); e.setFlipX(dx < 0); }
                    else { if (Math.abs(e.x - e.startX) > e.pd) e.dir *= -1; e.setVelocityX(e.mspd * e.dir); e.setFlipX(e.dir < 0); }
                    break;
                case 'jump':
                    if (Math.abs(e.x - e.startX) > e.pd) e.dir *= -1;
                    e.setVelocityX(e.mspd * e.dir); e.setFlipX(e.dir < 0);
                    if (e.jumpCD <= 0 && (e.body.touching.down || e.body.blocked.down)) { e.setVelocityY(-350); e.jumpCD = 1500; }
                    break;
                case 'shoot':
                    e.setVelocityX(0);
                    if (dist < 400 && e.shootCD <= 0) {
                        e.shootCD = 2000;
                        var pr = this.physics.add.sprite(e.x, e.y, 'projectile').setDisplaySize(14, 14);
                        var ang = Math.atan2(py - e.y, px - e.x);
                        pr.setVelocity(Math.cos(ang) * 200, Math.sin(ang) * 200);
                        this.time.delayedCall(3000, function () { if (pr.active) pr.destroy(); });
                        this.physics.add.overlap(p, pr, function () {
                            pr.destroy(); if (this.iFrames) return;
                            p.hp--; this.iFrames = true; p.setTint(0xFF0000); SND.hit();
                            var s2 = this; this.time.delayedCall(800, function () { s2.iFrames = false; if (p.active) p.clearTint(); });
                            if (p.hp <= 0) this.doDeath();
                        }, null, this);
                    }
                    break;
                default:
                    if (Math.abs(e.x - e.startX) > e.pd) e.dir *= -1;
                    e.setVelocityX(e.mspd * e.dir); e.setFlipX(e.dir < 0);
            }
        }.bind(this));
        // Mushroom AI
        this.mushrooms.children.iterate(function (m) {
            if (!m || !m.alive) return;
            if (Math.abs(m.x - m.startX) > 120) m.dir *= -1;
            m.setVelocityX(70 * m.dir); m.setFlipX(m.dir < 0);
        });
        // UI
        var h = ''; for (var i = 0; i < C.MAX_HP; i++) h += (i < p.hp ? '❤️' : '🖤');
        this.hpTxt.setText(h);
        this.mushTxt.setText('🍄 ' + this.mushKills + '/5');
        this.pLabel.setPosition(p.x, p.y - 48);
        if (this.pFace) this.pFace.setPosition(p.x, p.y - 30);
        // Checkpoint check
        var self = this;
        this.cpFlags.forEach(function (fl) {
            if (!fl.saved && Math.abs(p.x - fl.x) < 40 && Math.abs(p.y - fl.y) < 60) {
                fl.saved = true; fl.setTint(0x00FF00);
                self.lastCP = { x: fl.x, y: fl.y - 30 }; SND.checkpoint(); self.showCPNotify();
            }
        });
        // Fall = lose HP + respawn at checkpoint
        if (p.y > 740 && !this.dead && !this._falling) {
            this._falling = true;
            p.hp--; SND.hit();
            if (p.hp <= 0) { this.doDeath(); }
            else {
                var self2 = this;
                this.time.delayedCall(300, function () {
                    p.setPosition(self2.lastCP.x, self2.lastCP.y - 50); p.setVelocity(0, 0);
                    p.setTint(0xFF0000); self2.iFrames = true; self2._falling = false;
                    self2.time.delayedCall(800, function () { self2.iFrames = false; if (p.active) p.clearTint(); });
                    showDlg(self2, '-1 ❤️ Dikkat! Düştün!', '', 1500);
                });
            }
        }
        // Door check
        if (this.door && Math.abs(p.x - this.door.x) < 35 && Math.abs(p.y - this.door.y) < 50 && !this.winDone) {
            this.winDone = true; p.setVelocityX(0); SND.door();
            if (this.lv < C.LEVELS) {
                showDlg(this, 'Bir adım daha yaklaştım!', C.PLAYER_NAME, 2000);
                var nxt = this.lv + 1; this.time.delayedCall(2200, function () { this.scene.start('Level', { level: nxt }); }.bind(this));
            } else {
                showDlg(this, 'Küslük-9000! Sıra sende!', C.PLAYER_NAME, 2000);
                this.time.delayedCall(2200, function () { this.scene.start('FinalBoss'); }.bind(this));
            }
        }
    }
}

// ===== FINAL BOSS SCENE =====
class FinalBossScene extends Phaser.Scene {
    constructor() { super({ key: 'FinalBoss' }); }
    create() {
        var w = this.cameras.main.width, h = this.cameras.main.height, self = this;
        this.physics.world.setBounds(0, 0, 2400, 720);
        this.add.rectangle(1200, 360, 2400, 720, 0x1a0505);
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(1200, 700, 'platform').setScale(60, 1).refreshBody();
        for (var i = 0; i < 5; i++) this.platforms.create(300 + i * 420, 500 + (i % 2) * 80, 'platform').setScale(3, 1).refreshBody();
        this.player = this.physics.add.sprite(100, 600, 'player').setDisplaySize(C.P_W, C.P_H).setBounce(0.1).setCollideWorldBounds(true);
        var p = this.player; p.hp = C.MAX_HP; p.isAtk = false; p.atkCD = 0; p.facingR = true; p.spd = C.PLAYER_SPEED;
        this.boss = this.physics.add.sprite(1200, 350, 'boss').setDisplaySize(140, 165).setBounce(0.2).setCollideWorldBounds(true);
        var b = this.boss; b.hp = C.BOSS_HP; b.maxHp = C.BOSS_HP; b.alive = true; b.atkCD = 0; b.dir = 1; b.phase = 1; b.dmgCD = 0;
        this.princess = this.physics.add.sprite(2200, 600, 'princess').setDisplaySize(C.PR_W, C.PR_H).setVisible(false);
        this.physics.add.collider(p, this.platforms);
        this.physics.add.collider(b, this.platforms);
        this.physics.add.collider(this.princess, this.platforms);
        this.projectiles = this.physics.add.group();
        this.cameras.main.setBounds(0, 0, 2400, 720);
        this.cameras.main.startFollow(p, true);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyA = this.input.keyboard.addKey('A'); this.keyD = this.input.keyboard.addKey('D');
        this.keyW = this.input.keyboard.addKey('W'); this.keyX = this.input.keyboard.addKey('X');
        this.keySpace = this.input.keyboard.addKey('SPACE');
        // Enable multitouch
        this.input.addPointer(3);
        setupMobile(this);
        this.bossBar = this.add.graphics().setScrollFactor(0).setDepth(100);
        this.add.text(10, 32, '👾 Küslük-9000', { font: 'bold 16px Segoe UI', fill: '#FF4444', stroke: '#000', strokeThickness: 2 }).setScrollFactor(0).setDepth(100);
        this.hpTxt = this.add.text(10, 10, '', { font: 'bold 18px Segoe UI', fill: '#fff', stroke: '#000', strokeThickness: 3 }).setScrollFactor(0).setDepth(100);
        this.winDone = false; this.dead = false; this.iFrames = false;
        SND.playBossMusic();
        showDlg(this, 'Ben Küslük-9000! İlişkinizi yok edeceğim!', 'Küslük-9000', 3500);
    }
    doJump() { var p = this.player; if (p.body.touching.down || p.body.blocked.down) { p.setVelocityY(C.JUMP_VEL); SND.jump(); } }
    doAttack() {
        var p = this.player; if (p.isAtk || p.atkCD > 0) return;
        p.isAtk = true; p.atkCD = 400; SND.swing();
        var ox = p.facingR ? 30 : -30;
        var sl = this.add.image(p.x + ox, p.y - 5, 'slash').setDisplaySize(45, 52).setDepth(60);
        if (!p.facingR) sl.setFlipX(true);
        this.tweens.add({ targets: sl, alpha: 0, scaleX: 1.8, scaleY: 1.3, duration: 280, onComplete: function () { sl.destroy(); } });
        var b = this.boss;
        if (b && b.alive && b.dmgCD <= 0 && Phaser.Math.Distance.Between(p.x, p.y, b.x, b.y) < 100) {
            b.hp--; b.dmgCD = 300; b.setTint(0xFF0000); SND.bosshit();
            this.cameras.main.shake(100, 0.005);
            var self = this;
            this.time.delayedCall(150, function () { if (b && b.alive) b.setTint(0x3A3A3A); });
            if (b.hp <= b.maxHp * 0.6 && b.phase === 1) { b.phase = 2; showDlg(this, 'Bu mümkün değil! Ama pes etmem!', 'Küslük-9000', 2500); }
            if (b.hp <= b.maxHp * 0.25 && b.phase === 2) { b.phase = 3; showDlg(this, 'Belki... belki hatalıydım...', 'Küslük-9000', 2500); }
            if (b.hp <= 0) this.bossDie();
        }
        this.time.delayedCall(300, function () { p.isAtk = false; });
    }
    bossDie() {
        this.boss.alive = false; this.winDone = true; SND.stopMusic(); SND.win();
        this.tweens.add({ targets: this.boss, alpha: 0, scaleX: 2.5, scaleY: 2.5, angle: 360, duration: 1200, onComplete: function () { this.boss.destroy(); }.bind(this) });
        showDlg(this, 'Küslük yenildi! Sevgimiz yenilmez!', C.PLAYER_NAME, 3000);
        var self = this;
        this.time.delayedCall(2000, function () {
            self.princess.setVisible(true).setPosition(1200, 600);
            showDlg(self, 'Aşkım! Beni kurtardın! Sana hep inandım!', C.PRINCESS_NAME, 3000);
        });
        this.time.delayedCall(6000, function () { self.showEnding(); });
    }
    showEnding() {
        var w = this.cameras.main.width, h = this.cameras.main.height, self = this;
        this.cameras.main.fade(1200, 0, 0, 0);
        this.time.delayedCall(1500, function () {
            self.children.removeAll();
            self.add.rectangle(w / 2, h / 2, w, h, 0x0a0e27);
            for (var i = 0; i < 35; i++) {
                var ht = self.add.text(Phaser.Math.Between(0, w), Phaser.Math.Between(h, h + 200), '❤️', { font: Phaser.Math.Between(14, 30) + 'px Arial' }).setAlpha(0.7);
                self.tweens.add({ targets: ht, y: -30, duration: Phaser.Math.Between(3000, 6000), repeat: -1, delay: Phaser.Math.Between(0, 2000) });
            }
            self.add.text(w / 2, h * 0.12, 'Bazı oyunlar kazanmak için oynanır.\nBen bunu seni kaybetmemek için yaptım.', {
                font: 'bold 22px Segoe UI', fill: '#fff', align: 'center', wordWrap: { width: w * 0.85 }
            }).setOrigin(0.5);
            self.add.text(w / 2, h * 0.35, '💕', { font: '60px Arial' }).setOrigin(0.5);
            if (self.textures.exists('couple_photo')) {
                self.add.image(w / 2, h * 0.55, 'couple_photo').setDisplaySize(200, 200);
            } else {
                self.add.text(w / 2, h * 0.55, C.PLAYER_NAME + ' ❤️ ' + C.PRINCESS_NAME, { font: 'bold 26px Segoe UI', fill: '#FF69B4' }).setOrigin(0.5);
            }
            self.add.text(w / 2, h * 0.75, 'Hep senin yanındayım,\nseni çok seviyorum. ❤️', { font: 'bold 18px Segoe UI', fill: '#FFD700', align: 'center' }).setOrigin(0.5);
            var bb = self.add.rectangle(w / 2, h * 0.90, 200, 42, 0xFF1493).setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0xFFD700);
            self.add.text(w / 2, h * 0.90, '🏠 Ana Menü', { font: 'bold 18px Segoe UI', fill: '#fff' }).setOrigin(0.5);
            bb.on('pointerdown', function () { self.scene.start('Intro'); });
        });
    }
    update(t, dt) {
        if (this.winDone || this.dead) return;
        var p = this.player, b = this.boss;
        p.atkCD -= dt; if (b) b.dmgCD = (b.dmgCD || 0) - dt;
        var left = this.cursors.left.isDown || this.keyA.isDown || this.mL;
        var right = this.cursors.right.isDown || this.keyD.isDown || this.mR;
        if (left) { p.setVelocityX(-p.spd); p.facingR = false; p.setFlipX(true); }
        else if (right) { p.setVelocityX(p.spd); p.facingR = true; p.setFlipX(false); }
        else p.setVelocityX(0);
        if (this.cursors.up.isDown || this.keyW.isDown || this.keySpace.isDown) this.doJump();
        if (Phaser.Input.Keyboard.JustDown(this.keyX)) this.doAttack();
        if (b && b.alive) {
            b.atkCD -= dt;
            var dist = Phaser.Math.Distance.Between(b.x, b.y, p.x, p.y);
            var spd = b.phase >= 3 ? C.BOSS_SPEED * 0.4 : b.phase === 2 ? C.BOSS_SPEED * 1.3 : C.BOSS_SPEED;
            if (dist < 500) {
                var ang = Math.atan2(p.y - b.y, p.x - b.x);
                b.setVelocityX(Math.cos(ang) * spd);
                b.setFlipX(p.x < b.x);
            } else {
                if (Math.abs(b.x - 1200) > 400) b.dir *= -1;
                b.setVelocityX(spd * b.dir * 0.5);
            }
            if (b.phase >= 2 && Math.random() < 0.005 && (b.body.touching.down || b.body.blocked.down)) { b.setVelocityY(-400); }
            var fireRate = b.phase >= 2 ? 0.012 : 0.006;
            if (Math.random() < fireRate && b.atkCD <= 0) {
                b.atkCD = b.phase >= 2 ? 800 : 1500;
                var pr = this.physics.add.sprite(b.x, b.y - 40, 'projectile').setDisplaySize(16, 16);
                var a2 = Math.atan2(p.y - b.y, p.x - b.x);
                pr.setVelocity(Math.cos(a2) * (200 + b.phase * 30), Math.sin(a2) * (200 + b.phase * 30));
                this.projectiles.add(pr);
                this.time.delayedCall(2500, function () { if (pr.active) pr.destroy(); });
            }
            if (dist < 70 && !this.iFrames) {
                p.hp--; this.iFrames = true; p.setTint(0xFF0000); SND.hit();
                p.setVelocityX(p.facingR ? -280 : 280); p.setVelocityY(-200);
                var self = this;
                this.time.delayedCall(800, function () { self.iFrames = false; if (p.active) p.clearTint(); });
                if (p.hp <= 0) {
                    this.dead = true; p.setActive(false).setVisible(false); SND.die();
                    showDlg(this, 'Tekrar deniyorum...', C.PLAYER_NAME, 2000);
                    this.time.delayedCall(2000, function () { this.scene.restart(); }.bind(this));
                }
            }
        }
        this.physics.overlap(p, this.projectiles, function (pl, pr2) {
            pr2.destroy(); if (this.iFrames) return;
            p.hp--; this.iFrames = true; p.setTint(0xFF0000); SND.hit();
            var self = this; this.time.delayedCall(800, function () { self.iFrames = false; if (p.active) p.clearTint(); });
            if (p.hp <= 0) {
                this.dead = true; p.setActive(false).setVisible(false); SND.die();
                showDlg(this, 'Tekrar deniyorum...', C.PLAYER_NAME, 2000);
                this.time.delayedCall(2000, function () { this.scene.restart(); }.bind(this));
            }
        }, null, this);
        var hh = ''; for (var i = 0; i < C.MAX_HP; i++) hh += (i < p.hp ? '❤️' : '🖤');
        this.hpTxt.setText(hh);
        this.bossBar.clear();
        if (b && b.alive) {
            var pct = b.hp / b.maxHp;
            this.bossBar.fillStyle(0x333333); this.bossBar.fillRect(130, 52, 180, 12);
            this.bossBar.fillStyle(pct > 0.5 ? 0xFF0000 : pct > 0.25 ? 0xFF6600 : 0xFFFF00);
            this.bossBar.fillRect(130, 52, 180 * pct, 12);
            this.bossBar.lineStyle(1, 0xfff); this.bossBar.strokeRect(130, 52, 180, 12);
        }
        if (p.y > 780) {
            this.dead = true; p.setActive(false).setVisible(false); SND.die();
            showDlg(this, 'Tekrar deniyorum...', C.PLAYER_NAME, 2000);
            this.time.delayedCall(2000, function () { this.scene.restart(); }.bind(this));
        }
    }
}

// ===== GAME CONFIG =====
window.addEventListener('DOMContentLoaded', function () {
    // --- Orientation overlay (portrait = show warning) ---
    var rotOverlay = document.createElement('div');
    rotOverlay.id = 'rot-overlay';
    rotOverlay.innerHTML = '<div style="font-size:52px;margin-bottom:18px">📱➡️</div>' +
        '<div style="font-size:20px;font-weight:bold;color:#FFD700">Lütfen telefonu yatay çevir!</div>' +
        '<div style="font-size:14px;color:#aaa;margin-top:10px">Please rotate to landscape</div>';
    rotOverlay.style.cssText = [
        'display:none', 'position:fixed', 'inset:0', 'z-index:9999',
        'background:#0a0e27', 'color:#fff',
        'flex-direction:column', 'align-items:center', 'justify-content:center',
        'text-align:center', 'padding:24px'
    ].join(';');
    document.body.appendChild(rotOverlay);

    function checkOrientation() {
        var isPortrait = window.innerHeight > window.innerWidth;
        rotOverlay.style.display = isPortrait ? 'flex' : 'none';
        if (window._phaserGame) {
            window._phaserGame.canvas.style.display = isPortrait ? 'none' : 'block';
        }
    }
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', function () {
        setTimeout(checkOrientation, 200); // small delay for browser to settle
    });

    // --- Boot Phaser with fixed 16:9 virtual resolution ---
    window._phaserGame = new Phaser.Game({
        type: Phaser.AUTO,
        parent: 'gc',
        width: 1280,
        height: 720,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        physics: {
            default: 'arcade',
            arcade: { gravity: { y: C.GRAVITY }, debug: false }
        },
        input: {
            touch: { target: window, capture: true },
            activePointers: 5
        },
        backgroundColor: '#0a0e27',
        scene: [BootScene, IntroScene, TutorialScene, LevelScene, FinalBossScene]
    });

    checkOrientation();
});
