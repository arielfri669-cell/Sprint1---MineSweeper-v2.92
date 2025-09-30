

var gLifeModeActive = false         // האם מצב חיים דולק
var gLivesTotal = 3                 // סך לבבות
var gLivesRemaining = gLivesTotal   // כמה נשארו
var gLifeBreakInProgress = false    // כדי לא לאפשר "שבירות" חופפות
var LIFE_BREAK_MS = 1400            // משך אנימציית broken_heart.gif (בקירוב)


function initLivesUI() {
  gLifeModeActive = false
  gLivesRemaining = gLivesTotal
  gLifeBreakInProgress = false

  var hearts = document.querySelectorAll('#lives-bar .life')
  for (var i = 0; i < hearts.length; i++) {
    hearts[i].dataset.state = 'ok'               // ok | breaking | lost
    hearts[i].style.visibility = 'visible'
    hearts[i].src = 'img/sparkling_heart.gif'
  }

  var btn = document.getElementById('life-toggle')
  if (btn) {
    btn.classList.remove('on'); btn.classList.add('off')
    btn.setAttribute('aria-pressed', 'false')
  }
}

function toggleLifeMode(btn) {
  gLifeModeActive = !gLifeModeActive
  if (!btn) btn = document.getElementById('life-toggle')
  if (btn) {
    if (gLifeModeActive) { btn.classList.remove('off'); btn.classList.add('on');  btn.setAttribute('aria-pressed','true') }
    else                 { btn.classList.remove('on');  btn.classList.add('off'); btn.setAttribute('aria-pressed','false') }
  }
}

function consumeLife() {
  if (gLivesRemaining <= 0 || gLifeBreakInProgress) return
  var hearts = document.querySelectorAll('#lives-bar .life')
  var target = null
  for (var i = 0; i < hearts.length; i++) {
    if (hearts[i].dataset.state !== 'lost' && hearts[i].dataset.state !== 'breaking') {
      target = hearts[i]
      break
    }
  }
  if (!target) return

  gLifeBreakInProgress = true
  target.dataset.state = 'breaking'
  target.src = 'img/broken_heart.gif'     // מפעיל את האנימציה

  setTimeout(function () {
    target.dataset.state = 'lost'
    target.style.visibility = 'hidden'    // אחרי האנימציה – נעלם
    gLivesRemaining--
    gLifeBreakInProgress = false

    if (gLivesRemaining === 0) {
      // אחרי שהלב השבור השלישי "נגמר" — מפסידים
      endGame(false)
    }
  }, LIFE_BREAK_MS)
}
