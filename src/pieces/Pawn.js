export default class Pawn {

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

        var direction;
        if (this.color === 'd') {
            direction = 1;
        } else {
            direction = -1;
        };

        var forward = this.positionY+direction;

        if (forward >= 0 && forward < 8 && pieces[forward][this.positionX] == null) {
            moveable[forward][this.positionX] = true;
        };

        if (forward >= 0 && forward < 8) {
            if (pieces[forward][this.positionX+1] != null && pieces[forward][this.positionX+1].color !== this.color) {
                moveable[forward][this.positionX+1] = true;
            };
            if (pieces[forward][this.positionX-1] != null && pieces[forward][this.positionX-1].color !== this.color) {
                moveable[forward][this.positionX-1] = true;
            };
        };

        var evenFurther = forward+direction;
        if (evenFurther < 8 && evenFurther >= 0 && !this.hasMoved && pieces[evenFurther][this.positionX] == null) {
            moveable[this.positionY+direction+direction][this.positionX] = true;
        };

        console.log(moveable);
        return moveable;
    };

    getImageName() {
        return `p${this.color}`;
    };

    getThreaten(pieces) {
        var i;
        if (this.color === 'd') {
            i = this.positionY + 1;
        } else {
            i = this.positionY - 1;
        };

        var threaten = new Array(8).fill(false).map(()=>new Array(8).fill(false)); 

        if (i >= 0 && i < 8) {
            if (pieces[i][this.positionX-1] == null || pieces[i][this.positionX-1].color !== this.color) {
                threaten[i][this.positionX-1] = true;
            };
            if (pieces[i][this.positionX+1] == null || pieces[i][this.positionX+1].color !== this.color) {
                threaten[i][this.positionX+1] = true;
            }
        };

        return threaten;
    };
}