
'use strict'


function renderBoard(mat, selector) {
  var strHTML = '<table><tbody>'
  for (var i = 0; i < mat.length; i++) {
    strHTML += '<tr>'
    for (var j = 0; j < mat[0].length; j++) {
      var cell = mat[i][j]
      var className = 'cell cell-' + i + '-' + j

      var content = ''
      if (cell.isRevealed) {
        content = cell.isMine ? BOME_IMG : (cell.minesAroundCount || '')
      }

      strHTML += '<td class="' + className + '">' + content + '</td>'
    }
    strHTML += '</tr>'
  }
  strHTML += '</tbody></table>'

  var elContainer = document.querySelector(selector)
  elContainer.innerHTML = strHTML
}


function getRandomIntInclusive(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}
