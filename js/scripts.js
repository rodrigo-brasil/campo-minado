const EASY = [10,10,10];
const MEDIUM = [16,16,40];
const HARD = [30,30,160];
var board;
const states = {
    MARKED: "marked",
	BOMB: "bomb",
	OPEN: "open",
    CLOSE: "close"
}

/* Create camp  class*/
class Camp{
    constructor (row,col){
        this.row = row;
        this.col = col;
        this.bomb = false;
        this.marked = false;
        this.open = false;
    }

    flag(){
        if(!this.open){
            this.marked = !this.marked;
        }
        return this.marked;
    }
}

 /* reference for grid element */
const minefield = document.getElementById('minefield');

/* reference for buttons */
const easyBtn = document.getElementById('easy-option');
const mediumBtn = document.getElementById('medium-option');
const hardBtn = document.getElementById('hard-option');


 /* functions */
function renderField(difficulty){
    removeChildElements(minefield);

    for (let i = 0; i < difficulty[0]; i++) {
        for (let j = 0; j < difficulty[1]; j++) {
            let camp = document.createElement("div")
            minefield.appendChild(camp)
            .className =  i +''+ j+" item close";            
        } 
    }
    let string = "grid-template-columns: repeat("+difficulty[0]+",1fr);"
    minefield.setAttribute("style", string)
}

function createCamps(difficulty){
   let arr = Array.from(Array(difficulty[0]), () => new Array(difficulty[1]));
    for (let i = 0; i < difficulty[0]; i++) {
        for (let j = 0; j < difficulty[1]; j++) {
                arr[i][j] = new Camp(i,j);      
        }        
    }
    return arr;
}

function mineCamps(difficulty){
    let mines = 0;
    while(mines < difficulty[2]){
        let randRow = Math.floor(Math.random() * board[0].length)
        let randCol = Math.floor(Math.random() * board[1].length)
        if(!board[randRow][randCol].bomb){
            board[randRow][randCol].bomb = true
            mines++
        }
    }
}

function changeGameMode(difficulty){
    init(difficulty);
}

function removeChildElements(parent){
    while (parent.firstChild) {
        parent.firstChild.remove();
    }
}


function changeClass(evento,item){
    let position = item.classList.item(0);
    let camp = findCampPosition(position)
    console.log()
    switch (evento) {
        case states.MARKED:
            markCamp(camp) == true ? item.classList.replace('close','marked') : item.classList.replace('marked','close');
            break;
            case states.BOMB:
                item.classList.replace('close','bomb')
                break;
                case states.OPEN:
                    openCamp(camp)
                    item.classList.replace('close','open')
                    break;
        default:
            item.classList.replace('close','open')
            break;
    }
}

/* game functions */
function findCampPosition(position){
    return board[position[0]][position[1]]
}
function markCamp(camp){
    return camp.flag();
}

function openCamp(camp){

    if(camp.bomb) return console.log("perdeu!")
    if(calcAdjBombs(camp)> 0) return calcAdjBombs(camp)
    if(calcAdjBombs(camp) == 0){
        getAdjCamps(camp).filter(x=> !x.open && x.marked).forEach(x => openCamp(x))
    }

}

function abrirtudo(){

}

function calcAdjBombs(camp){
   return getAdjCamps(camp).filter(x => x.bomb).length
}

function getAdjCamps(camp){
    let adjCamps=[];
    let row = camp.row
    let col = camp.col
    let lasRow = board[0].length-1
    let lastCol = board[1].length-1
    if(row > 0 && col > 0) adjCamps.push(board[row-1][col-1])
    if(row > 0 ) adjCamps.push(board[row-1][col])
    if(row > 0 && col < lastCol) adjCamps.push(board[row-1][col+1])
    if(col < lastCol) adjCamps.push(board[row][col+1])
    if(col > 0) adjCamps.push(board[row][col-1])
    if(row < lasRow && col > 0) adjCamps.push(board[row+1][col-1])
    if(row < lasRow) adjCamps.push(board[row+1][col])
    if(row < lasRow && col < lastCol) adjCamps.push(board[row+1][col+1])
    console.log(adjCamps)
    return adjCamps
}

function init(difficulty = EASY){
    renderField(difficulty)
    board = createCamps(difficulty)
    mineCamps(difficulty)
    console.log(board)
}




/* setting listeners */
easyBtn.addEventListener('click', x => changeGameMode(EASY) );
mediumBtn.addEventListener('click', x => changeGameMode(MEDIUM) );
hardBtn.addEventListener('click', x => changeGameMode(HARD) );

document.body.addEventListener('contextmenu', e => {
    e.target?.classList?.contains('item') &&  e.preventDefault();
    e.target?.classList?.contains('item') && changeClass(states.MARKED,e.target);
})

document.body.addEventListener('click', e => {
    e.target?.classList?.contains('close') && changeClass(states.OPEN,e.target);
})


//initialize
init();