'use strict'

var BEST_PREFIX = 'ms_bestTime_size'

 function getBestKey() {
  var size = (window.gLevel && gLevel.SIZE) ? gLevel.SIZE : 0
  return BEST_PREFIX + size
}

 function loadBestMs() {
  try {
    var v = localStorage.getItem(getBestKey())
    var n = v ? Number(v) : NaN
    return isNaN(n) ? null : n
  } catch (e) {
    return null
  }
}

 function saveBestMsIfBetter(finishMs) {
  if (typeof finishMs !== 'number' || !isFinite(finishMs) || finishMs <= 0) return false
  var prev = loadBestMs()
  if (prev == null || finishMs < prev) {
    try { localStorage.setItem(getBestKey(), String(finishMs)) } catch (e) {}
    updateBestTimePanel()
    return true
  }
  return false
}

function formatHMSfromMs(ms) {
  var total = Math.floor(ms / 1000)
  var hh = Math.floor(total / 3600)
  var mm = Math.floor((total % 3600) / 60)
  var ss = total % 60
  var hhS = (hh < 10 ? '0' + hh : '' + hh)
  var mmS = (mm < 10 ? '0' + mm : '' + mm)
  var ssS = (ss < 10 ? '0' + ss : '' + ss)
  return hhS + ':' + mmS + ':' + ssS
}

function updateBestTimePanel() {
  var el = document.getElementById('besttime-text')
  if (!el) return
  var ms = loadBestMs()
  el.textContent = (ms == null ? '--:--:--' : formatHMSfromMs(ms))
}

 function onLevelChanged_UpdateBest() {
  updateBestTimePanel()
}

// ===== איפוס *כל* שיאי הזמן (חד-פעמי) =====
// הוצא מהערה להרצה, שמור ורענן את העמוד; לאחר מכן החזר להערה.
/*
(function resetAllBestTimes(){
  // מוחק כל מפתח שמתחיל ב-BEST_PREFIX וגם את הגדלים הידועים (4/8/12)
  var prefix = (typeof BEST_PREFIX === 'string' && BEST_PREFIX) ? BEST_PREFIX : 'ms_bestTime_size'
  var sizes  = [4, 8, 12]

  // מחיקת המפתחות הידועים במפורש
  for (var i = 0; i < sizes.length; i++) {
    try { localStorage.removeItem(prefix + sizes[i]) } catch (e) {}
  }

  // מחיקה גורפת של כל מה שמתחיל ב-prefix (למקרה שיש רמות/מפתחות נוספים)
  for (var j = localStorage.length - 1; j >= 0; j--) {
    var k = localStorage.key(j)
    if (k && k.indexOf(prefix) === 0) {
      try { localStorage.removeItem(k) } catch (e) {}
    }
  }

  // רענון לוח ה-Best Time אם הפונקציה קיימת
  if (typeof updateBestTimePanel === 'function') updateBestTimePanel()
})();
*/