
'use strict'

function endGame(isWin) {   // מבצע פעולות לסוף משחק
    gGame.isOver = true                   //   חוסם המשך פעולות
    if (!isWin) {
        revealAllMines(gBoard)              // הפסד: חשוף את כל המוקשים
        setEmoji('dead')
        renderBoard(gBoard, '.board')
    } else {
        setEmoji('win')                     // ניצחון: תישאר עם הדגלים
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
  // מרחיבים רק אם התא המקורי נטול שכנים-מוקשים
  if (board[i][j].minesAroundCount !== 0) return
  for (var r = i - 1; r <= i + 1; r++) {
    if (r < 0 || r >= board.length) continue
    for (var c = j - 1; c <= j + 1; c++) {
      if (c < 0 || c >= board[0].length) continue
      if (r === i && c === j) continue
      var neighbor = board[r][c]
      if (neighbor.isMine || neighbor.isMarked) continue
      revealCell(r, c)
    }
  }
}
