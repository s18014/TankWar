enchant();

let game, scene;

IMAGE = {
    tank: "./assets/images/chara3.png",
    effect: "./assets/images/effect0.png",
    icon: "./assets/images/icon0.png"
};

RADIAN = Math.PI / 180;

const Tank = Class.create(Sprite, {
    initialize: function(x, y) {
        Sprite.call(this, 32, 32);
        this.x = x - this.width / 2;
        this.y = y - this.height / 2;
        this.vx = 0;
        this.vy= 0;
        this.speed = 3;
        this.rotationSpeed = 3;
        this.bulletM = new BulletManager(5, 20);
        this.frame = 3 * 6;
        this.image = game.assets[IMAGE.tank];
        scene.addChild(this);
    },

    move: function(dir) {
        this.x += Math.sin(RADIAN * this.rotation * -1) * this.speed * dir;
        this.y += Math.cos(RADIAN * this.rotation * -1) * this.speed * dir;

        // 画面内に戻す処理
        if (this.x > game.width - this.width) {
            this.x = game.width - this.width - 1;
        }
        if (this.x < 0) {
            this.x = 1;
        }
        if (this.y > game.height - this.height) {
            this.y = game.height - this.height - 1;
        }
        if (this.y < 0) {
            this.y = 1;
        }
    },

    rotate: function(dir) {
        this.rotation += dir * this.rotationSpeed;
    },

    shot: function() {
        this.bulletM.shot(this.x + this.width / 2 + Math.sin(RADIAN * this.rotation * -1) * -20, this.y + this.height / 2 + Math.cos(RADIAN * this.rotation * -1) * -20, this.rotation);
    },

    rotationShiftUp: function() {
        this.rotationSpeed = 6;
    },

    rotationShiftDown: function() {
        this.rotationSpeed = 3;
    },

    hit: function() {
    }
});

const Bullet = Class.create(Sprite, {
    initialize: function() {
        Sprite.call(this, 16, 16);
        this.image = game.assets[IMAGE.icon];
        this.frame = 3 * 16 + 8;
        this.rotation = 0;
        this.speed = 10;
        this.visible = false;
        this.on("enterframe", function() {
            if (!this.visible) return;
            this.move();
            if (this.x < 0 - this.width || this.x > game.width || this.y < 0 - this.height || this.y > game.height) {
                this.visible = false;
            }
        });
    },

    set: function(x, y, rotation) {
        this.x = x - this.width / 2;
        this.y = y - this.height / 2;
        this.rotation = rotation;
        new Effect(x, y);
    },

    move: function() {
        this.x += Math.sin(RADIAN * this.rotation * -1) * this.speed * -1;
        this.y += Math.cos(RADIAN * this.rotation * -1) * this.speed * -1;
    },

    shot: function() {
        this.visible = true;
    }

});

const BulletManager = Class.create(Group, {
    initialize: function(amount, interval) {
        Group.call(this);
        this.amount = amount;
        this.make();
        this.time = 0;
        this.interval = interval;
        this.on("enterframe", function() {
            this.time += 1;
        });
        scene.addChild(this);
    },

    make: function() {
        for (i=0; i<this.amount; i++) {
            this.addChild(new Bullet());
        }
    },

    shot: function(x, y, rotation) {
        if (this.time < this.interval) return;
        for (i=0; i<this.childNodes.length; i++) {
            // 使っていない弾が在る場合に新しい座標の設定と発射命令をする
            if (!this.childNodes[i].visible) {
                this.childNodes[i].set(x, y, rotation)
                this.childNodes[i].shot();
                this.time = 0;
                break;
            }
        }
    }
});

const Effect = Class.create(Sprite, {
    initialize: function(x, y) {
        Sprite.call(this, 16, 16);
        this.image = game.assets[IMAGE.effect];
        this.x = x - this.width / 2;
        this.y = y - this.height / 2;
        this.on("enterframe", function() {
            if (this.frame >= 4 + (1 / 7 * 5)) scene.removeChild(this);
            this.frame = this.age / 7 % 4 + 1;
        });
        scene.addChild(this);
    }
});

class Vector2d {
    constructor() {
    }
}

const main = () => {
    game = new Core();
    game.fps = 60;
    game.preload([IMAGE.tank, IMAGE.effect, IMAGE.icon]);
    scene = game.rootScene;
    scene.backgroundColor = "#666";

    game.on('load', () => {
        const tank = new Tank(game.width / 2, game.height / 2);
        const tank2 = new Tank(game.width / 3, game.height / 3);


        game.keybind(65, "a");
        game.keybind(68, "d");
        game.keybind(83, "s");
        game.keybind(87, "w");
        game.keybind(90, "z");
        game.keybind(88, "x");
        game.keybind(32, "space");
        game.on("enterframe", () => {
            if (game.input.left) tank.rotate(-1);
            if (game.input.right) tank.rotate(1);
            if (game.input.up) tank.move(-1);
            if (game.input.down) tank.move(1);
            if (game.input.z) tank.shot();
            if (game.input.x) {
                tank.rotationShiftUp();
            } else {
                tank.rotationShiftDown();
            }


            var dir = {x: 0, y: 0};
            var normalize = {x: 0, y: 0};
            if (tank.within(tank2, tank2.width)) {
                dir.x = tank.x - tank2.x;
                dir.y = tank.y - tank2.y;
                dis = Math.sqrt(dir.x ** 2 + dir.y ** 2);
                normalize.x = dir.x / dis;
                normalize.y = dir.y / dis;
                tank.x += normalize.x * tank.speed;
                tank.y += normalize.y * tank.speed;
                tank2.x -= normalize.x * tank.speed / 4;
                tank2.y -= normalize.y * tank.speed / 4;
            }
        });
    });
    game.start();
};

window.addEventListener('load', main);
