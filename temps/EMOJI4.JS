'use strict'

var gEmojiState = 'happy'
var gEmojiTimer = null

var EMOJI_SRC = {
  happy:     'img/emoji_happy.png',
  surprised: 'img/emoji_surprised.png',
  dead:      'img/emoji_dead.gif',
  win:       'img/emoji_happy.gif'
}

// החלפת אימוג'י מיידית '(ומגדירה התנהגות קליק בהתאם למצב')
function setEmoji(state) {
  gEmojiState = state

  // עם רץ פונקציה עם הטיימר כבר אז לבטל אותה ןלאפס
  if (gEmojiTimer) {
    clearTimeout(gEmojiTimer)
    gEmojiTimer = null
  }

  var img = document.getElementById('emoji-img')
  var btn = document.getElementById('emoji-btn')
  if (!img || !btn) return // במידה ולא נמצא תמונה תחזור

  img.src = EMOJI_SRC[state]  // החלפת התמונה
  img.alt = state

  // התנהגות לחיצה על האימוג'י:
  // - happy: לחיצה = Restart
  // - dead/win: לחיצה = Restart
  // - surprised: אין פעולה (זמני)
  if (state === 'happy' || state === 'dead' || state === 'win') {
    btn.onclick = function(){ onEmojiClick() }
    btn.style.cursor = 'pointer'
  } else {
    btn.onclick = function(){} // surprised – לא עושה כלום
    btn.style.cursor = 'default'
  }
}

// הבהוב surprised לשנייה, ואז חזרה ל-happy (אלא אם המצב השתנה meanwhile)
function flashSurprised() {

  if (gEmojiState === 'dead' || gEmojiState === 'win') return   // אם כבר dead/win, לא מחזירים ל-happy

  setEmoji('surprised')
  gEmojiTimer = setTimeout(function(){
    // אם בזמן ההמתנה הפכנו ל-dead/win — לא לגעת
    if (gEmojiState === 'surprised') setEmoji('happy')
  }, 1000)
}

// קליק על האימוג'י לפי כללי הדרישה
function onEmojiClick() {
  // happy: Restart | dead: Restart | win: Restart
  if (gEmojiState === 'happy' || gEmojiState === 'dead' || gEmojiState === 'win') {
    initGame()
    setEmoji('happy')
  }
  // surprised – אין פעולה
}
