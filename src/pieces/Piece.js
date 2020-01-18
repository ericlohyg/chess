export default class Piece {

    constructor(color, type, positionX, positionY) {
        this.color = color;
        this.type = type;
        this.positionX = positionX;
        this.positionY = positionY;
    }

    imageName() {
        return `${this.type}${this.color}.svg`;

    }

    pieceType() {
        
    }
}