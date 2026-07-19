
const boardElement = document.getElementById("board");
const timerElement = document.getElementById("timer");
const mineCounter = document.getElementById("mineCounter");
const flagCounter = document.getElementById("flagCounter");
const restartButton = document.getElementById("restart");
const difficultySelect = document.getElementById("difficulty");
const message = document.getElementById("message");
let cellSize = 42;

const DIFFICULTY = {

    easy:{
        rows:9,
        cols:9,
        mines:10
    },

    normal:{
        rows:12,
        cols:12,
        mines:20
    },

    hard:{
        rows:15,
        cols:15,
        mines:30
    }

};

let rows;
let cols;
let mines;

let board=[];

let firstClick=true;

let gameOver=false;

let timer=0;

let timerInterval=null;

let flagsPlaced=0;

function createCell(){

    return{

        mine:false,

        open:false,

        flag:false,

        number:0,

        element:null

    };

}

function loadDifficulty(){

    const mode = DIFFICULTY[difficultySelect.value];

    rows = mode.rows;
    cols = mode.cols;
    mines = mode.mines;

    if(difficultySelect.value==="easy")
        cellSize=42;

    else if(difficultySelect.value==="normal")
        cellSize=34;

    else
        cellSize=26;

    mineCounter.textContent=mines;

}

function createBoard(){

    board=[];

    boardElement.innerHTML="";

    boardElement.style.gridTemplateColumns =
    `repeat(${cols},${cellSize}px)`;

    boardElement.style.gridTemplateRows =
    `repeat(${rows},${cellSize}px)`;

    for(let r=0;r<rows;r++){

        board[r]=[];

        for(let c=0;c<cols;c++){

            const cell=createCell();

            const div=document.createElement("div");

            div.className = "cell";

            div.style.width = cellSize + "px";
            div.style.height = cellSize + "px";
            div.style.fontSize = (cellSize * 0.45) + "px";

            div.dataset.row = r;
            div.dataset.col = c;
            cell.element=div;

            board[r][c]=cell;

            boardElement.appendChild(div);

        }

    }

}

function resetGame(){

    clearInterval(timerInterval);

    timer=0;

    flagsPlaced=0;

    timerElement.textContent=0;

    flagCounter.textContent=0;

    message.textContent="";

    firstClick=true;

    gameOver=false;

    loadDifficulty();

    createBoard();

}

restartButton.addEventListener("click",resetGame);

difficultySelect.addEventListener("change",resetGame);

resetGame();

function inside(r,c){

    return r>=0 &&
           r<rows &&
           c>=0 &&
           c<cols;

}

function placeMines(safeRow,safeCol){

    let placed=0;

    while(placed<mines){

        const r=Math.floor(Math.random()*rows);

        const c=Math.floor(Math.random()*cols);

        if(board[r][c].mine)
            continue;

        if(r===safeRow && c===safeCol)
            continue;

        board[r][c].mine=true;

        placed++;

    }

    calculateNumbers();

}

function calculateNumbers(){

    for(let r=0;r<rows;r++){

        for(let c=0;c<cols;c++){

            if(board[r][c].mine)
                continue;

            let count=0;

            for(let dr=-1;dr<=1;dr++){

                for(let dc=-1;dc<=1;dc++){

                    const nr=r+dr;

                    const nc=c+dc;

                    if(inside(nr,nc) && board[nr][nc].mine)
                        count++;

                }

            }

            board[r][c].number=count;

        }

    }

}


function startTimer(){

    clearInterval(timerInterval);

    timerInterval=setInterval(()=>{

        timer++;

        timerElement.textContent=timer;

    },1000);

}

boardElement.addEventListener("click",function(e){

    if(gameOver)
        return;

    if(!e.target.classList.contains("cell"))
        return;

    const row=parseInt(e.target.dataset.row);

    const col=parseInt(e.target.dataset.col);

    if(firstClick){

        placeMines(row,col);

        startTimer();

        firstClick=false;

    }

    openCell(row,col);

});

boardElement.addEventListener("contextmenu",function(e){

    e.preventDefault();

});

function openCell(row,col){

    if(!inside(row,col))
        return;

    const cell=board[row][col];

    if(cell.open)
        return;

    if(cell.flag)
        return;

    cell.open=true;

    cell.element.classList.add("open");


    if(cell.mine){

        cell.element.classList.add("mine");

        cell.element.innerHTML="💣";

        loseGame();

        return;

    }


    if(cell.number>0){

        cell.element.textContent=cell.number;

        const names=[
            "",
            "one",
            "two",
            "three",
            "four",
            "five",
            "six",
            "seven",
            "eight"
        ];

        cell.element.classList.add(
            names[cell.number]
        );

    }


    if(cell.number===0){

        for(let dr=-1;dr<=1;dr++){

            for(let dc=-1;dc<=1;dc++){

                if(dr===0 && dc===0)
                    continue;

                openCell(row+dr,col+dc);

            }

        }

    }

    checkWin();

}

boardElement.addEventListener("contextmenu",function(e){

    e.preventDefault();

    if(gameOver)
        return;

    if(!e.target.classList.contains("cell"))
        return;

    const row=parseInt(e.target.dataset.row);

    const col=parseInt(e.target.dataset.col);

    const cell=board[row][col];

    if(cell.open)
        return;

    if(cell.flag){

        cell.flag=false;

        flagsPlaced--;

        cell.element.classList.remove("flag");

        cell.element.innerHTML="";

    }

    else{

        cell.flag=true;

        flagsPlaced++;

        cell.element.classList.add("flag");

        cell.element.innerHTML="🚩";

    }

    flagCounter.textContent=flagsPlaced;

});

function loseGame(){

    gameOver=true;

    clearInterval(timerInterval);

    message.textContent="💥 Game Over";

    boardElement.classList.add("lose");

    revealMines();

}

function revealMines(){

    for(let r=0;r<rows;r++){

        for(let c=0;c<cols;c++){

            const cell=board[r][c];

            if(cell.mine){

                cell.element.classList.add("mine");

                cell.element.innerHTML="💣";

            }

        }

    }

}

function checkWin(){

    let opened=0;

    for(let r=0;r<rows;r++){

        for(let c=0;c<cols;c++){

            if(board[r][c].open)
                opened++;

        }

    }

    if(opened===rows*cols-mines){

        gameOver=true;

        clearInterval(timerInterval);

        message.textContent="🏆 You Win!";

        boardElement.classList.add("win");

    }

}
