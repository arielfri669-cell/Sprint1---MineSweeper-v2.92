'use strict';

/* === הגדרות ושמירת מצב === */
var SOUND_STATE_KEY_V2 = 'ms_sound_state_v2';   // כולל volume
var SOUND_STATE_KEY_V1 = 'ms_sound_state_v1';   // תאימות לאחור
var gSoundUIBound = false;

var gSound = {
/* ברירת־מחדל: SFX ON, MUSIC OFF; פלייליסט 80s, שיר ראשון; עוצמת מוזיקה 50 */
sfxOn: true,
musicOn: false,
playlist: '80s',
trackIndex: 0,
volume: 50,              // 1..100

musicAudio: null,
musicFiles: {
  '80s':  ['audio/80s-1.mp3', 'audio/80s-2.mp3', 'audio/80s-3.mp3'],
  'chill':['audio/Chil-1.mp3', 'audio/Chil-2.mp3']
},

sfxFiles: {
  mega:       'audio/Submarine-Sonar.mp3',
  victory:    'audio/sfx-victory voic.mp3',
  life:       'audio/sfx-hert.mp3',
  winEnd:     'audio/sfx-ending sound.mp3',
  newRecord:  'audio/new-record.mp3',
  mine:       'audio/mine-sound.mp3',
  cell:       'audio/cell-click tab.mp3',
  lose:       'audio/digger sound.mp3',
  level:      'audio/army-rank.mp3',
  undoSafe:   'audio/undo-safe-btn.mp3'
}
};

function loadSoundState(){
try{
  var raw = localStorage.getItem(SOUND_STATE_KEY_V2);
  if(!raw){
    // תאימות לאחור
    raw = localStorage.getItem(SOUND_STATE_KEY_V1);
  }
  if(!raw) return;
  var st = JSON.parse(raw);
  if (typeof st.sfxOn === 'boolean')   gSound.sfxOn = st.sfxOn;
  if (typeof st.musicOn === 'boolean') gSound.musicOn = st.musicOn;
  if (st.playlist === '80s' || st.playlist === 'chill') gSound.playlist = st.playlist;
  if (typeof st.trackIndex === 'number') gSound.trackIndex = st.trackIndex|0;
  if (typeof st.volume === 'number' && isFinite(st.volume)) {
    gSound.volume = Math.max(1, Math.min(100, st.volume|0));
  }
}catch(e){}
}
function saveSoundState(){
try{
  localStorage.setItem(SOUND_STATE_KEY_V2, JSON.stringify({
    sfxOn: gSound.sfxOn,
    musicOn: gSound.musicOn,
    playlist: gSound.playlist,
    trackIndex: gSound.trackIndex|0,
    volume: gSound.volume|0
  }));
}catch(e){}
}

/* === אתחול UI – נקראת מתוך initGame() === */
function initSoundUI(){
loadSoundState();

// טוגלים (ימין)
var sfxT = document.getElementById('sfx-toggle-input');
var musT = document.getElementById('music-toggle-input');

if (sfxT) sfxT.checked = !!gSound.sfxOn;
if (musT) musT.checked = !!gSound.musicOn;

// רישום מאזינים פעם אחת בלבד
if (!gSoundUIBound){
  if (sfxT) sfxT.onchange = function(){
    gSound.sfxOn = !!sfxT.checked;
    saveSoundState();
  };
  if (musT) musT.onchange = function(){
    gSound.musicOn = !!musT.checked;
    saveSoundState();
    if (gSound.musicOn) startBackgroundMusic(); else stopBackgroundMusic();
  };
  // בחירת שיר – רדיו-סטייל בכל הרשימות
  var inputs = document.querySelectorAll('#sound-bar .music-choice');
  for (var i = 0; i < inputs.length; i++){
    if (!inputs[i].dataset.bound){
      inputs[i].addEventListener('change', onMusicCheckboxChange);
      inputs[i].dataset.bound = '1';
    }
  }
  gSoundUIBound = true;
}

// סנכרון הצ'קבוקס של השיר המסומן לפי state
syncMusicCheckboxesFromState();

// אם musicOn=true – נתחיל לנגן; אחרת נוודא עצירה
if (gSound.musicOn) startBackgroundMusic(); else stopBackgroundMusic();

// הסר ".mp3" מהתוויות
stripMp3FromLabels();

// בנה/רענן את UI הפיידר (משנה עוצמה)
ensureVolumeUI();
}

/* מסמן checkbox נכון לפי gSound.{playlist,trackIndex} */
function syncMusicCheckboxesFromState(){
var all = document.querySelectorAll('#sound-bar .music-choice');
var wantGroup = (gSound.playlist === 'chill') ? 'musicChill' : 'music80s';
var wantIdx = gSound.trackIndex|0;

for (var k = 0; k < all.length; k++){
  var g = all[k].getAttribute('data-group');
  var i = Number(all[k].getAttribute('data-index')) || 0;
  all[k].checked = (g === wantGroup && i === wantIdx);
}
}

/* בחירת שיר – רדיו אמיתי */
function onMusicCheckboxChange(ev){
var input = ev && ev.currentTarget;
if (!input || !input.checked) return;

// מכבה את כל השאר
var all = document.querySelectorAll('#sound-bar .music-choice');
for (var k = 0; k < all.length; k++){
  if (all[k] !== input) all[k].checked = false;
}

// עדכון state
var grp = input.getAttribute('data-group');
var idx = Number(input.getAttribute('data-index')) || 0;
gSound.playlist = (grp === 'musicChill') ? 'chill' : '80s';
gSound.trackIndex = idx;
saveSoundState();

// אם MUSIC דולק – מחליפים שיר; אם כבוי – רק זוכרים בחירה
if (gSound.musicOn) startBackgroundMusic();
}

/* מוזיקת רקע בלופ (מכבד חסימות auto-play) */
function startBackgroundMusic(){
try{
  var list = gSound.musicFiles[gSound.playlist] || [];
  var src = list[gSound.trackIndex] || list[0];
  if (!src) return;

  if (!gSound.musicAudio){
    gSound.musicAudio = new Audio(src);
  }else{
    if (gSound.musicAudio.src.indexOf(src) === -1) gSound.musicAudio.src = src;
  }
  gSound.musicAudio.loop = true;
  gSound.musicAudio.volume = Math.max(0.01, Math.min(1, gSound.volume/100));

  if (gSound.musicOn){
    gSound.musicAudio.play().catch(function(){ hookFirstUserGestureForAudio(); });
  }
}catch(e){}
}
function stopBackgroundMusic(){
try{ if (gSound.musicAudio) gSound.musicAudio.pause(); }catch(e){}
}

/* הפעלה רק לאחר מחווה ראשונה מהמשתמש (למקרה של חסימת auto-play) */
function hookFirstUserGestureForAudio(){
function resume(){
  try{
    if (gSound.musicAudio && gSound.musicOn)
      gSound.musicAudio.play().catch(function(){});
  }catch(e){}
  document.removeEventListener('click', resume, {capture:true});
  document.removeEventListener('keydown', resume, {capture:true});
}
document.addEventListener('click', resume,  {once:true, capture:true});
document.addEventListener('keydown', resume,{once:true, capture:true});
}

/* API גלובלי ל-SFX */
function playSfx(key){
if (!gSound.sfxOn) return;
var src = gSound.sfxFiles[key];
if (!src) return;
try{
  var a = new Audio(src);
  a.volume = 1;
  a.play().catch(function(){});
}catch(e){}
}

/* ====== UI הפיידר: בנייה, טיקים ו-LED ====== */
function ensureVolumeUI(){
  var rightCol = document.querySelector('#sound-bar .sound-right');
  if (!rightCol) return;

  // הסר כפילויות ישנות (אם היו נוצרות בעבר)
  var stray = rightCol.querySelectorAll('.volume-controls:not(#volume-controls)');
  for (var k=0; k<stray.length; k++){
    try{ stray[k].parentNode.removeChild(stray[k]); }catch(e){}
  }

  // לוקח את המעטפת מה-HTML (או יוצר אם חסר לחלוטין)
  var wrap = document.getElementById('volume-controls');
  if (!wrap){
    wrap = document.createElement('div');
    wrap.id = 'volume-controls';
    wrap.className = 'volume-controls';
    /* הוספת orient="vertical" גם בבנייה דינמית */
    wrap.innerHTML =
      '<div class="vol-body">' +
        '<div class="vol-rail">' +
          '<span id="volume-led" class="vu-led" aria-hidden="true"></span>' +
          '<input id="volume-slider" class="vol-slider" type="range" min="1" max="100" step="1" value="50" aria-label="Music volume" orient="vertical" />' +
        '</div>' +
        '<div class="vol-ticks" aria-hidden="true"></div>' +
      '</div>';
    rightCol.appendChild(wrap);
  }else{
    // משחזר מבנה פנימי אם משהו לא תקין
    if (!wrap.querySelector('#volume-slider') || !wrap.querySelector('.vol-rail') || !wrap.querySelector('.vol-ticks') || !wrap.querySelector('#volume-led')){
      wrap.innerHTML =
        '<div class="vol-body">' +
          '<div class="vol-rail">' +
            '<span id="volume-led" class="vu-led" aria-hidden="true"></span>' +
            '<input id="volume-slider" class="vol-slider" type="range" min="1" max="100" step="1" value="50" aria-label="Music volume" orient="vertical" />' +
          '</div>' +
          '<div class="vol-ticks" aria-hidden="true"></div>' +
        '</div>';
    }
  }

  var slider = wrap.querySelector('#volume-slider');
  var led    = wrap.querySelector('#volume-led');
  var ticksWrapEl = wrap.querySelector('.vol-ticks');

  // --- תיקון גרירה אנכית ב-Chrome בלי לשנות עיצוב/appearance ---
  (function enableVerticalDrag(sl, railEl){
    if (!sl || !railEl || sl.dataset.vdragBound) return;
    sl.dataset.vdragBound = '1';

    function setFromClientY(clientY){
      var r   = railEl.getBoundingClientRect();
      var y   = Math.max(0, Math.min(r.height, clientY - r.top));   // 0..height
      var pct = 1 - (y / r.height);                                  // למעלה=100%
      var min = Number(sl.min)  || 0;
      var max = Number(sl.max)  || 100;
      var step= Number(sl.step) || 1;
      var raw = min + pct * (max - min);
      var val = Math.round(raw / step) * step;
      val = Math.max(min, Math.min(max, val));
      if (String(sl.value) !== String(val)){
        sl.value = String(val);
        if (typeof sl.oninput === 'function') sl.oninput();
        sl.dispatchEvent(new Event('input', { bubbles:true }));
      }
    }

    let dragging = false;
    function start(e){
      dragging = true;
      setFromClientY(e.clientY);
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', stop, { once:true });
      e.preventDefault();
    }
    function move(e){ if (dragging) setFromClientY(e.clientY); }
    function stop(){ dragging = false; document.removeEventListener('pointermove', move); }

    railEl.addEventListener('pointerdown', start);
   
  })(slider, wrap.querySelector('.vol-rail'));

  /* מבטיח ש-orient="vertical" קיים גם אם ה-HTML הסטטי שונה */
  if (slider && !slider.hasAttribute('orient')) {
    try { slider.setAttribute('orient','vertical'); } catch(e){}
  }

  // בונה טיקים (בדיוק 20)
  if (!ticksWrapEl) return;
  if (ticksWrapEl.children.length !== 20){
    ticksWrapEl.innerHTML = '';
    for (var i=0;i<20;i++){
      var t = document.createElement('span');
      t.className = 'tick';
      ticksWrapEl.appendChild(t);
    }
  }

  // ערך התחלתי
  slider.value = String(gSound.volume|0);

  function updateTicks(v){
    var ticks = ticksWrapEl.children;
    var litCount = Math.round((v/100) * ticks.length);
    for (var i=0;i<ticks.length;i++){
      var el = ticks[i];
      el.className = 'tick';
      if (i < litCount){
        var tickVal = Math.round(((i+1)/ticks.length)*100);
        var zone = (tickVal <= 30) ? 'low' : (tickVal <= 70 ? 'mid' : 'high');
        el.classList.add('lit', zone);
      }
    }
  }
  function updateLed(v){ if (led) led.classList.toggle('on', v > 0); }
  function applyVolume(v){
    gSound.volume = v;
    saveSoundState();
    if (gSound.musicAudio){
      gSound.musicAudio.volume = Math.max(0.01, Math.min(1, v/100));
    }
    updateTicks(v);
    updateLed(v);
  }
  function onSliderInput(){
    var v = Math.max(1, Math.min(100, Math.round(Number(slider.value) || 50)));
    applyVolume(v);
  }

  // מאזינים – ללא כפילויות
  slider.oninput = onSliderInput;
  slider.onchange = onSliderInput;

  // מניעת שינוי עם גלילת עכבר
  wrap.onwheel = function(e){ e.preventDefault(); return false; };

  // סנכרון ראשוני
  applyVolume(gSound.volume|0);
}

/* ניקוי .mp3 מהטקסטים בתפריט */
function stripMp3FromLabels(){
var lbls = document.querySelectorAll('#sound-bar .label-text');
for (var i = 0; i < lbls.length; i++){
  var t = (lbls[i].textContent || '').trim();
  t = t.replace(/\.mp3\s*$/i, '');
  lbls[i].textContent = t;
}
}

/* חשיפה גלובלית */
window.initSoundUI = initSoundUI;
window.playSfx = playSfx;
