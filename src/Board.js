import React from 'react'
import Tile from './Tile'
import Rook from './pieces/Rook'
import Knight from './pieces/Knight'
import Bishop from './pieces/Bishop'
import Queen from './pieces/Queen'
import King from './pieces/King'
import Pawn from './pieces/Pawn'
import _ from 'lodash'

export default class Board extends React.Component {

    constructor(props) {

        super(props);

        var pieces = this.initPieces();
        var tiles = this.initTiles();
        tiles = this.getThreats(tiles, pieces);
        this.state = {
            pieces: pieces,
            tiles: tiles,
            prevClicked: null,
            checkmate: false,
            check: false
        };
        this.onClick = this.onClick.bind(this);
    };

    componentDidUpdate(prevProps) {
        if (prevProps.move !== this.props.move) {
            console.log(this.props.move);
            var moves = this.props.move.split(" ");
            moves.forEach(move => this.executeMove(move));
        };
    };

    executeMove(moveStr) {
        var pieces = this.state.pieces;
        console.log(moveStr);
        if (moveStr.length !== 4) {
            console.error("Error with move string");
            return;
        };

        pieces[moveStr[2]][moveStr[3]] = pieces[moveStr[0]][moveStr[1]];
        pieces[moveStr[0]][moveStr[1]] = null;
        pieces[moveStr[2]][moveStr[3]].move(parseInt(moveStr[3]), parseInt(moveStr[2]));
        var tiles = this.initTiles();
        tiles = this.getThreats(tiles, pieces);
        this.setState({
            pieces: pieces,
            tiles: tiles
        });

        if (this.isChecked(pieces, tiles)) {
            if (this.isCheckMate(pieces, tiles)) {
                this.setState({
                    checkmate: true
                })
            } else {
                this.setState({
                    check: true
                })
            }
        }
    };

    isCheckMate(pieces, tiles) {
        if (this.isChecked(pieces, tiles)) {
            // make every possible move there is, then check if still checked
            for (let i=0;i<8;i++) {
                for (let j=0;j<8;j++) {
                    if (pieces[i][j] != null && pieces[i][j].color === this.props.player) {
                        var moveable = pieces[i][j].getMoveable(pieces);
                        // for each moveable spot, move to there
                        for (let y=0;y<8;y++) {
                            for (let x=0;x<8;x++) {
                                if (moveable[y][x]) {
                                    var p = _.cloneDeep(pieces);
                                    var t = _.cloneDeep(tiles);
                                    p[y][x] = p[i][j];
                                    p[i][j] = null;
                                    p[y][x].move(x, y);
                                    if (!this.isChecked(p, t)) {
                                        return false
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };

        return true;
    }

    onClick(e, i, j) {

        if (this.props.player === 'd') {
            i = this.mapClick(i);
            j = this.mapClick(j);
        };

        var dataToSend = {};
        dataToSend.sender = this.props.player;

        console.dir(`${JSON.stringify(this.state.pieces[i][j])} `);

        // reset all the clicked states first 
        var prevClicked = this.state.prevClicked;
        var pieces = this.state.pieces;
        var tiles = this.initTiles();

        if (prevClicked == null) {
            if (pieces[i][j] != null && pieces[i][j].color === this.props.player) {
                // clicked on a piece
                console.log("clicked on your own piece");
                var clickedPiece = pieces[i][j];
                var moveable = clickedPiece.getMoveable(pieces);
                tiles = this.setTiles(tiles, moveable, "moveable");
                prevClicked = pieces[i][j];
                tiles[i][j].state = "selected";
            };
        } else if (prevClicked != null) {
            if (pieces[i][j] == null || pieces[i][j].color !== this.props.player) {
                // check if valid move
                if (this.validMove(_.cloneDeep(pieces), prevClicked.positionY, prevClicked.positionX, i, j)) {
                    var encodedMoves = this.makeMove(pieces, prevClicked, i, j);
                    if (encodedMoves !== '' && this.props.ws != null) {
                        console.log(encodedMoves);
                        dataToSend.type = 'move';
                        dataToSend.move = encodedMoves;
                        try {
                            this.props.ws.send(JSON.stringify(dataToSend));
                        } catch (err) {
                            console.error("Error sending to ws");
                            console.error(err);
                        };                    
                    };
                };
            };
            prevClicked = null;
        };
        this.setState({
            tiles: this.getThreats(tiles, pieces),
            prevClicked: prevClicked
        });
    };

    makeMove(pieces, pieceToMove, i, j) { 
        
        var encodedMoves = '';

        pieces[pieceToMove.positionY][pieceToMove.positionX] = null;
        pieces[i][j] = pieceToMove;

        encodedMoves += `${pieceToMove.positionY}${pieceToMove.positionX}${i}${j}`
        
        if (pieceToMove instanceof King) {
            var castling = pieceToMove.move(j, i);
            if (castling === 'left') {
                console.log("castling left");
                pieces[i][j+1] = pieces[i][0];
                pieces[i][j+1].move(j+1, i);
                pieces[i][0] = null;
                encodedMoves += ` ${i}${0}${i}${j+1}`;
            } else if (castling === 'right') {
                console.log("castling right");
                pieces[i][j-1] = pieces[i][7];
                pieces[i][j-1].move(j-1, i);
                pieces[i][7] = null; 
                encodedMoves += ` ${i}${7}${i}${j-1}`;
            };
        } else {
            pieceToMove.move(j, i);
        };

        return encodedMoves;
    }

    validMove(pieces, y, x, newY, newX) {
        // check if in moveable
        var moveable = pieces[y][x].getMoveable(pieces);
        if (!moveable[newY][newX]) {
            return false;
        };

        // check if king is in check after moving
        var p = _.cloneDeep(pieces);
        p[newY][newX] = p[y][x];
        p[y][x] = null;
        console.log("checking for check");
        if (this.isChecked(p, this.state.tiles)) {
            return false;
        };
        return true;
    };

    isChecked(pieces, tiles) {
        // search for the king

        tiles = this.getThreats(tiles, pieces);
        for (let i=0;i<8;i++) {
            for (let j=0;j<8;j++) {
                if (pieces[i][j] != null && pieces[i][j] instanceof King && pieces[i][j].color === this.props.player) {
                    if (tiles[i][j].state === "opponentthreaten") {
                        return true;
                    };
                };
            };
        };
        return false;
    };
    initTiles() {
        var tiles = [];
        for(let i=0;i<8;i++) {
            var row = [];
            for(let j=0;j<8;j++) {
                if ( i % 2 === 0 ) {
                    if (j % 2 === 0) {
                        row.push({
                            color: "dark", 
                            state: "unselected"
                        });  
                    } else {
                        row.push({
                            color: "light", 
                            state: "unselected"
                        }); 
                    };
                } else {
                    if (j % 2 === 0) {
                        row.push({
                            color: "light", 
                            state: "unselected"
                        });
                    } else {
                        row.push({
                            color: "dark", 
                            state: "unselected"
                        });                     
                    };                   
                };
            };
            tiles.push(row);
        };
        return tiles;
    };
    
    getThreats(tiles, pieces) {
        console.log(pieces);
        if (tiles == null || pieces == null) {
            console.error("Not init yet");
            return;
        }
        for (let i=0;i<8;i++) {
            for (let j=0;j<8;j++) {
                if (pieces[i][j] != null && pieces[i][j].color !== this.props.player) {
                    tiles = this.setTiles(tiles, pieces[i][j].getThreaten(pieces), "opponentthreaten");
                };
            };
        };
        return tiles;
    };
    // this places pieces according to white's perspective
    initPieces() {
        var pieces = new Array(8).fill(null).map(()=>new Array(8).fill(null));

        // dark pieces
        pieces[0][0] = new Rook  (0, 0, 'd');
        pieces[0][1] = new Knight(0, 1, 'd');
        pieces[0][2] = new Bishop(0, 2, 'd');
        pieces[0][3] = new Queen (0, 3, 'd');
        pieces[0][4] = new King  (0, 4, 'd');
        pieces[0][5] = new Bishop(0, 5, 'd');
        pieces[0][6] = new Knight(0, 6, 'd');
        pieces[0][7] = new Rook  (0, 7, 'd');
        pieces[1][0] = new Pawn  (1, 0, 'd'); 
        pieces[1][1] = new Pawn  (1, 1, 'd'); 
        pieces[1][2] = new Pawn  (1, 2, 'd'); 
        pieces[1][3] = new Pawn  (1, 3, 'd'); 
        pieces[1][4] = new Pawn  (1, 4, 'd'); 
        pieces[1][5] = new Pawn  (1, 5, 'd'); 
        pieces[1][6] = new Pawn  (1, 6, 'd'); 
        pieces[1][7] = new Pawn  (1, 7, 'd'); 

        // light pieces
        pieces[7][0] = new Rook  (7, 0, 'l');
        pieces[7][1] = new Knight(7, 1, 'l');
        pieces[7][2] = new Bishop(7, 2, 'l');
        pieces[7][3] = new Queen (7, 3, 'l');
        pieces[7][4] = new King  (7, 4, 'l');
        pieces[7][5] = new Bishop(7, 5, 'l');
        pieces[7][6] = new Knight(7, 6, 'l');
        pieces[7][7] = new Rook  (7, 7, 'l');
        pieces[6][0] = new Pawn  (6, 0, 'l'); 
        pieces[6][1] = new Pawn  (6, 1, 'l'); 
        pieces[6][2] = new Pawn  (6, 2, 'l'); 
        pieces[6][3] = new Pawn  (6, 3, 'l'); 
        pieces[6][4] = new Pawn  (6, 4, 'l'); 
        pieces[6][5] = new Pawn  (6, 5, 'l'); 
        pieces[6][6] = new Pawn  (6, 6, 'l'); 
        pieces[6][7] = new Pawn  (6, 7, 'l'); 

        return pieces;
    };

    render() {

        // for the dark player, have to rotate the board before rendering
        var pieces;
        var tiles;
        if (this.props.player === 'd') {
            pieces = this.rotate(this.state.pieces);
            tiles = this.rotate(this.state.tiles);
        } else {
            pieces = this.state.pieces;
            tiles = this.state.tiles;
        };

        if (this.state.checkmate) {
            return <div>checkmate</div>;
        }

        return <div className="gridview">
            { tiles.map((v, i) => v.map((m, j) => {
                if (pieces != null && pieces[i][j] !== null) {
                    return <Tile key={`${i}${j}` } i={i} j={j} tilestate={`${tiles[i][j]["state"]}${tiles[i][j]["color"]}`} onClick={this.onClick} chesspiece={`${pieces[i][j].getImageName()}.svg`}/>
                }
                return <Tile key={`${i}${j}` }  i={i} j={j} tilestate={`${tiles[i][j]["state"]}${tiles[i][j]["color"]}`} onClick={this.onClick} />
             })) }
        </div>;    
    };

    // ========================== // 
    // HELPER FUNCTIONS //

    // returns the opponent's perspective
    rotate(pieces) {
        var rotated = [];
        
        for (let i=pieces.length-1; i>= 0; i--) {
            var arr = [];
            for (let j=pieces[i].length-1; j>=0; j--) {
                arr.push(pieces[i][j]);
            };
            rotated.push(arr);
        };
        return rotated;
    };

    // sets the tiles to a different state - for debugging purposes
    // toSet is a boolean array
    setTiles(t, toSet, newState) {
        var tiles = _.cloneDeep(t);
        for (let i=0;i<tiles.length;i++) {
            for (let j=0;j<tiles[i].length; j++) {
                if (toSet[i][j]) {
                    tiles[i][j].state = newState
                };
            };
        };
        return tiles;
    };

    // this is for the dark player, since the.state.pieces is always maintained as white's perspective, we have to map the click to white's perspective
    mapClick(i) {
        return 7-i;
    };
};