const Context = {
    canvas: null,
    context: null,
    create: function (canvas_tag_id) {
        this.canvas = document.getElementById(canvas_tag_id);
        this.context = this.canvas.getContext('2d');
        return this.context;
    }
};

const matrix = [
    [0, 0, 0],
    [1, 1, 1],
    [0, 1, 0],
];

const player = {
    pos: {
        x: 5,
        y: 5
    },
    matrix: matrix
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

    drawFigure(player.matrix, player.pos);
}

(function() {
    // Initialize
    Context.create('canvas');
    // Context.context.beginPath();
    Context.context.scale(20, 20);

    draw();
})();