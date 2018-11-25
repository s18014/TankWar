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
        this.shotTime = 0;
        this.shotInterval = 10;
        this.frame = 3 * 6;
        this.image = game.assets[IMAGE.tank];
        this.on("enterframe", function() {
            this.shotTime += 1;
        });
        scene.addChild(this);
    },

    move: function(dir) {
        this.x += Math.sin(RADIAN * this.rotation * -1) * this.speed * dir;
        this.y += Math.cos(RADIAN * this.rotation * -1) * this.speed * dir;
        if (this.x > game.width - this.width) {
            this.x = game.width - this.width - 1;
            this.vx = -this.vx;
        }
        if (this.x < 0) {
            this.x = 1;
            this.vx = -this.vx;
        }
        if (this.y > game.height - this.height) {
            this.y = game.height - this.height - 1;
            this.vy = -this.vy;
        }
        if (this.y < 0) {
            this.y = 1;
            this.vy = -this.vy;
        }
    },

    rotate: function(dir) {
        this.rotation += dir * this.rotationSpeed;
    },

    shot: function() {
        if (this.shotTime > this.shotInterval) {
            this.bullet = new Bullet(this.x + this.width / 2, this.y + this.height / 2, this.rotation);
            scene.insertBefore(this.bullet, this);
            this.shotTime = 0;
        };
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
    initialize: function (x, y, rotation) {
        Sprite.call(this, 16, 16);
        this.image = game.assets[IMAGE.icon];
        this.frame = 3 * 16 + 8;
        this.rotation = rotation;
        this.x = x - this.width / 2;
        this.y = y - this.height / 2;
        this.speed = 10;
        this.on("enterframe", function() {
            this.move();
            if (this.x < 0 + this.widht || this.x > game.width || this.y < 0 - this.height || this.y > game.height) {
                scene.removeChild(this);
            }
        });
        scene.addChild(this);
    },

    move: function() {
        this.x += Math.sin(RADIAN * this.rotation * -1) * this.speed * -1;
        this.y += Math.cos(RADIAN * this.rotation * -1) * this.speed * -1;
    }
});

const main = () => {
    game = new Core();
    game.fps = 60;
    game.preload(IMAGE.tank);
    game.preload(IMAGE.effect);
    game.preload(IMAGE.icon);
    scene = game.rootScene;
    scene.backgroundColor = "#666";

    game.on('load', () => {
        const tank = new Tank(game.width / 2, game.height / 2);

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
        });
    });
    game.start();
};

window.addEventListener('load', main);
