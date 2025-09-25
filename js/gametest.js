
'use strict'

// set board size
var gLevel = {
    SIZE: 10,
    MINES: 2
}

// The model
var gBoard =
{
    minesAroundCount: 4,
    isRevealed: false,
    isMine: false,
    isMarked: false
}

// Holds the current game state
var gGame = {
    isOn: false,
    revealedCount: 0,    // How many cells are revealed
    markedCount: 0,      // How many cells are flagd
    secsPassed: 0        // How many seconds passed
}

const NUM1 = ''
const WALL = '#'
const BOME_IMG = '<img src="img/bome.png">'



function initGame() {
    console.log(createMat(4, 4))

    gBoard = buildBoard()
    renderBoard(gBoard, '.board')

}

function buildBoard() {
    var size = gLevel.SIZE
    const board = []

    for (var i = 0; i < size; i++) {
        board.push([])

        for (var j = 0; j < size; j++) {
            // board[i][j] = NUM1
            board[i][j] = (Math.random() > 0.9) ? BOME_IMG : ''
          
             //  board[i][j] = makeCell()
          
        }
    }
  

    // board[2][2] = board[3][4] = BOME_IMG
    setMinesNegsCount(2, 3, board)
    var pos = board[2][3] = '*' // בדיקת ספירה ניסוי

    return board
}

function SetLevel(size) {
    gLevel.SIZE = size
    initGame()
}

function makeCell() {
  return {
    isMine: false,
    isRevealed: false,
    isMarked: false,
    minesAroundCount: 0
  }
}

// בדיקת תאים רקים במטריצה
//  עם תא = ריק אז בצע בדיקת מוקשים סביבו 
// עם תא  = מוקש 

// בדיקת מוקשים מסביב לתא
function setMinesNegsCount(rowIdx, colIdx, board) {
    var minesAroundCount = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === rowIdx && j === colIdx) continue
            if (board[i][j] === BOME_IMG) minesAroundCount++

        }
    }
    // const elNeighbors = document.querySelector('h2 span')
    // elNeighbors.innerText = minesAroundCount
    console.log(minesAroundCount);
    return minesAroundCount
}

function onCellClicked() {  // Reveal the cell

}

function onCellMarked(elCell, i, j) {

}

// reveal neighbors.
function expandReveal(board, elCell, i, j) {

}

function checkGameOver() {

}
