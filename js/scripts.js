const EASY = [10, 15, 15];
const MEDIUM = [15, 17, 40];
const HARD = [25, 36, 170];
let board;
let difficulty;
let currentTime = 0;
let stopWatch; //setInterval
let isStartedGame = false;
const height = window.innerHeight
  || document.documentElement.clientHeight
  || document.body.clientHeight;
  
const states = {
  MARKED: "marked",
  BOMB: "bomb",
  OPEN: "open",
  CLOSE: "close",
};

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
    return this.marked;
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

/* reference for display bombs */
const bombs_left = document.querySelector("#bombs-left");
const timerElement = document.querySelector("#timer");

/* setInterval */
function startTimer() {
  if (isStartedGame) return console.log("não começou")
  console.log("startandoNovo")
  stopWatch = setInterval(timer, 1000);
  isStartedGame = true;
}

function stopTimer() {
  clearInterval(stopWatch);
  currentTime = 0;
  timerElement.innerHTML = '00:00:00';
  isStartedGame = false;
}

function timer() {
  currentTime++;
  let min = Math.trunc(currentTime / 60);
  let sec = currentTime % 60;
  let hours = 0;
  if (min >= 60) {
    hours = Math.trunc(min / 60);
    min = currentTime % 60;
  }
  timerElement.innerHTML = (hours < 10 ? `0${hours}:` : hours) + (min < 10 ? `0${min}:` : min) + (sec < 10 ? `0${sec}` : sec)
}

/* functions */
function renderField(board) {
  removeChildElements(minefield);

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[1].length; j++) {
      let camp = document.createElement("div");
      minefield.appendChild(camp).classList =
        "x" + i + " " + "y" + j + " item " + getClassFromCamp(board[i][j]);
    }
  }
  let template_columns = "grid-template-columns: repeat(" + board[1].length + ",minmax(25px, 45px));";
  minefield.setAttribute("style", template_columns);
}

function createCamps() {
  let arr = Array.from(Array(difficulty[0]), () => new Array(difficulty[1]));
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[1].length; j++) {
      arr[i][j] = new Camp(i, j);
    }
  }
  return arr;
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

function removeChildElements(parent) {
  while (parent.firstChild) {
    parent.firstChild.remove();
  }
}

function changeClass(evento, camp) {
  elements = document.getElementsByClassName("x" + camp.row + " " + "y" + camp.col)
  element = elements[0]
  switch (evento) {
    case states.MARKED:
      camp.marked == true
        ? element.classList.replace("close", "marked")
        : element.classList.replace("marked", "close");
      break;
    case states.BOMB:
      element.classList.replace("close", "bomb");
      abrirtudo();
      break;
    case states.OPEN:
      element.classList.replace("close", "open");
      element.innerText = calcAdjBombs(camp) == 0 ? "" : calcAdjBombs(camp)
      break;
    default:
      element.classList.replace("close", "open");
      console.log("default")
      break;
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
  return "tem algo faltando!!!";
}

/* game functions */
function findCampPosition(item) {
  if (item != undefined) {
    let row = parseInt(item.classList?.item(0).substring(1))
    let col = parseInt(item.classList?.item(1).substring(1))
    return board[row][col];

  }
  return console.log("Erro ao encontrar possição do Campo")
}

function markCamp(camp) {
  camp.flag();
  changeClass(states.MARKED, camp);
  calcBombsLeft()
}

function openCamp(camp) {
  if (camp.bomb) {
    changeClass(states.BOMB, camp);
    alert("Perdeu!");
    return
  }
  if (calcAdjBombs(camp) > 0) {
    camp.open = true;
    changeClass(states.OPEN, camp);
  }
  if (calcAdjBombs(camp) == 0) {
    camp.open = true;
    changeClass(states.OPEN, camp);
    getAdjCamps(camp)
      .filter((x) => !x.open && !x.marked)
      .forEach((x) => openCamp(x));
  }
  if (isWin()) {
    alert("Ganhou!")
  }
}

function abrirtudo() {
  board.forEach(linha => linha.forEach(camp => camp.hasGoalAchieved() || (camp.open = true)))
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

function isWin() {
  let tester = [].concat(...board)
  return tester.every(x => x.hasGoalAchieved())
}

function calcBombsLeft() {
  let tester = board.flat();
  let opens = tester.filter(x => x.open)
  let marked = tester.filter(x => x.marked)
  bombs_left.innerText = `Minas: ${difficulty[2] - marked.length}`
}

function init(gameOptions = EASY) {
  difficulty = gameOptions
  board = createCamps(difficulty);
  mineCamps(difficulty);
  renderField(board);
  calcBombsLeft(difficulty);
  stopTimer();
}

/* setting listeners */
easyBtn.addEventListener("click", () => changeGameMode(EASY));
mediumBtn.addEventListener("click", () => changeGameMode(MEDIUM));
hardBtn.addEventListener("click", () => changeGameMode(HARD));

document.body.addEventListener("contextmenu", (e) => {
  e.target?.classList?.contains("item") && e.preventDefault();
  e.target?.classList?.contains("item") && markCamp(findCampPosition(e.target));
  e.target?.classList?.contains("item") && startTimer();
});

document.body.addEventListener("click", (e) => {
  e.target?.classList?.contains("close") && startTimer();
  e.target?.classList?.contains("close") && openCamp(findCampPosition(e.target));
});

//initialize
init();
