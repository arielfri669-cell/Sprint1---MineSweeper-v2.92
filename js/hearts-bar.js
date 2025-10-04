'use strict'


var gLifeModeActive = false         // האם מצב חיים דולק
var gLivesTotal = 3                 // סך לבבות
var gLivesRemaining = gLivesTotal   // כמה נשארו
var gLifeBreakInProgress = false    // כדי לא לאפשר "שבירות" חופפות
var LIFE_BREAK_MS = 1400            // משך אנימציית broken_heart.gif (בקירוב)

const SPARKLING_HEART = '<img src="img/sparkling_heart.gif">'
const BROKEN_HEART    = '<img src="img/broken_heart.gif">'

function initLivesUI() {
  gLifeModeActive = false
  gLivesRemaining = gLivesTotal
  gLifeBreakInProgress = false

  var hearts = document.querySelectorAll('#lives-bar .life')
  for (var i = 0; i < hearts.length; i++) {
    
    setHeartOK(hearts[i])  // מאפס כל לב ל־OK + נראה על המסך
  }

  var btn = document.getElementById('life-toggle')
  if (btn) {
    btn.classList.remove('on'); btn.classList.add('off')
    btn.setAttribute('aria-pressed', 'false')
  }
}

// עזר: שומר על תאימות – אם האלמנט הוא <img> נעדכן src, אחרת נזריק HTML
function setHeartOK(el) {
  if (!el) return
  el.dataset.state = 'ok'
  el.style.visibility = 'visible'
  if (el.tagName === 'IMG') el.src = 'img/sparkling_heart.gif'
  else el.innerHTML = SPARKLING_HEART
}

function setHeartBreaking(el) {
  if (!el) return
  el.dataset.state = 'breaking'
  if (el.tagName === 'IMG') el.src = 'img/broken_heart.gif'
  else el.innerHTML = BROKEN_HEART
}

function setHeartLost(el) {
  if (!el) return
  el.dataset.state = 'lost'
  el.style.visibility = 'hidden'
}




// הדלקה/כיבוי מצב חיים (זהה בהתנהגות)
function toggleLifeMode(btn) {
  gLifeModeActive = !gLifeModeActive
  if (!btn) btn = document.getElementById('life-toggle')
  if (!btn) return
  if (gLifeModeActive) {
    btn.classList.remove('off'); btn.classList.add('on')
    btn.setAttribute('aria-pressed', 'true')
  } else {
    btn.classList.remove('on'); btn.classList.add('off')
    btn.setAttribute('aria-pressed', 'false')
  }
}

// שבירת לב אחד (זהה בהתנהגות – מפעיל אנימציה, מסתיר לב, ומסיים משחק כשנגמר)
function consumeLife() {
  if (gLivesRemaining <= 0 || gLifeBreakInProgress) return

  var hearts = document.querySelectorAll('#lives-bar .life')
  var target = null
  for (var i = 0; i < hearts.length; i++) {
    var state = hearts[i].dataset.state
    if (state !== 'lost' && state !== 'breaking') {
      target = hearts[i]
      break
    }
  }
  if (!target) return

  gLifeBreakInProgress = true
  setHeartBreaking(target) // מפעיל את אנימציית הלב השבור

  setTimeout(function () {
    setHeartLost(target)   // אחרי האנימציה – מסמן "אבוד" ומחביא
    gLivesRemaining--
    gLifeBreakInProgress = false

    if (gLivesRemaining === 0) {
      // אחרי שהלב השבור השלישי "נגמר" — מפסידים
      endGame(false)
    }
  }, LIFE_BREAK_MS)
}