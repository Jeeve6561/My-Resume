const GRAPH = document.getElementById("graph");
const ROWS = 10;
const COLS = 15;
let HEIGHT = GRAPH.clientHeight / ROWS;
let WIDTH = GRAPH.clientWidth / COLS;
let SETTING = null;
let START_SQUARE = null;
let END_SQUARE = null;
let WALL_SQUARES = {};
let NEIGHBORS = {};
const START_BUTTON = document.getElementById("start");
const END_BUTTON = document.getElementById("end");
const WALL_BUTTON = document.getElementById("wall");
const DONE_BUTTON = document.getElementById("done");
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

function MakeGrid(rows, cols) {
  HEIGHT = GRAPH.clientHeight / ROWS;
  WIDTH = GRAPH.clientWidth / COLS;
  for (let r = 0; r < rows; r++) {
    gridRow = document.createElement("div");
    for (let c = 0; c < cols; c++) {
      cell = document.createElement("div");
      cell.style.height = HEIGHT + "px";
      cell.style.width = WIDTH + "px";
      console.log(cell.style.height, cell.style.width);
      cell.setAttribute("id", r + "-" + c);
      cell.classList.add("square");
      cell.onmousedown = (event) => {
        SetCellClick(event.target);
      };
      cell.onmouseover = (event) => {
        SetCellDrag(event);
      };
      WALL_SQUARES[cell.id] = "clear";
      gridRow.appendChild(cell);
    }
    gridRow.style.height = HEIGHT + "px";
    gridRow.classList.add("row");
    GRAPH.appendChild(gridRow);
  }
}

function ResetGrid() {
  console.log("Resetting grid");
  DoneWithSettings();
  START_SQUARE = null;
  END_SQUARE = null;
  GRAPH.innerHTML = "";
  MakeGrid(ROWS, COLS);
}

function ChangeSetting(type) {
  if (SETTING === "start") {
    START_BUTTON.classList.remove("startpressed");
  } else if (SETTING === "end") {
    END_BUTTON.classList.remove("endpressed");
  } else if (SETTING === "wall") {
    WALL_BUTTON.classList.remove("wallpressed");
  }

  if (type === "start") {
    START_BUTTON.classList.add("startpressed");
  } else if (type === "end") {
    END_BUTTON.classList.add("endpressed");
  } else if (type === "wall") {
    WALL_BUTTON.classList.add("wallpressed");
  }

  SETTING = type;
}

function DoneWithSettings() {
  if (SETTING === "start") {
    START_BUTTON.classList.remove("startpressed");
  } else if (SETTING === "end") {
    END_BUTTON.classList.remove("endpressed");
  } else if (SETTING === "wall") {
    WALL_BUTTON.classList.remove("wallpressed");
  }
  SETTING = null;
}

function SetCellClick(cell) {
  if (SETTING === "start") {
    if (START_SQUARE != null) {
      oldStart = document.getElementById(START_SQUARE);
      oldStart.classList = [];
      oldStart.classList.add("square");
      WALL_SQUARES[START_SQUARE] = "clear";
    }
    START_SQUARE = cell.id;
    cell.classList = [];
    cell.classList.add("startsquare");
    WALL_SQUARES[cell.id] = "start";
  } else if (SETTING === "end") {
    if (END_SQUARE != null) {
      oldEnd = document.getElementById(END_SQUARE);
      oldEnd.classList = [];
      oldEnd.classList.add("square");
      WALL_SQUARES[END_SQUARE] = "clear";
    }
    END_SQUARE = cell.id;
    cell.classList = [];
    cell.classList.add("endsquare");
    WALL_SQUARES[cell.id] = "end";
  } else if (
    SETTING === "wall" &&
    cell.id != START_SQUARE &&
    cell.id != END_SQUARE
  ) {
    cell.classList = [];
    cell.classList.add("wallsquare");
    WALL_SQUARES[cell.id] = "wall";
  }
}

function SetCellDrag(event) {
  if (
    SETTING === "wall" &&
    event.buttons === 1 &&
    event.target.id != START_SQUARE &&
    event.target.id != END_SQUARE
  ) {
    cell = event.target;
    cell.classList.remove("square");
    cell.classList.add("wallsquare");
    WALL_SQUARES[cell.id] = "wall";
  }
}

window.onresize = () => {
  ResetGrid();
};
window.onmousedown = (event) => {
  event.preventDefault();
};
MakeGrid(ROWS, COLS);

function GetNeighbors(cellId) {
  let coords = cellId.split("-");
  let row = parseInt(coords[0]);
  let col = parseInt(coords[1]);

  let neighbors = [];
  let neighborId = "";
  if (row > 0) {
    neighborId = (row - 1).toString() + "-" + col.toString();
    if (WALL_SQUARES[neighborId] != "wall") {
      neighbors.push(neighborId);
    }
  }
  if (row < ROWS - 1) {
    neighborId = (row + 1).toString() + "-" + col.toString();
    if (WALL_SQUARES[neighborId] != "wall") {
      neighbors.push(neighborId);
    }
  }
  if (col > 0) {
    neighborId = row.toString() + "-" + (col - 1).toString();
    if (WALL_SQUARES[neighborId] != "wall") {
      neighbors.push(neighborId);
    }
  }
  if (col < COLS - 1) {
    neighborId = row.toString() + "-" + (col + 1).toString();
    if (WALL_SQUARES[neighborId] != "wall") {
      neighbors.push(neighborId);
    }
  }

  NEIGHBORS[cellId] = neighbors;
}

function GetAllNeighors() {
  Object.keys(WALL_SQUARES).forEach((key) => {
    let val = WALL_SQUARES[key];
    if (val != "wall" && val != "end") {
      GetNeighbors(key);
    }
  });
}

function StartSearch() {
  DoneWithSettings();

  if (START_SQUARE === null || END_SQUARE === null) {
    alert("You must have a start and an end!");
    return;
  }

  GetAllNeighors();

  RunDijkstra();
}

async function RunDijkstra() {
  let queue = [];
  let prev = {};
  let distances = {};

  queue.push(START_SQUARE);
  distances[START_SQUARE] = 0;

  let sleep_time = 5000 / (ROWS * COLS);

  while (queue.length != 0) {
    await sleep(sleep_time);
    let currnode = queue.shift();
    if (currnode === END_SQUARE) {
      break;
    }
    NEIGHBORS[currnode].forEach((neighbor) => {
      let dist = distances[currnode] + 1;
      if (!(neighbor in prev) || dist < distances[neighbor]) {
        distances[neighbor] = dist;
        prev[neighbor] = currnode;
        queue.push(neighbor);
        if (neighbor !== START_SQUARE) {
          document.getElementById(neighbor).classList.add("searchingsquare");
        }
        if (currnode !== START_SQUARE) {
          document.getElementById(currnode).classList.add("searchedsquare");
        }
      }
    });
  }
  document.getElementById(START_SQUARE).classList = [];
  document.getElementById(START_SQUARE).classList.add("startsquare");
  document.getElementById(END_SQUARE).classList = [];
  document.getElementById(END_SQUARE).classList.add("endsquare");

  if (!(END_SQUARE in prev)) {
    alert("There is no path!");
  }

  let path = [];
  let prevnode = END_SQUARE;
  while (prevnode !== START_SQUARE) {
    path.push(prevnode);
    prevnode = prev[prevnode];
  }

  path.forEach((node) => {
    if (node !== END_SQUARE && node !== START_SQUARE) {
      document.getElementById(node).classList = [];
      document.getElementById(node).classList.add("pathsquare");
    }
  });
}
