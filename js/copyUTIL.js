
'use strict'

/* דוגמת הרצה:
console.log(createMat(2,3)) // [['','',''],['','','']]
console.log(getRandomIntInclusive(1,3)) // 1..3
*/

function createMat(rows, cols) {
  const mat = []
  for (var i = 0; i < rows; i++) {
    const row = []
    for (var j = 0; j < cols; j++) row.push('')
    mat.push(row)
  }
  return mat
}


function renderBoard(mat, selector) {

    var strHTML = '<table><tbody>'
    for (var i = 0; i < mat.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {

            const cell = mat[i][j]
            const className = `cell cell-${i}-${j}`

            strHTML += `<td class="${className}">${cell}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

// function renderCell(location, value) {
//     // Select the elCell and set the value
//     const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
//     elCell.innerHTML = value
// }

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}
