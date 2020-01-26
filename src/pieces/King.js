import Rook from './Rook'

export default class King {

    constructor(positionY, positionX, color) {
        this.positionX = positionX;
        this.positionY = positionY;
        this.hasMoved = false;
        this.color = color;
    }

    move(newX, newY) {
        // detect castle
        var castleMovement = '';
        if (!this.hasMoved) {
            // check if move is of this situation
            // since piece has not moved, just have to check if piece is going to the X-2 or X+2
            if (newX === this.positionX - 2) {
                castleMovement = 'left';
            } else if (newX === this.positionX + 2) {
                castleMovement = 'right';
            };
        };
        this.positionX = newX;
        this.positionY = newY;
        this.hasMoved = true;

        return castleMovement;
    };

    // getMoveable returns a 8x8 array of true/false array if the piece can travel to a position
    // does not take into account if king will be checked
    // pieces should be READ ONLY
    getMoveable(pieces) {

        if (pieces == null) {
            console.error("Error: pieces is null");
            return;
        };

        var moveable = new Array(8).fill(false).map(()=>new Array(8).fill(false)); 
        var directions = [[-1, -1], [1, 1], [1, -1], [-1, 1], [-1, 0], [1, 0], [0, 1], [0, -1]];
        
        for (let i=0 ; i<directions.length ; i++) {
            for (let i=0 ; i<directions.length ; i++) {
                var X = this.positionX + directions[i][1];
                var Y = this.positionY + directions[i][0];
                
                if (X >= 0 && X < 8 && Y >= 0 && Y < 8) {
                    if (pieces[Y][X] != null && pieces[Y][X].color === this.color) {
                        continue;
                    }
                    moveable[Y][X] = true;
                };
            };   
        };

        // check if can castle
        if (!this.hasMoved) {

            var i;
            if (this.color === 'd') {
                i = 0; 
            } else {
                i = 7;
            };
                // left/right is from white's perspective
                var leftRook = pieces[i][0];
                if (leftRook != null &&
                    leftRook instanceof Rook &&
                    leftRook.color === this.color &&
                    !leftRook.hasMoved) {
                        // now check there's no pieces in between them
                        if (pieces[i][1] == null &&
                            pieces[i][2] == null &&
                            pieces[i][3] == null) {
                                moveable[i][2] = true;
                            };
                };

                var rightRook = pieces[i][7];
                if (rightRook != null &&
                    rightRook instanceof Rook &&
                    rightRook.color === this.color &&
                    !rightRook.hasMoved) {
                        // now check there's no pieces in between them
                        if (pieces[i][5] == null &&
                            pieces[i][6] == null) {
                                moveable[i][6] = true;
                        };
                };               
            
        };
        return moveable;
    };

    getThreaten(pieces) {
        return this.getMoveable(pieces);
    }

    getImageName() {
        return `k${this.color}`;
    }
}