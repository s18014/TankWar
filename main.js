enchant();

let game, scene;

IMAGE = {
    tank: "./assets/images/chara3.png",
    effect: "./assets/images/effect0.png",
    icon: "./assets/images/icon0.png"
};

// RADIAN = Math.PI / 180;

const main = () => {
    game = new Core();
    game.fps = 60;
    game.preload(IMAGE.tank);
    game.preload(IMAGE.effect);
    game.preload(IMAGE.icoc);
    scene = game.rootScene;
    scene.backgroundColor = "#666";

    game.on('load', () => {
    });
    game.start();
};

window.addEventListener('load', main);
