
'use strict'


var gLevel = {
    SIZE: 6,
    MINES: 2
}

const NUM1 = ''
const NUM2 = '#'
const BOME_IMG = '<img src="img/bome.png">'

// const gBoard = 
// { 
//     minesAroundCount: 4, 
//     isRevealed: false, 
//     isMine: false, 
//     isMarked: false 
// }
var board

function initGame() {
    console.log(createMat(4, 4))

    board = buildBoard()
    renderBoard(board, '.board')

}

function buildBoard() {
    const size = gLevel.SIZE
    const board = []

    for (var i = 0; i < size; i++) {
        board.push([])

        for (var j = 0; j < size; j++) {
            board[i][j] = NUM1

            if (i === 0 || i === size - 1 || j === 0 || j === size - 1) {
                board[i][j] = NUM2
            }
        }
    }
    // להמשך נדרש להציב רנדומלי מוקשים בלוח !!!
    board[2][2] = board[3][4] = BOME_IMG
    // setMinesNegsCount(board)
    return board
}

// בדיקת תאים רקים במטריצה
//  עם תא = ריק אז בצע בדיקת מוקשים סביבו 
// עם תא  = מוקש 

// בדיקת מוקשים מסביב לתא
// function setMinesNegsCount(board) {
//     var minesAroundCount = 0
//     for (var i = gLevel.SIZE - 1; i <= gLevel.SIZE + 1; i++) {
//         if (i < 0 || i >= board.length) continue
//         for (var j = gLevel.SIZE - 1; j <= gLevel.SIZE + 1; j++) {
//             if (j < 0 || j >= board[0].length) continue
//             if (i === rowIdx && j === colIdx) continue
//             if (board[i][j].gameElement === BALL) minesAroundCount++
//         }
//     }
//     // const elNeighbors = document.querySelector('h2 span')
//     // elNeighbors.innerText = minesAroundCount
//     console.log(minesAroundCount);
    
// }
