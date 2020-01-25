var Piece = require('./Piece');

module.exports = class Game {

    constructor() {
        this.pieces = [];
        for (let i=0;i<8;i++) {
            var row = [];
            for (let j=0;j<8;j++) {
                row.push(null);
            };
            this.pieces.push(row);
        };
        this.setupBoard();
    };

    getPieces(color) {
        if (color === "white") {
            // rotate pieces
            var rotated = [];
            for (let i=7;i>=0;i--) {
                var arr = [];
                for (let j=7;j>=0;j--) {
                    arr.push(this.pieces[i][j]);
                }
                rotated.push(arr);
            }
            return rotated;
        } else {
            return this.pieces;
        }
    };

    setupBoard() {
        var pieces = this.pieces;

        for (let i = 0 ; i < 8 ; i++) {
            pieces[1][i] = new Piece("l", "p", i, 1);
        }

        pieces[0][0] = new Piece("l", "r", 0, 0);
        pieces[0][1] = new Piece("l", "n", 0, 1);
        pieces[0][2] = new Piece("l", "b", 0, 2);
        pieces[0][3] = new Piece("l", "k", 0, 3);
        pieces[0][4] = new Piece("l", "q", 0, 4);
        pieces[0][5] = new Piece("l", "b", 0, 5);
        pieces[0][6] = new Piece("l", "n", 0, 6);
        pieces[0][7] = new Piece("l", "r", 0, 7);

        for (let i = 0 ; i < 8 ; i++) {
            pieces[6][i] = new Piece("d", "p", i, 6);
        }

        pieces[7][0] = new Piece("d", "r", 7, 0);
        pieces[7][1] = new Piece("d", "n", 7, 1);
        pieces[7][2] = new Piece("d", "b", 7, 2);
        pieces[7][3] = new Piece("d", "k", 7, 3);
        pieces[7][4] = new Piece("d", "q", 7, 4);
        pieces[7][5] = new Piece("d", "b", 7, 5);
        pieces[7][6] = new Piece("d", "n", 7, 6);
        pieces[7][7] = new Piece("d", "r", 7, 7);
    }

    move(isWhite, moveString) {

        if (moveString[0] === 'c') {
            // castle
            var command = moveString.substring(1);
            if (command === "bcl") {
                var rook = this.pieces[7][0];
                var king = this.pieces[7][3];
                this.pieces[7][1] = king;
                this.pieces[7][2] = rook;
                this.pieces[7][0] = null;
                this.pieces[7][3] = null;
            } else if(command === "bcr") {
                var rook = this.pieces[7][7];
                var king = this.pieces[7][3];
                this.pieces[7][5] = king;
                this.pieces[7][4] = rook;
                this.pieces[7][7] = null;
                this.pieces[7][3] = null;                               
            }  else if(command === "wcl") {
                var rook = this.pieces[0][7];
                var king = this.pieces[0][3];
                this.pieces[0][5] = king;
                this.pieces[0][4] = rook;
                this.pieces[0][7] = null;
                this.pieces[0][3] = null;                               
            }  else if(command === "wcr") {
                var rook = this.pieces[0][0];
                var king = this.pieces[0][3];
                this.pieces[0][1] = king;
                this.pieces[0][2] = rook;
                this.pieces[0][0] = null;
                this.pieces[0][3] = null;                               
            };
        } else {
            var pi = moveString[0];
            var pj = moveString[1];
            var i = moveString[2];
            var j = moveString[3];

            if (isWhite) {
                pi = 7 - pi;
                i = 7 - i;
                pj = 7 - pj;
                j = 7 - j;
            }

            this.pieces[i][j] = this.pieces[pi][pj];
            this.pieces[pi][pj] = null;
        };
    };
};


