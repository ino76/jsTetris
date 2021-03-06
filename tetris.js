const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");

context.scale(20, 20);
const arena = createMatrix(12, 20);

function createPiece(type) {
  if (type === "I") {
    return [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]];
  } else if (type === "L") {
    return [[0, 2, 0], [0, 2, 0], [0, 2, 2]];
  } else if (type === "J") {
    return [[0, 3, 0], [0, 3, 0], [3, 3, 0]];
  } else if (type === "O") {
    return [[4, 4], [4, 4]];
  } else if (type === "Z") {
    return [[5, 5, 0], [0, 5, 5], [0, 0, 0]];
  } else if (type === "S") {
    return [[0, 6, 6], [6, 6, 0], [0, 0, 0]];
  } else if (type === "T") {
    return [[0, 7, 0], [7, 7, 7], [0, 0, 0]];
  }
}

const colors = [
  null,
  "#FF0D72",
  "#0DC2FF",
  "#0DFF72",
  "#F538FF",
  "#FF8E0D",
  "#FFE138",
  "#3877FF"
];

function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; y++) {
    for (let x = 0; x < m[y].length; x++) {
      if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }

  return matrix;
}

function draw() {
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
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

function playerMove(dirrection) {
  player.pos.x += dirrection;
  if (collide(arena, player)) {
    player.pos.x -= dirrection;
  }
}

function playerReset() {
  const pieces = "TOLJISZ";
  player.matrix = createPiece(pieces[(pieces.length * Math.random()) | 0]);
  player.pos.y = 0;
  player.pos.x =
    ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
  }
  arenaSweep();
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < y; x++) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

function playerRotate(dir) {
  let move = 1;
  const pos = player.pos.x;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    playerMove(move);
    console.log(move);
    move = -move;
    if (collide(arena, player) && move > 0) {
      move++;
    }
    if (move > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    return 0;
  }
  dropCounter = 0;
  return 1;
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

const matrix = [[1]];

const player = {
  pos: { x: 0, y: 0},
  matrix: null,
  score: 0
};

function arenaSweep() {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y > 0; y--) {
    for (let x = 0; x < arena[y].length; x++) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }

    player.score += rowCount * 10;
    rowCount *= 2;
    updateScore();
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    y++;
  }
}

function updateScore() {
    document.getElementById('score').innerText = player.score;
}

function playerDropDown() {
  while(playerDrop()) {}
}

document.addEventListener("keydown", event => {
  switch (event.keyCode) {
    case 37:
      playerMove(-1);
      break;
    case 38:
      playerDropDown();
      break;
    case 39:
      playerMove(1);
      break;
    case 40:
      playerDrop();
      break;
    case 81:
      playerRotate(-1);
      break;
    case 87:
      playerRotate(1);
      break;
  }
});

playerReset();
update();
