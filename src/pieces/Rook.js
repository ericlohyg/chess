export default class Rook {

    constructor(positionY, positionX, color) {
        this.positionX = positionX;
        this.positionY = positionY;
        this.hasMoved = false;
        this.color = color;
    }

    move(newX, newY) {
        this.positionX = newX;
        this.positionY = newY;
        this.hasMoved = true;
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
        var directions = [[-1, 0], [1, 0], [0, 1], [0, -1]];
        
        for (let i=0 ; i<directions.length ; i++) {
            var X = this.positionX;
            var Y = this.positionY;
            while (X >= 0 && X < 8 && Y >= 0 && Y < 8) {
                if (pieces[Y][X] != null && pieces[Y][X] !== this) {
                    // if opposite piece, still edible
                    if (pieces[Y][X].color !== this.color) {
                        moveable[Y][X] = true;
                    };
                    break;
                } else {
                    moveable[Y][X] = true;
                };
                Y += directions[i][0];
                X += directions[i][1];
            };      
        };

        return moveable;
    };

    getImageName() {
        return `r${this.color}`;
    }
}