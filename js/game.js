
'use strict'

// set board size
var gLevel = {
    SIZE: 4,
    MINES: 2
}

// The model
var gBoard =
{
    minesAroundCount: 0,
    isRevealed: true,
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


const BOME_IMG = '<img src="img/bome.png" alt="💣" onerror="this.replaceWith(document.createTextNode(\'💣\'))">'



function initGame() {

    gBoard = buildBoard()
    renderBoard(gBoard, '.board')

}

function buildBoard() {
   // var tempBoard = gBoard
   var tempBoard = {                     
    minesAroundCount: 0,
    isRevealed: true,                   
    isMine: false,
    isMarked: false
  }
    var size = gLevel.SIZE
    const board = []
    for (var i = 0; i < size; i++) {
        board.push([])
        for (var j = 0; j < size; j++) {
            board[i][j] = makeCellFromTemplate(tempBoard)
        }
    }
    var placed = 0
    while (placed < gLevel.MINES) {
        // debugPrintMines(board)
        var ri = getRandomIntInclusive(0, size - 1)
        var rj = getRandomIntInclusive(0, size - 1)
        if (board[ri][rj].isMine) continue
        board[ri][rj].isMine = true
        placed++
        
    }

    
    for (var r = 0; r < size; r++) {
        for (var c = 0; c < size; c++) {
            if (board[r][c].isMine) continue
            board[r][c].minesAroundCount = setMinesNegsCount(r, c, board)

        }
    }
    return board
}

function SetLevel(size) { // מגדיר גודל טבלה
    gLevel.SIZE = size

    if (size === 4) gLevel.MINES = 2     // Beginner
    else if (size === 8) gLevel.MINES = 14    // Medium
    else if (size === 12) gLevel.MINES = 32   // Expert

    initGame()
}



function makeCellFromTemplate(tempBoard) { // מגדיר את התא מהעתק הטבלה
    return {
        minesAroundCount: tempBoard.minesAroundCount,
        isRevealed: tempBoard.isRevealed,
        isMine: tempBoard.isMine,
        isMarked: tempBoard.isMarked
    }
}

// בדיקת מוקשים מסביב לתא
function setMinesNegsCount(rowIdx, colIdx, board) {
    var minesAroundCount = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === rowIdx && j === colIdx) continue
            if (board[i][j].isMine) minesAroundCount++
        }
    }


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
