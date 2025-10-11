
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

var gTimerInterval = null
var gTimerStartMs = null

const BOME_IMG = '<img src="img/bome.png" alt="💣">'
const FLAG__IMG = '<img src="img/flag1.png" alt="F">'
const EMOJI_HAPPY = '<img src="img/emoji_happy.png" alt="F">'

function initGame() {
    stopTimer(true)
    gGame.isOn = false                 // עדיין לא פוזרו מוקשים
    gGame.isOver = false
    gGame.markedCount = 0        // איפוס מכסת כמות הדגלים
    gGame.revealedCount = 0
    gBoard = buildBoard()              // לוח ריק, תאים מוסתרים
    renderBoard(gBoard, '.board')
    updateFlagsPanel() // מעדכן את לוח הדגלים
    setEmoji('happy')
    initLivesUI() // אתחול לבבות וכפתור
    initHintsUI() // אתחול רמזים
    // if (typeof initAdvancedUI === 'function') initAdvancedUI()
    initAdvancedUI()
    updateBestTimePanel()
    if (typeof setExterminatorBtnEnabled === 'function') {
        setExterminatorBtnEnabled(gLevel.SIZE !== 4)  // מותר רק ב-Medium/Expert
    }

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
    if (gGame.isOver) return
    var cell = gBoard[i][j]

    if (cell.isMarked) return // אם יש דגל על התא – לא עושים כלום
    // עם זה קליק ראשון , תפזר מוקשים ותחפש שכנים
    if (!gGame.isOn) {
        placeMines(gBoard, i, j)       // אין מוקש בתא הראשון שנלחץ
        setAllMinesNegsCount(gBoard)
        gGame.isOn = true
        startTimer()
        if (typeof setSafeBtnEnabled === 'function') setSafeBtnEnabled(true)
    }

    if (cell.isRevealed) return       // בדיקה עם התא חשוף כבר
    // cell.isRevealed = true            // חושפים תא
    // gGame.revealedCount++
    // renderBoard(gBoard, '.board')     // מציג מוקש/מספר בהתאם

    if (cell.isMine) {
        if (gLifeModeActive && gLivesRemaining > 0 && !gLifeBreakInProgress) {
            // במצב חיים: לא חושפים את המוקש, לא מסיימים משחק — רק "שורפים" לב
            consumeLife()
            flashSurprised() // חיווי קצר
            return
        } else {
            endGame(false)
            return
        }


    }
    if (typeof pushUndoSnapshot === 'function') pushUndoSnapshot('reveal')

    revealCell(i, j)

    // אם 0 שכנים ,הרחבת שכנים
    if (cell.minesAroundCount === 0) {
        expandReveal(gBoard, i, j)
    }
    renderBoard(gBoard, '.board')

    // חיווי אימוג'י קצר אם עדיין משחקים
    if (!gGame.isOver) flashSurprised()

    // בדיקת ניצחון 
    if (!gGame.isOver) checkVictory()
}

function onCellMarked(elCell, i, j) {
    if (gGame.isOver) return
    var cell = gBoard[i][j]
    if (cell.isRevealed) return

    //תנאי להגבלת הדגלים לפי כמות המוקשים
    // if (!cell.isMarked && gGame.markedCount >= gLevel.MINES) {

    //     return
    // }
    if (!cell.isMarked && gGame.markedCount >= gLevel.MINES) return

    if (cell.isMarked) {
        cell.isMarked = false
        if (gGame.markedCount > 0) gGame.markedCount--
    } else {
        cell.isMarked = true
        gGame.markedCount++
    }

    renderBoard(gBoard, '.board')               // עדכון UI מיידי
    updateFlagsPanel()

    if (!gGame.isOver) checkVictory()
}

function updateFlagsPanel() { // אחריות על הצגת הדגלים בלוח
    var left = gLevel.MINES - gGame.markedCount
    var elLeft = document.getElementById('flags-left')
    var elMax = document.getElementById('flags-max')
    if (elLeft) elLeft.textContent = left
    if (elMax) elMax.textContent = gLevel.MINES
}

function startTimer() {
    if (gTimerInterval) return            // כבר רץ
    gTimerStartMs = Date.now()
    updateTimerDom(0)
    gTimerInterval = setInterval(function () {
        var elapsed = Date.now() - gTimerStartMs
        var dayMs = 24 * 60 * 60 * 1000
        if (elapsed >= dayMs) {
            elapsed = dayMs
            updateTimerDom(elapsed)
            stopTimer(false)                  // עצור ב-24 שעות
            return
        }
        updateTimerDom(elapsed)
    }, 1000)
}

function updateTimerDom(ms) {
    var totalSec = Math.floor(ms / 1000)
    var hh = Math.floor(totalSec / 3600)
    var mm = Math.floor((totalSec % 3600) / 60)
    var ss = totalSec % 60
    var txt =
        (hh < 10 ? '0' + hh : '' + hh) + ':' +
        (mm < 10 ? '0' + mm : '' + mm) + ':' +
        (ss < 10 ? '0' + ss : '' + ss)
    var el = document.getElementById('timer-text')
    if (el) el.textContent = txt
}

function stopTimer(resetToZero) {
    if (gTimerInterval) {
        clearInterval(gTimerInterval)
        gTimerInterval = null
    }
    if (resetToZero) {
        gTimerStartMs = null
        updateTimerDom(0)   // מציג 00:00:00
    }
}