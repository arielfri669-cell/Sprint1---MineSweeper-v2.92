'use strict'

const UNDO_BTN = '<img class="adv-btn" data-action="undo"         src="img/navy_undo.png"        alt="Undo">'
const SAFE_BTN = '<img class="adv-btn" data-action="safe"         src="img/navy_safe.png"        alt="Safe Click">'
const MEGA_BTN = '<img class="adv-btn" data-action="mega"         src="img/navy_mega.png"        alt="Mega Reveal">'
const EXTERMINATOR_BTN = '<img class="adv-btn" data-action="exterminator" src="img/EXTERMINATOR.png"     alt="Exterminator">'


const HARPOON_MIS_SRC = 'img/Harpoon Missile.gif'
const BLAST_SRC = 'img/blast.gif'
const FIN_EXP_SRC = 'img/finl-exp.gif'
const SMALL_EXP_GIF = 'img/collision.gif'
const SMALL_EXP_STATIC = 'img/bome.png'   // אייקון סטטי שנשאר עד סוף המשחק


var gExterminatorUsed = false
// === SAFE CLICK ===
var SAFE_CLICK_LIMIT = 3
var gSafeClicksUsed = 0
var gSafeHintTimeoutId = null

function initAdvancedUI() {
  clearFxLayers()                  // מנקה אפקטים ממשחק קודם
  ensureFxLayers()
  renderAdvancedBar()
  gExterminatorUsed = false
  setExterminatorBtnEnabled(gLevel && gLevel.SIZE !== 4) // מושבת ב-Beginner
  gSafeClicksUsed = 0 // SAFE כפתור
  clearSafeHintHighlight()
  setSafeBtnEnabled(false) // ← מושבת לפני תחילת המשחק
}

function renderAdvancedBar() {
  var el = document.getElementById('adv-icons')
  if (!el) return
  el.innerHTML = UNDO_BTN + SAFE_BTN + MEGA_BTN + EXTERMINATOR_BTN

  var btns = el.querySelectorAll('.adv-btn')
  for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener('mousedown', function (e) { e.currentTarget.classList.add('pressed') })
    btns[i].addEventListener('mouseup', function (e) { e.currentTarget.classList.remove('pressed') })
    btns[i].addEventListener('mouseleave', function (e) { e.currentTarget.classList.remove('pressed') })
    btns[i].addEventListener('click', onAdvancedAction)
  }
  setExterminatorBtnEnabled(gLevel && gLevel.SIZE !== 4)
}

function onAdvancedAction(ev) {
  var act = ev.currentTarget && ev.currentTarget.dataset && ev.currentTarget.dataset.action
  if (!act) return
  if (act === 'exterminator') handleExterminator(ev.currentTarget)
  else if (act === 'safe')    handleSafeClick(ev.currentTarget) 
}


/* === Exterminator === */
function handleExterminator(btnEl) {
  if (gGame.isOver) return
  if (gLevel && gLevel.SIZE === 4) { setExterminatorBtnEnabled(false); return } // Beginner: מושבת
  if (gExterminatorUsed) return       // חד-פעמי

  // מותר "בכל רגע": אם עוד לא התחיל משחק – מפזרים מוקשים עכשיו
  if (!gGame.isOn) {
    placeMines(gBoard, -1, -1)        // אין תא אסור
    setAllMinesNegsCount(gBoard)
    gGame.isOn = true
    startTimer()
    updateFlagsPanel && updateFlagsPanel()
  }

  gExterminatorUsed = true
  setExterminatorBtnEnabled(false)
  playMissileAudio()

  ensureFxLayers() // מבטיח קיום שכבות לאפקטים (מאחורי הספינה)
  var back = document.getElementById('fx-layer-back')
  var front = document.getElementById('fx-layer-front')
  if (!back || !front) return

  // נקודת A – מספינה
  var ship = document.getElementById('warship-img')
  if (!ship) return
  var srect = ship.getBoundingClientRect() // נתונים גאומטרים של מלבן הספינה , מיקום
  var startX = srect.left + srect.width * (1 / 3) + cssPx('--mis-start-offset-x', 0)
  var startY = srect.top + srect.height * 0.35 + cssPx('--mis-start-offset-y', 0)

  // נקודת B – מרכז הלוח: קודם 
  var boardTable = getBoardTableEl()
  if (!boardTable) return
  var brect = boardTable.getBoundingClientRect()
  var endX = brect.left + brect.width / 2
  var endY = brect.top + brect.height / 2

  // טיל
  var missile = new Image() // יצירת אובייקט תמונה דינמית לאנימציה
  missile.src = HARPOON_MIS_SRC
  missile.className = 'fx-abs fx-missile'
  missile.style.left = startX + 'px'
  missile.style.top = startY + 'px'
  back.appendChild(missile) // מכניס את התמונה ל־DOM בתוך שכבת האפקטים האחורית

  // רשף – תמיד יופיע (עם cache-bust) וייסגר לבד
  var blast = new Image()
  blast.src = addBust(BLAST_SRC)
  blast.className = 'fx-abs fx-blast'
  blast.style.left = (startX + cssPx('--blast-offset-x', -32)) + 'px'
  blast.style.top = (startY + cssPx('--blast-offset-y', -6)) + 'px'
  back.appendChild(blast)
  safeRemoveAfter(blast, cssMs('--blast-duration', 1000))

  // הנעת הטיל ל-B
  requestAnimationFrame(function () {
    void missile.offsetWidth
    missile.style.left = endX + 'px'
    missile.style.top = endY + 'px'
  })

  // סיום (עם גיבוי לזמן טיסה)
  var finished = false
  function finalizeImpact() {
    if (finished) return
    finished = true
    if (missile && missile.parentNode) missile.parentNode.removeChild(missile)

    // פיצוץ סופי
    var fin = new Image()
    fin.src = addBust(FIN_EXP_SRC)
    fin.className = 'fx-abs fx-final'
    fin.style.left = endX + 'px'
    fin.style.top = endY + 'px'
    var finDur = cssMs('--finexp-duration', 1200)
    front.appendChild(fin)

    setTimeout(function () {
      if (fin && fin.parentNode) fin.parentNode.removeChild(fin)
      revealThreeMinesWithSmallExplosion()
    }, finDur)
  }
  missile.addEventListener('transitionend', finalizeImpact, { once: true })
  setTimeout(finalizeImpact, cssMs('--mis-speed', 1800) + 80) // גיבוי
}

/* בוחר בדיוק 3 מוקשים אמיתיים, ממיר אותם לתאים חשופים, מסיר דגלים אם יש, ומעדכן מונים */
function revealThreeMinesWithSmallExplosion() {
  var mines = []
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (gBoard[i][j].isMine) mines.push({ i: i, j: j })
    }
  }
  if (mines.length < 3) return

  shuffle(mines)
  var chosen = mines.slice(0, 3)

  for (var k = 0; k < chosen.length; k++) {
    var p = chosen[k]
    var cell = gBoard[p.i][p.j]

    if (cell.isMarked) {
      cell.isMarked = false
      if (gGame.markedCount > 0) gGame.markedCount--
    }

    cell.wasExterminated = true
    cell.isMine = false
    if (!cell.isRevealed) {
      cell.isRevealed = true
      gGame.revealedCount++
    }
  }

  setAllMinesNegsCount(gBoard)

  if (typeof gLevel.MINES === 'number') {
    gLevel.MINES = Math.max(0, gLevel.MINES - 3)
    if (typeof updateFlagsPanel === 'function') updateFlagsPanel()
  }

  renderBoard(gBoard, '.board')

  // פיצוצים קטנים -> ואז אייקון סטטי שנשאר
  ensureFxLayers()
  var front = document.getElementById('fx-layer-front')
  var miniDur = cssMs('--small-exp-duration', 900)

  for (var t = 0; t < chosen.length; t++) {
    var pos = chosen[t]
    var r = getCellRect(pos.i, pos.j)
    if (!r) continue
    var cx = r.left + r.width / 2
    var cy = r.top + r.height / 2

    var mini = new Image()
    mini.src = addBust(SMALL_EXP_GIF)
    mini.className = 'fx-abs fx-mini-run'
    mini.style.left = cx + 'px'
    mini.style.top = cy + 'px'
    front.appendChild(mini)

    setTimeout((function (x, y, gifEl) {
      return function () {
        if (gifEl && gifEl.parentNode) gifEl.parentNode.removeChild(gifEl)
        var stat = new Image()
        stat.src = SMALL_EXP_STATIC
        stat.className = 'fx-abs fx-mini-static'
        stat.style.left = x + 'px'
        stat.style.top = y + 'px'
        front.appendChild(stat)
      }
    })(cx, cy, mini), miniDur)
  }

  if (!gGame.isOver) checkVictory()
}

/* === עזרי DOM/CSS/UTIL === */
function ensureFxLayers() {
  if (!document.getElementById('fx-layer-back')) {
    var b = document.createElement('div')
    b.id = 'fx-layer-back'
    document.body.appendChild(b)
  }
  if (!document.getElementById('fx-layer-front')) {
    var f = document.createElement('div')
    f.id = 'fx-layer-front'
    document.body.appendChild(f)
  }
}
function clearFxLayers() {
  var b = document.getElementById('fx-layer-back')
  var f = document.getElementById('fx-layer-front')
  if (b) b.innerHTML = ''
  if (f) f.innerHTML = ''
}
function getBoardTableEl() {
  // עדיף table.board (זה מה ש-renderBoard יוצר)
  var t = document.querySelector('table.board')
  if (t) return t
  // אחרת – tbody.board -> closest('table')
  var tb = document.querySelector('tbody.board')
  if (tb && tb.closest) return tb.closest('table')
  // נפילה אחרונה
  return document.querySelector('table')
}
function getCellRect(i, j) {
  var el = document.querySelector('.cell-' + i + '-' + j)
  return el ? el.getBoundingClientRect() : null
}
function cssPx(varName, defPx) {
  var v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  if (!v) return defPx || 0
  if (v.endsWith('px') || v.endsWith('ms')) return parseFloat(v)
  var n = parseFloat(v); return isNaN(n) ? (defPx || 0) : n
}
function cssMs(varName, defMs) {
  var v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  if (!v) return defMs || 0
  if (v.endsWith('ms')) return parseFloat(v)
  if (v.endsWith('s')) return parseFloat(v) * 1000
  var n = parseFloat(v); return isNaN(n) ? (defMs || 0) : n
}
function shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1))
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp
  }
  return arr
}
function setExterminatorBtnEnabled(isEnabled) { // מאפשר לחיצה וחסימה של כפתור "קליקבילי
  var el = document.querySelector('#adv-icons .adv-btn[data-action="exterminator"]')
  if (!el) return
  if (isEnabled) { el.classList.remove('disabled'); el.style.pointerEvents = '' }
  else { el.classList.add('disabled'); el.style.pointerEvents = 'none' }
}
function addBust(src) {
  var sep = (src.indexOf('?') === -1) ? '?' : '&'
  return src + sep + 't=' + Date.now()
}
function playMissileAudio() {
  try {
    var audio = new Audio('audio/Missile launch Sound effect .mp3')
    audio.volume = 1
    audio.play()
  } catch (e) { }
}
/* NEW: הסרה בטוחה אחרי משך נתון (עם גיבויי onload/decode) */
function safeRemoveAfter(imgEl, durMs) {
  if (!imgEl) return
  function remove() { if (imgEl && imgEl.parentNode) imgEl.parentNode.removeChild(imgEl) }
  if (imgEl.decode) {
    imgEl.decode().catch(function () { }).finally(function () { setTimeout(remove, durMs) })
  } else {
    var done = false
    imgEl.onload = function () { if (!done) { done = true; setTimeout(remove, durMs) } }
    setTimeout(function () { if (!done) { done = true; remove() } }, durMs + 200)
  }
}

function setSafeBtnEnabled(isEnabled){ // שייך לכפתור לחיצה בטוחה
  var el = document.querySelector('#adv-icons .adv-btn[data-action="safe"]')
  if (!el) return
  if (isEnabled && gGame.isOn && !gGame.isOver && gSafeClicksUsed < SAFE_CLICK_LIMIT) {
    el.classList.remove('disabled')
    el.style.pointerEvents = ''
  } else {
    el.classList.add('disabled')
    el.style.pointerEvents = 'none'
  }
}

function handleSafeClick(btnEl){
  if (!gGame.isOn) return                // ← אסור לפני הקליק הראשון
  if (gGame.isOver) return
  if (gSafeClicksUsed >= SAFE_CLICK_LIMIT) { setSafeBtnEnabled(false); return }

  // בוחרים תא בטוח: לא נחשף, לא מסומן, לא מוקש
  var candidates = []
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      var cell = gBoard[i][j]
      if (!cell.isRevealed && !cell.isMarked && !cell.isMine) {
        candidates.push({ i:i, j:j })
      }
    }
  }
  if (!candidates.length) { setSafeBtnEnabled(false); return }

  var pick = candidates[Math.floor(Math.random() * candidates.length)]
  highlightSafeCell(pick.i, pick.j, 1500)

  gSafeClicksUsed++
  if (gSafeClicksUsed >= SAFE_CLICK_LIMIT) setSafeBtnEnabled(false)
}

// הדגשה זמנית
function highlightSafeCell(i, j, ms){
  clearSafeHintHighlight()
  var el = document.querySelector('.cell-' + i + '-' + j)
  if (!el) return
  el.classList.add('safe-hint')
  if (gSafeHintTimeoutId) clearTimeout(gSafeHintTimeoutId)
  gSafeHintTimeoutId = setTimeout(function(){
    if (el) el.classList.remove('safe-hint')
  }, ms || 1500)
}

// ניקוי הדגשה + טיימר
function clearSafeHintHighlight(){
  if (gSafeHintTimeoutId) { clearTimeout(gSafeHintTimeoutId); gSafeHintTimeoutId = null }
  var els = document.querySelectorAll('.cell.safe-hint')
  for (var k = 0; k < els.length; k++) els[k].classList.remove('safe-hint')
}


