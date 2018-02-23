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
        Player.pos.y++;
        dropCounter = 0;
    }
    draw();
    requestAnimationFrame(update);
}


(function() {
    // Initialize
    Context.create('canvas');
    // Context.context.beginPath();
    Context.context.scale(20, 20);

    update();

    document.addEventListener("keydown", event => {
        console.log(event)

        if (event.keyCode == 37) {
            Player.pos.x--;
        }

        if (event.keyCode == 39) {
            Player.pos.x++;
        }

        // if (event.keyCode == 37) {

        // }

        // if (event.keyCode == 37) {

        // }
    });
})();