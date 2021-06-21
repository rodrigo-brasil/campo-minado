const EASY = [10, 10, 10];
const MEDIUM = [16, 16, 40];
const HARD = [30, 30, 170];
let board;
let sartGame;
let difficulty;
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
}

/* reference for grid element */
const minefield = document.getElementById("minefield");

/* reference for buttons */
const easyBtn = document.getElementById("easy-option");
const mediumBtn = document.getElementById("medium-option");
const hardBtn = document.getElementById("hard-option");

/* reference for display bombs */
const bombs_left = document.getElementById("bombs-left");

/* functions */
function renderField(board) {
  removeChildElements(minefield);

  for (let i = 0; i < board[0].length; i++) {
    for (let j = 0; j < board[1].length; j++) {
      let camp = document.createElement("div");
      minefield.appendChild(camp).classList =
        "x" + i + " " + "y" + j + " item " + getClassFromCamp(board[i][j]);
    }
  }
  let template_columns = "grid-template-columns: repeat(" + board[0].length + ",1fr);grid-template-rows: repeat(" + board[0].length + ",1fr);";
  minefield.setAttribute("style", template_columns);
}

function createCamps() {
  let arr = Array.from(Array(difficulty[0]), () => new Array(difficulty[1]));
  for (let i = 0; i < difficulty[0]; i++) {
    for (let j = 0; j < difficulty[1]; j++) {
      arr[i][j] = new Camp(i, j);
    }
  }
  return arr;
}

function mineCamps() {
  let mines = 0;
  while (mines < difficulty[2]) {
    let randRow = Math.floor(Math.random() * board[0].length);
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
    element =  elements[0]
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
    if(item != undefined){
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
  if (camp.bomb){
    changeClass(states.BOMB, camp);
    console.log("bomb")
    return
  }
  if (calcAdjBombs(camp) > 0) {
    //console.log(calcAdjBombs(camp))
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
}

function abrirtudo() {
  board.forEach(linha => linha.forEach(camp => camp.open = true))
  renderField(board)
}

function calcAdjBombs(camp) {
  return getAdjCamps(camp).filter((x) => x.bomb).length;
}

function getAdjCamps(camp) {
  let adjCamps = [];
  let row = camp.row;
  let col = camp.col;
  let lasRow = board[0].length - 1;
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

function isWinner(){
 let tester = [].concat(...board)
  return tester.some(x => x.open && x.bomb)
}

function calcBombsLeft(){
  let tester = [].concat(...board)
  let opens = tester.filter(x => x.open)
  let marked = tester.filter(x => x.marked)
  bombs_left.innerText = difficulty[2] - marked.length
}

function init(gameOptions = EASY) {
  difficulty = gameOptions
  board = createCamps(difficulty);
  mineCamps(difficulty);
  renderField(board);
  calcBombsLeft(difficulty)
  console.log(board);
}

/* setting listeners */
easyBtn.addEventListener("click", () => changeGameMode(EASY));
mediumBtn.addEventListener("click", () => changeGameMode(MEDIUM));
hardBtn.addEventListener("click", () => changeGameMode(HARD));

document.body.addEventListener("contextmenu", (e) => {
  e.target?.classList?.contains("item") && e.preventDefault();
  e.target?.classList?.contains("item") && markCamp(findCampPosition(e.target));
});

document.body.addEventListener("click", (e) => {
  e.target?.classList?.contains("close") && openCamp(findCampPosition(e.target));
});

//initialize
init();
