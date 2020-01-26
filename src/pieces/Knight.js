export default class Knight {

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
    getMoveable(pieces) {

        if (pieces == null) {
            console.error("Error: pieces is null");
            return;
        };

        var moveable = new Array(8).fill(false).map(()=>new Array(8).fill(false)); 
        var directions = [[-2, 1], [-2, -1], [2, 1], [2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
        
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
        return moveable;
    };

    getImageName() {
        return `n${this.color}`;
    };

    getThreaten(pieces) {
        return this.getMoveable(pieces);
    };
}