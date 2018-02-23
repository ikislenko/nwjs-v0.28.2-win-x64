const Context = {
    canvas: null,
    context: null,
    create: function (canvas_tag_id) {
        this.canvas = document.getElementById(canvas_tag_id);
        this.context = this.canvas.getContext('2d');
        return this.context;
    }
};

const Matrix = [
    [0, 0, 0],
    [1, 1, 1],
    [0, 1, 0],
];

const Player = {
    pos: {
        x: 5,
        y: 5
    },
    matrix: Matrix
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                Context.context.fillStyle = 'red';
                Context.context.fillRect(x + offset.x,
                                         y + offset.y,
                                        1, 1);
            }
        });
    });
}

function draw() {
    Context.context.fillStyle = "#000";
    Context.context.fillRect(0, 0, Context.canvas.width, Context.canvas.height);

    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(Player.matrix, Player.pos);
}

let lastTime = 0;
let dropCounter = 0;
let dropInterval = 1000;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}

function playerDrop() {
    Player.pos.y++;
    if (collide(arena, Player)) {
        Player.pos.y--;
        merge(arena, Player);
        Player.pos.y = 0;
    }
    dropCounter = 0;
}

function createMatrix(w, h) {
    const matrix = [];

    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos]

    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function playerMove(dir) {
    Player.pos.x += dir;
    if (collide(arena, Player)) {
        Player.pos.x -= dir;
    }
}

const arena = createMatrix(12, 20);

(function() {
    // Initialize
    Context.create('canvas');
    // Context.context.beginPath();
    Context.context.scale(20, 20);

    update();
    document.addEventListener("keydown", event => {
        if (event.keyCode == 37) {
            playerMove(-1);
        } else if (event.keyCode == 39) {
            playerMove(1);
        } else if (event.keyCode == 40) {
            playerDrop();
        }
    });
})();