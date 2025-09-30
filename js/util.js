
'use strict'


function renderBoard(mat, selector) {
  var strHTML = '<table class="board"><tbody>'
  for (var i = 0; i < mat.length; i++) {
    strHTML += '<tr>'
    for (var j = 0; j < mat[0].length; j++) {
      var cell = mat[i][j]

      // תוכן לתא
      var content = ''
      if (cell.isRevealed) {
        if (cell.isMine) {
          content = BOME_IMG
        } else if (cell.minesAroundCount) {
          content = '<span class="n n-' + cell.minesAroundCount + '">' + cell.minesAroundCount + '</span>'
        } else {
          content = ''
        }
      } else {
        content = cell.isMarked ? FLAG__IMG : ''
      }

      // מחלקות מצב לעיצוב
      var className = 'cell cell-' + i + '-' + j
      className += cell.isRevealed ? ' is-revealed' : ' is-hidden'
      if (!cell.isRevealed && cell.isMarked) className += ' has-flag'
      if (cell.isRevealed && cell.isMine) className += ' has-mine'

      strHTML +=
        '<td class="' + className + '"' +
        ' onclick="onCellClicked(this,' + i + ',' + j + ')"' +
        ' oncontextmenu="onCellMarked(this,' + i + ',' + j + '); return false;">' +
        content + '</td>'
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

