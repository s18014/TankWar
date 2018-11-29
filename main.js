enchant();

let game;

IMAGE = {
    tank: "./assets/images/chara3.png",
    effect: "./assets/images/effect0.png",
    icon: "./assets/images/icon0.png"
};

RADIAN = Math.PI / 180;

const Tank = Class.create(Sprite, {
    initialize: function(scene, x, y, hp, id) {
        Sprite.call(this, 32, 32);
        this.scene = scene;
        this.scene.addChild(this);
        this.id = id;
        this.maxHp = hp;
        this.hp = hp;
        this.x = x - this.width / 2;
        this.y = y - this.height / 2;
        this.vx = 0;
        this.vy= 0;
        this.speed = 3;
        this.rotationSpeed = 3;
        this.bulletM = new BulletManager(this.scene, 10, 20, this.id);
        this.hpBar = new HpBar(this.scene, this.x + this.width / 2, this.y + 10);
        this.frame = 0;
        this.image = game.assets[IMAGE.tank];
        this.on("enterframe", function() {
            this.hpBar.draw(this.x + this.width / 2 - this.hpBar.x2 / 2, this.y - 10, this.getHpRatio());
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

        });
    },

    move: function(dir) {
        this.x += Math.sin(RADIAN * this.rotation * -1) * this.speed * dir;
        this.y += Math.cos(RADIAN * this.rotation * -1) * this.speed * dir;
    },

    rotate: function(dir) {
        this.rotation += dir * this.rotationSpeed;
    },

    shot: function() {
        this.bulletM.shot(this.x + this.width / 2 + Math.sin(RADIAN * this.rotation * -1) * +20, this.y + this.height / 2 + Math.cos(RADIAN * this.rotation * -1) * +20, this.rotation);
    },

    rotationShiftUp: function() {
        this.rotationSpeed = 6;
    },

    rotationShiftDown: function() {
        this.rotationSpeed = 1;
    },

    rotationSetNeutral: function() {
        this.rotationSpeed = 3;
    },

    hit: function() {
        this.hp -= 1;
        this.hpBar.startShaking();
        if (this.hp <= 0) {
            for (i=0; i<10; i++) {
                new Effect(this.parentNode, this.x + this.width / 2 + ((Math.random()-0.5) * this.width), this.y + this.height / 2 + ((Math.random()-0.5) * this.height));
            }
            this.hpBar.invisible();
            this.bulletM.disable();
            this.scene.removeChild(this);
        }
    },

    getHpRatio: function() {
        return this.hp / this.maxHp;
    },
});

/*
const Player = Class.create(Tank, {
    initialize: function(x, y, hp) {
        Tank.call(this, x, y, hp, "player");
        scene.addChild(this);
    }
});
*/

const Bullet = Class.create(Sprite, {
    initialize: function(scene, id) {
        Sprite.call(this, 16, 16);
        this.scene = scene;
        this.scene.addChild(this);
        this.id = id;
        this.image = game.assets[IMAGE.icon];
        this.frame = 3 * 16 + 12;
        this.speed = 5;
        this.on("enterframe", function() {
            this.move();
            if (this.x < 0 - this.width ||
                this.x > game.width ||
                this.y < 0 - this.height ||
                this.y > game.height) {
                this.parentNode.removeChild(this);
            }
        });
    },

    set: function(x, y, rotation) {
        this.x = x - this.width / 2;
        this.y = y - this.height / 2;
        this.rotation = rotation;
        new Effect(this.scene, x, y);
    },

    move: function() {
        this.x += Math.sin(RADIAN * this.rotation * -1) * this.speed;
        this.y += Math.cos(RADIAN * this.rotation * -1) * this.speed;
    },

    hit: function() {
        new Effect(this.scene, this.x + this.width / 2, this.y + this.height / 2);
        this.parentNode.removeChild(this);
    }
});

const BulletManager = Class.create(Group, {
    initialize: function(scene, amount, interval, id) {
        Group.call(this);
        this.scene = scene;
        scene.addChild(this);
        this.id = id + "_bullet";
        this.amount = amount;
        this.time = 0;
        this.interval = interval;
        this.enable = true;
        this.on("enterframe", function() {
            this.time += 1;
        });
    },

    shot: function(x, y, rotation) {
        if (this.time < this.interval || !this.enable) return;
        if (this.childNodes.length < this.amount) {
            bullet = new Bullet(this.scene, this.id);
            bullet.set(x, y, rotation);
            this.addChild(bullet);
            this.time = 0;
        }
    },

    disable: function() {
        this.enable = false;
    }
});

const Effect = Class.create(Sprite, {
    initialize: function(scene, x, y) {
        Sprite.call(this, 16, 16);
        this.scene = scene;
        this.scene.addChild(this);
        this.image = game.assets[IMAGE.effect];
        this.x = x - this.width / 2;
        this.y = y - this.height / 2;
        this.on("enterframe", function() {
            if (this.frame >= 4 + (1 / 7 * 5)) this.scene.removeChild(this);
            this.frame = this.age / 7 % 4 + 1;
        });
    }
});

const HpBar = Class.create(Surface, {
    initialize: function(scene, obj, x, y) {
        Surface.call(this, game.width, game.height);
        this.scene = scene;
        this.scene.addChild(this);
        this.x = x;
        this.y = y;
        this.x2 = 50;
        this.y2 = 7;
        this.shakePoint = 1;
        this.shakeTime = 0;
        this.visible = true;
        this.on("enterframe", function() {
            if (this.shakeTime > 0) {
                this.shake();
                console.log(this.shakePoint);
                this.shakeTime -= 1;
            } else {
                this.shakePoint = 1;
            }
        });
    },

    draw: function(x, y, ratio) {
        if (!this.visible) return;
        this.context.clearRect(0, 0, this.width, this.height);
        this.context.beginPath();
        this.context.strokeStyle = "white";
        this.context.strokeRect(x*this.shakePoint, y*this.shakePoint, this.x2, this.y2);
        this.context.fill();
        this.context.beginPath();
        this.context.fillStyle = "rgb(" + (255 - ratio * 255) + "," + (ratio * 255) + ", 0, 0.7)";
        this.context.fillRect((x*this.shakePoint)+1, (y*this.shakePoint)+1, this.x2 * ratio - 2, this.y2-2);
        this.context.fill();
    },

    invisible: function() {
        this.visible = false;
        this.context.clearRect(0, 0, this.width, this.height);
    },

    shake: function() {
        this.shakePoint = 1 - (Math.random() - 0.5) % 0.01;
    },

    startShaking: function() {
        this.shakeTime = 10;
    }


});

class Util {

    static getUnitVectorFromAToB(a, b) {
        var vector = {x: 0, y: 0};
        var unitVector = {x: 0, y: 0};
        vector.x = b.x - a.x;
        vector.y = b.y - a.y;
        length = Math.sqrt(vector.x ** 2 + vector.y ** 2);
        unitVector.x = vector.x / length;
        unitVector.y = vector.y / length;
        return unitVector;
    };

    static convertUnitVectorIntoDegree(unitVector) {
        var degree;
        degree = Math.acos(unitVector.y) * (180 / Math.PI);
        if (unitVector.x < 0) degree = 360 - degree;
        return degree;
    };

    static convertDegreeIntoUnitVector(degree) {
        var vector = {x: 0, y: 0};
        vector.x = Math.sin(RADIAN * degree);
        vector.y = Math.cos(RADIAN * degree);
        return vector;
    };

    static getVectorProduct2d(a, b) {
        return a.x * b.y - b.x * a.y;
    };

    static normalize(vector) {
        var unitVector = {x: 0, y: 0};
        length = Math.sqrt(vector.x ** 2 + vector.y ** 2);
        unitVector.x = vector.x / length;
        unitVector.y = vector.y / length;
        return unitVector;
    };

    static angleDiff(a, b) {
        var aAngle;
        var bAngle;
        aAngle = this.convertUnitVectorIntoDegree(a);
        bAngle = this.convertUnitVectorIntoDegree(b);
        return Math.abs(aAngle - bAngle);
    };
}

const main = () => {
    game = new Core();
    game.fps = 60;
    game.preload([IMAGE.tank, IMAGE.effect, IMAGE.icon]);
    game.winer = null;
    scene = game.rootScene;
    scene.backgroundColor = "#666";

    game.on('load', () => {
        // Game Scene の作成
        const gameScene = function() {
            // 初期化
            const scene = new Scene();
            const tank = new Tank(scene, game.width / 2, game.height / 2, 10, "player1");
            const tank2 = new Tank(scene, game.width / 3, game.height / 3, 10, "player2");

            var derayTime = 30; // ゲームオーバー判定から次のシーンまでの余韻
            var isGame = true;


            game.keybind(65, "a");
            game.keybind(68, "d");
            game.keybind(83, "s");
            game.keybind(87, "w");
            game.keybind(90, "z");
            game.keybind(88, "x");
            game.keybind(32, "space");
            game.keybind(16, "shift");

            scene.on("enterframe", function() {
                // player1のコントローラー
                if (game.input.left) tank.rotate(-1);
                if (game.input.right) tank.rotate(1);
                if (game.input.up) tank.move(1);
                if (game.input.down) tank.move(-1);
                if (game.input.z) tank.shot();
                if (game.input.x) {
                    tank.rotationShiftUp();
                } else if (game.input.shift){
                    tank.rotationShiftDown();
                } else {
                    tank.rotationSetNeutral();
                }

                // player2のコントローラー
                if (game.input.a) tank2.rotate(-1);
                if (game.input.d) tank2.rotate(1);
                if (game.input.w) tank2.move(1);
                if (game.input.s) tank2.move(-1);
                if (game.input.z) tank2.shot();
                if (game.input.x) {
                    tank2.rotationShiftUp();
                } else if (game.input.shift){
                    tank2.rotationShiftDown();
                } else {
                    tank2.rotationSetNeutral();
                }

                // ゲームオーバ判定
                if ((tank.parentNode == null || tank2.parentNode == null) && isGame) {
                    isGame = false;
                    if (tank.parentNode == null && tank2.parentNode != null) {
                        game.winer = tank2.id;
                    } else if (tank2.parentNode == null && tank.parentNode != null) {
                        game.winer = tank.id;
                    } else {
                        game.winer = "Nothing";
                    }
                }

                // deryTime後に次のシーンへ
                if (!isGame) {
                    if (derayTime <= 0) {
                        game.pushScene(gameOverScene());
                    } else {
                        derayTime -= 1;
                    }
                }


                // tankの弾とtank2の当たり判定
                tank.bulletM.childNodes.forEach((bullet) => {
                    if (tank2.parentNode != null && bullet.within(tank2, tank2.width-10)) {
                        tank2.hit();
                        bullet.hit();
                    }
                });

                // tank2の弾とtankの当たり判定
                tank2.bulletM.childNodes.forEach((bullet) => {
                    if (tank.parentNode != null && bullet.within(tank, tank.width-10)) {
                        tank.hit();
                        bullet.hit();
                    }
                });

                // tankとtank2の当たり判定
                if (tank.parentNode != null && tank2.parentNode != null && tank.within(tank2, tank2.width-5)) {
                    direction = Util.getUnitVectorFromAToB(tank2, tank);
                    direction2 = Util.getUnitVectorFromAToB(tank, tank2);
                    tank.x += direction.x * tank.speed;
                    tank.y += direction.y * tank.speed;
                    tank2.x += direction2.x * tank.speed;
                    tank2.y += direction2.y * tank.speed;
                }
            });
            return scene;
        }
        // Game Over Scene の作成
        const gameOverScene = function() {
            const scene = new Scene();
            const label = new Label("WINER<br>" + game.winer);
            scene.backgroundColor = "rgb(255, 255, 255, 0.6)";
            label.x = game.width / 2 - label.width / 2;
            label.y = game.height / 2 - 100;
            // label.font = "50px monospace";
            label.textAlign = "center";
            label.scaleX = 3;
            label.scaleY = 3;
            scene.addChild(label);
            return scene;
        }
        game.replaceScene(gameScene());
    });
    game.start();
};

window.addEventListener('load', main);
