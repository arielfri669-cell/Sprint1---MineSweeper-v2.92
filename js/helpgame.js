
'use strict'


// טיפוסי תאים/אלמנטים
const BOME = 'BOME'
const FLAG = 'FLAG'
const NUM1 = '1'
const NUM2 = '2'
const NUM3 = '3'

// תמונות
const BOME_IMG = '<img src="img/bome.png">'
const FACE_HAPPY_IMG = '<img src="img/emoji_happy.png">'
const FACE_SURPRISED_IMG = '<img src="img/emoji_surprised.png">'
const FACE_DEAD_IMG = '<img src="img/emoji_dead.png">'

// מידות ופתחים (מעברים)
const gRowsCount = 4
const gColsCount = 4

// const PASSAGES = {
//   top:    { i: 0, j: 5 },
//   bottom: { i: gRowsCount - 1, j: 5 },
//   left:   { i: 5, j: 0 },
//   right:  { i: 5, j: gColsCount - 1 }
// }

// Model
var board
// var gGamerPos

// Game state
var gGameOn
//var gIsDead
var gBomeOnBoard
//var gTimeouts = [] // כל ה-timeouts לניקוי ב-restart

function initGame() {
  const elScore = document.querySelector('h2 span')

  //hideElement('.victory')

  // מאפס את המספרים שמופיעים בכותרות למסך
  elScore.innerText = 0

  gGameOn = true
  //gBallsCollected = 0
  //gGamerPos = { i: 2, j: 9 } // מיקום התחלתי של השחקן בלוח

  board = buildBoard()
  renderBoard(board)

  //gBomeOnBoard = countBallsOnBoard(gBoard) // חישוב מצב התחלתי של “כמה פצצות על הלוח”

  
// function restartGame() {
//   clearIntervalSafe(gBallInterval)
//   clearIntervalSafe(gGlueInterval)
 
//   gTimeouts.forEach(clearTimeout)
//   gTimeouts = []

//   initGame()
}

function buildBoard() {
  const board = createMat(gRowsCount, gColsCount)

  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
        board[i][j] = {                  // מגדיר תא באוביקט עם שדות ברורים
        gameElement: null,             // מה “יושב” בתא
        hasGlue: false,
               
      }
    }
  }

 
  //הצבה רנדומאלית של פצצות ו
   //הצבה רנדומאלית של מספרים ו

 
  return board
}

// Render
function renderBoard(board) {
  const elBoard = document.querySelector('.board')
  var strHTML = ''
  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>\n'
    for (var j = 0; j < board[0].length; j++) {
      const currCell = board[i][j]
      var cellClass = getClassName({ i, j }) // מחזיר מזהה מיקום, למשל: cell-2-5

      if (currCell.type === FLOOR) cellClass += ' floor'
      else if (currCell.type === WALL) cellClass += ' wall'

      strHTML += `\t<td class="cell ${cellClass}" onclick="moveTo(${i},${j})">`
      strHTML += getCellHTML(i, j)
      strHTML += '</td>\n'
    }
    strHTML += '</tr>\n'
  }
  elBoard.innerHTML = strHTML
}

// function getCellHTML(i, j) { // מה מציירים בתוך התא (שחקן, כדור, דבק, או ריק)
//   const cell = gBoard[i][j]
//   if (cell.gameElement === GAMER) return gIsGlued ? GAMER_IMG_PURPLE : GAMER_IMG
//   if (cell.gameElement === BALL) return BALL_IMG
//   if (cell.hasGlue) return GLUE_IMG
//   return ''
// }

function renderCell(location, value) {
  const cellSelector = '.' + getClassName(location)
  const elCell = document.querySelector(cellSelector)
  elCell.innerHTML = value
}

// Movement
function moveTo(i, j) {
  if (!gGameOn) return
  if (gIsGlued) return

  // הגדרת ת
  if (i === -1) i = gRowsCount - 1
  else if (i === gRowsCount) i = 0
  if (j === -1) j = gColsCount - 1
  else if (j === gColsCount) j = 0

  const toCell = board[i][j]
  if (toCell.type === WALL) return

 
  // איסוף כדור
  if (finalCell.gameElement === BALL) {
    gBallsCollected++
    gBallsOnBoard = Math.max(0, gBallsOnBoard - 1)
    renderScore()
    playSound()
    if (isVictory()) gameOver()          // ✅ עכשיו הפונקציה קיימת
  }

  // עדכון מודל
  fromCell.gameElement = null
  renderCell(fromPos, '')

  finalCell.gameElement = GAMER
  gGamerPos = { i: finalPos.i, j: finalPos.j }

 

  // רינדור יעד
  const gamerImg = gIsGlued ? GAMER_IMG_PURPLE : GAMER_IMG
  renderCell(gGamerPos, gamerImg)

  // עדכוני HUD
  countBallsAround(gGamerPos.i, gGamerPos.j)
}

// שכנים
function countBallsAround(rowIdx, colIdx) {
  var ballCount = 0
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= board[0].length) continue
      if (i === rowIdx && j === colIdx) continue
      if (board[i][j].gameElement === BALL) ballCount++
    }
  }
  const elNeighbors = document.querySelector('h2 span')
  elNeighbors.innerText = ballCount
}

// סיום משחק
function gameOver() {
  gGameOn = false
  clearIntervalSafe(gBallInterval)
  clearIntervalSafe(gGlueInterval)
  showElement('.victory')
}

// // בחירת תא ריק כשיר
// function getRandEmptyLocation(opts = {}) {
//   const { excludePassages = false } = opts
//   const emptyCells = []
//   for (var i = 0; i < gBoard.length; i++) {
//     for (var j = 0; j < gBoard[0].length; j++) {
//       const cell = gBoard[i][j]
//       if (cell.type !== FLOOR) continue
//       if (excludePassages && cell.isPassage) continue
//       if (cell.gameElement === null && !cell.hasGlue) emptyCells.push({ i, j })
//     }
//   }
//   if (!emptyCells.length) return null
//   const randIdx = getRandomIntInclusive(0, emptyCells.length - 1)
//   return emptyCells[randIdx]
// }

// עזר
// function countBallsOnBoard(board) {
//   var count = 0
//   for (var i = 0; i < board.length; i++) {
//     for (var j = 0; j < board[0].length; j++) {
//       if (board[i][j].gameElement === BALL) count++
//     }
//   }
//   return count
// }

// // תנועה עם חיצים
// function handleKey(event) {
//   const i = gGamerPos.i
//   const j = gGamerPos.j
//   if (event.key === 'ArrowLeft')  moveTo(i, j - 1)
//   if (event.key === 'ArrowRight') moveTo(i, j + 1)
//   if (event.key === 'ArrowUp')    moveTo(i - 1, j)
//   if (event.key === 'ArrowDown')  moveTo(i + 1, j)
// }

// // כותרות/סיוע
// function getClassName(position) {
//   return `cell-${position.i}-${position.j}` // למשל: "cell-2-5"
// }

// DOM helpers
// להסתיר אלמנט בדף ע״י הוספת מחלקת CSS בשם hide.
function hideElement(selector) { 
  const el = document.querySelector(selector)
  if (el) el.classList.add('hide')
}
function showElement(selector) {
  const el = document.querySelector(selector)
  if (el) el.classList.remove('hide')
}
function clearIntervalSafe(id) { if (id) clearInterval(id) }
