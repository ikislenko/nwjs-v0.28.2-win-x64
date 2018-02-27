const tetrisManager = new TetrisManager(document);
const localTetris = tetrisManager.createPlayer();

const connectionManager = new ConnectionManager();
connectionManager.connect("ws://localhost:9000");
const keyListener = (event) => {
    [
        [65,68,81,69,83]
    ].forEach((key, index) => {
        const player = localTetris.player;
        if (event.type === "keydown") {
            if (event.keyCode === key[0]) {
                player.move(-1);
            } else if (event.keyCode === key[1]) {
                player.move(1);
            } else if (event.keyCode === key[2]) {
                player.rotate(-1);
            } else if (event.keyCode === key[3]) {
                player.rotate(1);
            }
        } 
        if (event.keyCode === key[4]) {
            player.drop();
        }
    });
}

(function() {
    document.addEventListener("keydown", keyListener);
    document.addEventListener("keyup", keyListener);
})();