'use strict'

const HINT_ON  = '<img src="img/HINT-ON.png">'
const HINT_OFF = '<img src="img/HINT-OFF.png">'

/* מצב פנימי של שלוש המנורות: false=OFF, true=ON */
var gHintsState = [false, false, false]


var HINTS_DEFAULT_ON = false  //  החלפה ל-true תדליק את כולן כברירת מחדל

/* (קריאה מתוך initGame) */
function initHintsUI(){
  for (var i = 0; i < gHintsState.length; i++) {
    gHintsState[i] = HINTS_DEFAULT_ON ? true : false
  }
  var imgs = document.querySelectorAll('#hints-bar .hint')
  for (var j = 0; j < imgs.length; j++) {
    var isOn = gHintsState[j]
    // קובעים את ה-src לפי מצב
    imgs[j].src = isOn ? 'img/HINT-ON.png' : 'img/HINT-OFF.png'
    // ליתר ביטחון מנקים classים/מאפיינים
    imgs[j].dataset.state = isOn ? 'on' : 'off'
    // מאפשרים קליק רק אם כבוי
    imgs[j].style.cursor = isOn ? 'default' : 'pointer'
  }
}

/* לחיצה על מנורה ספציפית */
function onHintClick(el, idx){
  
  // אם כבר דלוקה — אין פעולה
  if (gHintsState[idx]) return

  // מדליקים לצמיתות עד סוף המשחק
  gHintsState[idx] = true
  el.src = 'img/HINT-ON.png'
  el.dataset.state = 'on'
  el.style.cursor = 'default'


}
