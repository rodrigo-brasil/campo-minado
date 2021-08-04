const EASY = [10, 15, 15];
const MEDIUM = [15, 17, 40];
const HARD = [25, 36, 160];
let isStartedGame = false;
let currentTime = 0;
let board;
let difficulty;
let stopWatch; //setInterval id
const height = window.innerHeight
  || document.documentElement.clientHeight
  || document.body.clientHeight;

/* Create camp  class*/
class Camp {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.bomb = false;
    this.marked = false;
    this.open = false;
  }

  flag() {
    if (!this.open) {
      this.marked = !this.marked;
    }
  }

  hasGoalAchieved() {
    let isRevealed = this.open && !this.bomb
    let isMarked = this.marked && this.bomb
    return isMarked || isRevealed
  }
}

/* reference for grid element */
const minefield = document.querySelector("#minefield");

/* reference for buttons */
const easyBtn = document.querySelector("#easy-option");
const mediumBtn = document.querySelector("#medium-option");
const hardBtn = document.querySelector("#hard-option");

/* reference for display data */
const bombs_left = document.querySelector("#bombs-left");
const timerElement = document.querySelector("#timer");

/* reference for overlays display */
const overlays = Array.from(document.getElementsByClassName('overlay-text'));

/* setInterval */
function startTimer() {
  if (isStartedGame) return
  currentTime = 0;
  stopWatch = setInterval(timer, 1000);
  isStartedGame = true;
}

function stopTimer() {
  clearInterval(stopWatch);
  /*   currentTime = 0;
    timerElement.innerHTML = '00:00:00'; */
  isStartedGame = false;
}

function timer() {
  currentTime++;
  timerElement.innerHTML = getFormatedTime();
}

const getFormatedTime = () => {
  let min = Math.trunc(currentTime / 60);
  let sec = currentTime % 60;
  let hours = 0;
  if (min >= 60) {
    hours = Math.trunc(min / 60);
    min = currentTime % 60;
    return [hours, min, sec].map(unit => unit < 10 ? `0${unit}` : unit).join(':');
  }
  else
    return [min, sec].map(unit => unit < 10 ? `0${unit}` : unit).join(':');
};

/* functions for update HTML */
function renderField(board) {
  removeChildElements(minefield);

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[1].length; j++) {
      let camp = document.createElement("div");
      minefield.appendChild(camp).classList =
        "x" + i + " " + "y" + j + " item " + getClassFromCamp(board[i][j]);
    }
  }
  let template_columns = "grid-template-columns: repeat(" + board[1].length + ",minmax(10px, 45px));";
  minefield.setAttribute("style", template_columns);
}

function changeClass(camp) {
  elements = document.getElementsByClassName("x" + camp.row + " " + "y" + camp.col) //todo: pass class to id
  element = elements[0]

  if (!camp.open) {
    (camp.marked == true)
      ? element.classList.replace("close", "marked")
      : element.classList.replace("marked", "close");
  } else
    if (camp.bomb) {
      element.classList.replace("close", "bomb");
    } else {
      element.classList.replace("close", "open");
      element.innerText = calcAdjBombs(camp) == 0 ? "" : calcAdjBombs(camp)
    }
}

function getClassFromCamp(camp) {
  if (!camp.open) {
    if (camp.marked) return "marked";
    return "close";
  }
  if (camp.open) {
    if (camp.bomb) return "bomb";
    return "open";
  }
  console.erro("Erro com as classes")
  return "";
}

function UpdateBombsCount() {
  let tester = board.flat();
  let marked = tester.filter(x => x.marked)
  bombs_left.innerText = `${difficulty[2] - marked.length}/${difficulty[2]}`
}

function removeChildElements(parent) {
  while (parent.firstChild) {
    parent.firstChild.remove();
  }
}

/* game functions */
function createCamps() {
  const field = Array.from(Array(difficulty[0]), () => new Array(difficulty[1]));
  for (let i = 0; i < field.length; i++) {
    for (let j = 0; j < field[1].length; j++) {
      field[i][j] = new Camp(i, j);
    }
  }
  return field;
}

function mineCamps() {
  let mines = 0;
  while (mines < difficulty[2]) {
    let randRow = Math.floor(Math.random() * board.length);
    let randCol = Math.floor(Math.random() * board[1].length);
    if (!board[randRow][randCol].bomb) {
      board[randRow][randCol].bomb = true;
      mines++;
    }
  }
}

function changeGameMode(difficulty) {
  init(difficulty);
}

function findCampPosition(item) {
  if (item != undefined) {
    let row = parseInt(item.classList?.item(0).substring(1))
    let col = parseInt(item.classList?.item(1).substring(1))
    return board[row][col];
  }
  console.log("Erro ao encontrar posição do Campo");
  return null
}

function markCamp(element) {
  const camp = findCampPosition(element)
  if (camp != null && camp instanceof Camp) {
    camp.flag();
    changeClass(camp);
    UpdateBombsCount()
  }
}

function openCamp(camp) {
  camp.open = true;

  if (camp.bomb) {
    changeClass(camp);
    gameOver()
  }
  else {
    changeClass(camp);
    if (calcAdjBombs(camp) == 0) {
      getAdjCamps(camp)
        .filter((x) => !x.open && !x.marked)
        .forEach((x) => openCamp(x));
    }
  }

  if (isWin()) {
    document.getElementById('win-text').classList.add('visible');
  }
}

//game over
function gameOver() {
  stopTimer();
  abrirtudo();
  document.getElementById('game-over-text').classList.add('visible');
}

function abrirtudo() {
  board.forEach(linha => linha.forEach(camp => !camp.bomb || (camp.open = true)))
  renderField(board)
}

function calcAdjBombs(camp) {
  return getAdjCamps(camp).filter((x) => x.bomb).length;
}

function getAdjCamps(camp) {
  let adjCamps = [];
  let row = camp.row;
  let col = camp.col;
  let lasRow = board.length - 1;
  let lastCol = board[1].length - 1;
  if (row > 0 && col > 0) adjCamps.push(board[row - 1][col - 1]);
  if (row > 0) adjCamps.push(board[row - 1][col]);
  if (row > 0 && col < lastCol) adjCamps.push(board[row - 1][col + 1]);
  if (col < lastCol) adjCamps.push(board[row][col + 1]);
  if (col > 0) adjCamps.push(board[row][col - 1]);
  if (row < lasRow && col > 0) adjCamps.push(board[row + 1][col - 1]);
  if (row < lasRow) adjCamps.push(board[row + 1][col]);
  if (row < lasRow && col < lastCol) adjCamps.push(board[row + 1][col + 1]);
  return adjCamps;
}

//check for win
function isWin() {
  let tester = [].concat(...board)
  return tester.every(x => x.hasGoalAchieved())
}

function init(gameOptions = EASY) {
  difficulty = gameOptions
  board = createCamps(difficulty);
  mineCamps(difficulty);
  renderField(board);
  UpdateBombsCount(difficulty);
  stopTimer();
}

/* setting listeners */
easyBtn.addEventListener("click", () => changeGameMode(EASY));
mediumBtn.addEventListener("click", () => changeGameMode(MEDIUM));
hardBtn.addEventListener("click", () => changeGameMode(HARD));

document.body.addEventListener("contextmenu", (e) => {
  e.target?.classList?.contains("item") && e.preventDefault();
  e.target?.classList?.contains("item") && markCamp(e.target);
  e.target?.classList?.contains("item") && startTimer();
});

document.body.addEventListener("click", (e) => {
  e.target?.classList?.contains("close") && startTimer();
  e.target?.classList?.contains("close") && openCamp(findCampPosition(e.target));
});

overlays.forEach(overlay => {
  overlay.addEventListener('click', () => {
    overlay.classList.remove('visible');
    init();
  });
});

//initialize
init();
