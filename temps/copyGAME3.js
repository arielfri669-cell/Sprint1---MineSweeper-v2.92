
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


const BOME_IMG = '<img src="img/bome.png" alt="💣" onerror="this.replaceWith(document.createTextNode(\'💣\'))">'
const FLAG__IMG = '<img src="img/flag1.png" alt="F" onerror="this.replaceWith(document.createTextNode(\'💣\'))">'
const EMOJI_HAPPY = '<img src="img/emoji_happy.png" alt="F" onerror="this.replaceWith(document.createTextNode(\'💣\'))">'

function initGame() {
    gGame.isOn = false                 // עדיין לא פוזרו מוקשים
    gGame.markedCount = 0        // איפוס מכסת כמות הדגלים
    gGame.revealedCount = 0
    gBoard = buildBoard()              // לוח ריק, תאים מוסתרים
    renderBoard(gBoard, '.board')
    updateFlagsPanel() // מעדכן את לוח הדגלים
}

function buildBoard() {
    // var tempBoard = gBoard
    var tempBoard = {
        minesAroundCount: 0,
        isRevealed: false, // לבדיקה
        isMine: false,
        isMarked: false
    }
    var size = gLevel.SIZE
    var board = []
    for (var i = 0; i < size; i++) {
        board[i] = []
        for (var j = 0; j < size; j++) {
            board[i][j] = makeCellFromTemplate(tempBoard)
        }
    }
    return board                    //  בלי פיזור מוקשים ובלי ספירת שכנים כאן
}

function placeMines(board, forbidI, forbidJ) {
    var size = board.length
    var placed = 0
    while (placed < gLevel.MINES) {
        var ri = getRandomIntInclusive(0, size - 1)
        var rj = getRandomIntInclusive(0, size - 1)
        if (ri === forbidI && rj === forbidJ) continue     // אל תניח מוקש על התא הראשון
        if (board[ri][rj].isMine) continue
        board[ri][rj].isMine = true
        placed++
    }
}

function SetLevel(size) {
    gLevel.SIZE = size
    if (size === 4) gLevel.MINES = 2
    else if (size === 8) gLevel.MINES = 14
    else if (size === 12) gLevel.MINES = 32
    gGame.isOn = false                 // ← לפני קליק ראשון
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

// בדיקת מוקשים ראשונית
function setAllMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (board[i][j].isMine) continue
            board[i][j].minesAroundCount = setMinesNegsCount(i, j, board)
        }
    }
}
// ספירת מוקשים מסביב לתא
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
function onCellClicked(elcell, i, j) {
    var cell = gBoard[i][j]

    if (cell.isMarked) return // אם יש דגל על התא – לא עושים כלום
    // עם זה קליק ראשון , תפזר מוקשים ותחפש שכנים
    if (!gGame.isOn) {
        placeMines(gBoard, i, j)       // אין מוקש בתא הראשון שנלחץ
        setAllMinesNegsCount(gBoard)
        gGame.isOn = true
    }

    if (cell.isRevealed) return       // בדיקה עם התא חשוף כבר
    cell.isRevealed = true            // חושפים תא
    gGame.revealedCount++
    renderBoard(gBoard, '.board')     // מציג מוקש/מספר בהתאם
}

function onCellMarked(elCell, i, j) {
    var cell = gBoard[i][j]
    if (cell.isRevealed) return

    //תנאי להגבלת הדגלים לפי כמות המוקשים
    if (!cell.isMarked && gGame.markedCount >= gLevel.MINES) {

        return
    }

    if (cell.isMarked) {
        cell.isMarked = false
        if (gGame.markedCount > 0) gGame.markedCount--
    } else {
        cell.isMarked = true
        gGame.markedCount++
    }

    renderBoard(gBoard, '.board')               // עדכון UI מיידי
    updateFlagsPanel()
}

function onEmojiClick(action) {
    
}

function updateFlagsPanel() { // אחריות על הצגת הדגלים בלוח
    var left = gLevel.MINES - gGame.markedCount
    var elLeft = document.getElementById('flags-left')
    var elMax = document.getElementById('flags-max')
    if (elLeft) elLeft.textContent = left
    if (elMax) elMax.textContent = gLevel.MINES
}
