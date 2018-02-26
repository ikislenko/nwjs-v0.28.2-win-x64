let lastTime = 0;
let dropCounter = 0;
let dropInterval = 1000;



const Context = {
    canvas: null,
    context: null,
    create: function (canvas_tag_id) {
        this.canvas = document.getElementById(canvas_tag_id);
        this.context = this.canvas.getContext('2d');
        return this.context;
    }
};

const arena = createMatrix(12, 20);
const Player = {
    pos: {
        x: 0,
        y: 0
    },
    matrix: null,
    score: 0,
}

const colors = [
    null, 
    "red",
    "white",
    "violet",
    "green",
    "purple",
    "orange",
    "pink"
];

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x){
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        Player.score += rowCount * 10;
        rowCount *= 2;
    }
}

function updateScore() {
    document.getElementById("score").innerText = Player.score;
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                Context.context.fillStyle = colors[value];
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
        playerReset();
        arenaSweep();
        updateScore();
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
    const [m, o] = [player.matrix, player.pos];

    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function playerRotate(dir) {
    const pos = Player.pos.x;
    let offset = 1;
    rotate(Player.matrix, dir);
    while (collide(arena, Player)) {
        Player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));

        if (offset > Player.matrix[0].length) {
            rotate(Player.matrix, -dir);
            Player.pos.x = pos;
            return;
        }
    }
}

function playerMove(dir) {
    Player.pos.x += dir;
    if (collide(arena, Player)) {
        Player.pos.x -= dir;
    }
}

function playerReset() {
    const pieces = "ILJOTSZ";
    let pType = pieces[pieces.length * Math.random() | 0] 
    console.log(pType);
    Player.matrix = createPiece(pType);
    Player.pos.y = 0;
    Player.pos.x = (arena[0].length / 2 | 0) -
        (Player.matrix[0].length / 2 | 0);

    if (collide(arena, Player)) {
        arena.forEach(row => row.fill(0));
        Player.score = 0;
        updateScore();
    }
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x){
            [
                matrix[x][y],
                matrix[y][x]
            ] = [
                    matrix[y][x],
                    matrix[x][y]
                ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function createPiece(type) {
    if (type === "T") {
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0]
        ];
    } else if (type === "O") {
        return [
            [2, 2, 0],
            [2, 2, 0],
            [0, 0, 0],
        ];
    } else if (type === "L") {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3]
        ];
    } else if (type === "J") {
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0]
        ];
    } else if (type === "S") {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0]
        ];
    } else if (type === "Z") {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0]
        ];
    } else if (type === "I") {
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0]
        ];
    }
}

(function() {
    // Initialize
    Context.create('canvas');
    // Context.context.beginPath();
    Context.context.scale(20, 20);
    playerReset();
    updateScore();
    update();
    document.addEventListener("keydown", event => {
        console.log(event.keyCode)
        if (event.keyCode == 37) {
            playerMove(-1);
        } else if (event.keyCode == 39) {
            playerMove(1);
        } else if (event.keyCode == 40) {
            playerDrop();
        } else if (event.keyCode == 81) {
            playerRotate(-1);
        } else if (event.keyCode == 87) {
            playerRotate(1);
        }
    });
})();