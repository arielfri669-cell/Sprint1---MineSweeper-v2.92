
'use strict'

function endGame(isWin) {   // מבצע פעולות לסוף משחק
    gGame.isOver = true                   //   חוסם המשך פעולות
    stopTimer(false)

    if (typeof setUndoBtnEnabled === 'function') setUndoBtnEnabled(false)
    if (typeof clearSafeHintHighlight === 'function') clearSafeHintHighlight()
    if (typeof setSafeBtnEnabled === 'function') setSafeBtnEnabled(false)

    if (!isWin) {
        if (typeof playSfx === 'function') playSfx('lose')

        revealAllMines(gBoard)              // הפסד: חשוף את כל המוקשים
        setEmoji('dead')
        renderBoard(gBoard, '.board')
    } else {
        if (typeof playSfx === 'function') playSfx('victory')
        setTimeout(function () {
            if (typeof playSfx === 'function') playSfx('winEnd')
        }, 400)

        setEmoji('win')                     // ניצחון: תישאר עם הדגלים

        /* 00009 */ // שמירת שיא רק בניצחון: חישוב זמן שחלף ושמירה אם עדיף
        if (typeof window.gTimerStartMs === 'number' && window.gTimerStartMs) {
            var finishMs = Date.now() - window.gTimerStartMs
            var didBest = saveBestMsIfBetter(finishMs)
            if (didBest && typeof playSfx === 'function') playSfx('newRecord')
          
        }
    }

}

function revealAllMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]
            if (cell.isMine) cell.isRevealed = true
        }
    }
}

function checkVictory() {
    var size = gLevel.SIZE
    var total = size * size
    var safeCells = total - gLevel.MINES

    if (gGame.revealedCount !== safeCells) return false
    if (gGame.markedCount !== gLevel.MINES) return false
    if (!allFlagsCorrect(gBoard)) return false

    endGame(true)                         // ניצחון
    return true
}

function allFlagsCorrect(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]
            if (cell.isMarked && !cell.isMine) return false
        }
    }
    return true
}

function revealCell(i, j) {
    var cell = gBoard[i][j]
    if (cell.isRevealed || cell.isMarked) return false
    cell.isRevealed = true
    gGame.revealedCount++
    return true
}

function expandReveal(board, i, j) {
    if (!board || !board[i] || !board[i][j]) return
    var cell = board[i][j]

    if (cell.isMine || cell.isMarked) return

    if (!cell.isRevealed) revealCell(i, j)

    if (cell.minesAroundCount !== 0) return

    // תא "אפס": מתפשטים לשכנים
    for (var r = i - 1; r <= i + 1; r++) {
        if (r < 0 || r >= board.length) continue
        for (var c = j - 1; c <= j + 1; c++) {
            if (c < 0 || c >= board[0].length) continue
            if (r === i && c === j) continue

            var neighbor = board[r][c]
            if (neighbor.isMine || neighbor.isMarked || neighbor.isRevealed) continue

            if (neighbor.minesAroundCount === 0) {
                // אפס – נכנסים רקורסיבית
                expandReveal(board, r, c)
            } else {
                // מספר – חושפים חד-פעמי (בלי רקורסיה)
                revealCell(r, c)
            }
        }
    }
}
