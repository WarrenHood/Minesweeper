WINDOW_WIDTH = window.innerWidth;
WINDOW_HEIGHT = window.innerHeight;

PLAY_WIDTH = 800
PLAY_HEIGHT = 800

OFFSET_X = (WINDOW_WIDTH - PLAY_WIDTH) / 2
OFFSET_Y = (WINDOW_HEIGHT - PLAY_HEIGHT) / 2

GRID_WIDTH = 30
GRID_HEIGHT = 30

BOMB_FRAC = 0.2

GAMESTATE = "PLAYING"

var GRID = []

function resetGame() {
    loadSettings();
    populateGrid(GRID_WIDTH, GRID_HEIGHT);
    updateGameState("PLAYING");
}

function updateGameState(newState) {
    GAMESTATE = newState;
    document.getElementById("gamestate").innerHTML = GAMESTATE;
}

function loadSettings() {
    BOMB_FRAC = document.getElementById("difficulty").value / 100.0;
    let gridSize = document.getElementById("gridSize").value;
    GRID_WIDTH = gridSize;
    GRID_HEIGHT = gridSize;
}

function getTopLeft(x, y, cellSize) {
    return {
        x: OFFSET_X + x * cellSize,
        y: OFFSET_Y + y * cellSize
    }
}

function getPos(block) {
    let split_id = block.id.split(",");
    let x = 1 * split_id[0];
    let y = 1 * split_id[1];
    return { x, y };
}

function getBlock(x, y) {
    return document.getElementById(x + "," + y);
}

function revealZeroCell(x, y) {
    let block = getBlock(x, y);
    block.className = "cell revealed";
    block.innerHTML = "";
    let brown = 150 + Math.round(Math.random() * 105);
    block.style.backgroundColor = `rgba(${brown},${brown/1.2},${brown/1.2})`;

    let q = []
    for (let dx = -1; dx <= 1; ++dx) {
        for (let dy = -1; dy <= 1; ++dy) {
            if (dx === 0 && dy === 0) continue;
            if (x + dx < 0 || x + dx >= GRID_WIDTH || y + dy < 0 || y + dy >= GRID_HEIGHT) continue;
            if (GRID[y + dy][x + dx] >= 0 && getBlock(x + dx, y + dy).className.includes("unknown")) q.push({ x: x + dx, y: y + dy });
        }
    }

    while (q.length > 0) {
        let pos = q.pop();

        let block = getBlock(pos.x, pos.y);
        if (GRID[pos.y][pos.x] > 0) {
            revealNonZeroCell(pos.x, pos.y);
        } else {
            block.className = "cell revealed";
            block.innerHTML = "";
            let brown = 150 + Math.round(Math.random() * 105);
            block.style.backgroundColor = `rgba(${brown},${brown/1.2},${brown/1.2})`;


            for (let dx = -1; dx <= 1; ++dx) {
                for (let dy = -1; dy <= 1; ++dy) {
                    if (dx === 0 && dy === 0) continue;
                    if (pos.x + dx < 0 || pos.x + dx >= GRID_WIDTH || pos.y + dy < 0 || pos.y + dy >= GRID_HEIGHT) continue;
                    if (GRID[pos.y + dy][pos.x + dx] >= 0 && getBlock(pos.x + dx, pos.y + dy).className.includes("unknown")) q.push({ x: pos.x + dx, y: pos.y + dy });
                }
            }
        }
    }
}

function revealNonZeroCell(x, y) {
    let block = getBlock(x, y);
    block.className = "cell revealed";
    block.innerHTML = GRID[y][x];
    let brown = 150 + Math.round(Math.random() * 105);
    block.style.backgroundColor = `rgba(${brown},${brown/1.2},${brown/1.2})`;
}

function revealAllBombs() {
    updateGameState("YOU LOSE!");
    for (let y = 0; y < GRID_HEIGHT; ++y) {
        for (let x = 0; x < GRID_WIDTH; ++x) {
            if (GRID[y][x] === -1) {
                let block = getBlock(x, y);
                block.className = "cell bomb";
                block.style.backgroundColor = "red";
                block.style.innerHTML = "";
            }
        }
    }
}

function checkWin() {
    for (let y = 0; y < GRID_HEIGHT; ++y) {
        for (let x = 0; x < GRID_WIDTH; ++x) {
            if (GRID[y][x] !== -1) {
                let block = getBlock(x, y);
                if (!block.className.includes("revealed")) return;
            }
        }
    }
    updateGameState("YOU WIN!")
}

function handleClick(eventData) {
    if (GAMESTATE !== "PLAYING") return;

    // Left click
    if (eventData.button === 0) {
        if (this.className.includes("unknown")) {
            let pos = getPos(this);
            if (GRID[pos.y][pos.x] > 0) {
                revealNonZeroCell(pos.x, pos.y);
                checkWin();
            } else if (GRID[pos.y][pos.x] === 0) {
                revealZeroCell(pos.x, pos.y);
                checkWin();
            } else if (GRID[pos.y][pos.x] === -1) {
                revealAllBombs();
            }
        }
    }

    // Right click?
    else {
        if (this.className.includes("unknown")) {
            this.className = "cell marked";
            this.style.backgroundColor = "yellow";
        } else if (this.className.includes("marked")) {
            this.className = "cell unknown";
            let green = 150 + Math.round(Math.random() * 105);
            this.style.backgroundColor = `rgba(0,${green},0)`;
        }
    }


}

function populateGrid(width, height) {
    GRID = []
    let grid = document.getElementById("field");
    grid.innerHTML = "";
    let cellSize = Math.min(PLAY_WIDTH / width, PLAY_HEIGHT / height);

    for (let y = 0; y < height; ++y) {
        let row = [];
        for (let x = 0; x < width; ++x) {
            row.push(null);
            let block = document.createElement("div");
            let pos = getTopLeft(x, y, cellSize);
            block.id = x + "," + y;
            block.className = "cell unknown";
            block.style.height = cellSize + "px";
            block.style.width = cellSize + "px";
            block.style.left = pos.x + "px";
            block.style.top = pos.y + "px";
            block.style.fontSize = cellSize + "px";
            let green = 150 + Math.round(Math.random() * 105);
            block.style.backgroundColor = `rgba(0,${green},0)`;
            block.onmousedown = handleClick;
            grid.appendChild(block);
        }
        GRID.push(row);
    }

    placeBombs(width, height);
}

function countBombs(x, y) {
    let c = 0;
    for (let dx = -1; dx <= 1; ++dx) {
        for (let dy = -1; dy <= 1; ++dy) {
            if (dx === 0 && dy === 0) continue;
            if (x + dx < 0 || x + dx >= GRID_WIDTH || y + dy < 0 || y + dy >= GRID_HEIGHT) continue;
            if (GRID[y + dy][x + dx] === -1) ++c;
        }
    }
    return c;
}

function placeBombs(width, height) {
    let bombs = Math.round(GRID_WIDTH * GRID_HEIGHT * BOMB_FRAC);
    while (bombs > 0) {
        let x = Math.round(Math.random() * (GRID_WIDTH - 1));
        let y = Math.round(Math.random() * (GRID_HEIGHT - 1));
        if (GRID[y][x] === null) {
            bombs--;
            GRID[y][x] = -1;
        }
    }

    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            if (GRID[y][x] === null) {
                GRID[y][x] = countBombs(x, y);
            }
        }
    }
}

window.onload = function() {
    resetGame();
}