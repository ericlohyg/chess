import React from 'react'
import Tile from './Tile'
import Rook from './pieces/Rook'
import _ from 'lodash'

export default class Board extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            pieces: this.initPieces(),
            tiles: this.initTiles(),
            prevClicked: null,
        };
        this.onClick = this.onClick.bind(this);
    };
    
    // this places pieces according to white's perspective
    initPieces() {
        var pieces = new Array(8).fill(null).map(()=>new Array(8).fill(null));

        // dark pieces
        pieces[0][0] = new Rook(0, 0, 'd');
        pieces[0][7] = new Rook(0, 7, 'd'); 

        // light pieces
        pieces[7][0] = new Rook(7, 0, 'l');
        pieces[7][7] = new Rook(7, 7, 'l'); 
        return pieces;
    };

    onClick(e, i, j) {

        if (this.props.player === 'd') {
            i = this.mapClick(i);
            j = this.mapClick(j);
        };

        var dataToSend = {};
        dataToSend.sender = this.props.player;

        console.dir(`${JSON.stringify(this.state.pieces[i][j])} `);

        // reset all the clicked states first 
        var tiles = this.initTiles();
        var prevClicked = this.state.prevClicked;
        var pieces = this.state.pieces;

        if (prevClicked == null) {
            if (pieces[i][j] != null && pieces[i][j].color === this.props.player) {
                // clicked on a piece
                console.log("clicked on your own piece");
                var clickedPiece = pieces[i][j];
                var moveable = clickedPiece.getMoveable(pieces);
                tiles = this.setTiles(tiles, moveable, "moveable");
                prevClicked = pieces[i][j];
            };
        } else if (prevClicked != null) {
            if (pieces[i][j] == null || pieces[i][j].color !== this.props.player) {
                // check if valid move
                if (this.validMove(_.cloneDeep(pieces), prevClicked.positionY, prevClicked.positionX, i, j)) {
                    pieces[prevClicked.positionY][prevClicked.positionX] = null;
                    pieces[i][j] = prevClicked;
                    console.log(`moved from ${prevClicked.positionY} ${prevClicked.positionX} to ${i} ${j}`);
                    prevClicked.move(j, i);
                };
            };
            prevClicked = null;
        };

        try {
            this.props.ws.send(JSON.stringify(dataToSend));
        } catch (err) {
            console.error("Error sending to ws");
            console.error(err);
        };

        this.setState({
            tiles: tiles,
            prevClicked: prevClicked
        });
    };

    validMove(pieces, y, x, newY, newX) {
        // check if in moveable
        var moveable = pieces[y][x].getMoveable(pieces);
        if (!moveable[newY][newX]) {
            return false;
        };
        return true;
    }

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



// export default class Board extends React.Component {

//     constructor(props) {

//         super(props);


//         this.state = {
//             tiles: [],
//             currSelected: [],
//             pieces: null,
//             moveable: new Array(8).fill(false).map(()=>new Array(8).fill(false)),
//             checked: false,
//             oppChecked: false,
//             opponentThreaten: new Array(8).fill(false).map(()=>new Array(8).fill(false)),
//             isCheckMate: false,
//             leftRookMoved: false,
//             rightRookMoved: false,
//             kingMoved: false
//         };

        
//         for(let i=0;i<boardSize;i++) {
//             var row = [];
//             for(let j=0;j<boardSize;j++) {
//                 if ( i % 2 === 0 ) {
//                     if (j % 2 === 0) {
//                         row.push({
//                             color: "dark", 
//                             state: "unselected"
//                         })  
//                     } else {
//                         row.push({
//                             color: "light", 
//                             state: "unselected"
//                         }) 
//                     };
//                 } else {
//                     if (j % 2 === 0) {
//                         row.push({
//                             color: "light", 
//                             state: "unselected"
//                         }) 
//                     } else {
//                         row.push({
//                             color: "dark", 
//                             state: "unselected"
//                         })                       
//                     };                   
//                 }
//             };
//             this.state.tiles.push(row);
//         }
//         this.onClick = this.onClick.bind(this);
//         this.equals = this.equals.bind(this);

//     }

//     onClick(e, i, j) {
//         e.preventDefault();
        
//         console.log(`pressed: ${i} ${j}`);
//         this.updateGameState();

//         if (this.props.turn !== this.props.player) {
//             console.log("not your turn");
//             //return;
//         }
//         var tiles = this.state.tiles;
//         // this.state.currSelected refers to the previous selection indexes before this click
//         var prevSelected = this.state.currSelected;
        
//         if (tiles[i][j].state === "selected") {
//             for (let i=0;i<boardSize; i++) {
//                 for (let j=0;j<boardSize; j++) {
//                     tiles[i][j].state = "unselected";
//                }
//             }
//             var currSelected = [];
//             this.setState({
//                 tiles: tiles,
//                 currSelected: currSelected
//             });
//             return;
//         }
    
//         // if previous piece selected is the player's and the new place is a valid spot, send move to server
//         if (prevSelected.length !== 0) {

//             var prevPiece = this.props.pieces[prevSelected[0]][prevSelected[1]];
//             if (prevPiece !== null && ((prevPiece.color === 'l' && this.props.player === 'white') || (prevPiece.color === 'd' && this.props.player === 'black'))) {
                
//                 if (this.castleIntent(this.props.pieces, prevSelected[0], prevSelected[1], i, j) !== "") {
//                     console.log("castle intent" + this.castleIntent(this.props.pieces, prevSelected[0], prevSelected[1], i, j));
//                     var msg = {};
//                     msg.type = "move";
//                     msg.player = this.props.player;
//                     msg.move = 'c' + this.castleIntent(this.props.pieces, prevSelected[0], prevSelected[1], i, j);
//                     this.props.ws.send(JSON.stringify(msg));                   
//                 } else {
//                     var moveable = this.getMoveable(this.state.tiles, prevSelected[0], prevSelected[1]);

//                     if (moveable[i][j] && this.isLegalMove(this.props.pieces, prevSelected[0], prevSelected[1], i, j)) {
//                         msg = {};
//                         msg.type = "move";
//                         msg.player = this.props.player;
//                         msg.move = `${prevSelected[0]}${prevSelected[1]}${i}${j}`;
//                         this.props.ws.send(JSON.stringify(msg));
                        
//                         if (prevSelected[0] === 7 && prevSelected[1] === 0 && prevPiece.type === 'r' && !this.state.leftRookMoved) {
//                             this.setState({
//                                 leftRookMoved: true
//                             });
//                         } else if (prevSelected[0] === 7 && prevSelected[1] === 7 && prevPiece.type === 'r' && !this.state.rightRookMoved) {
//                             this.setState({
//                                 rightRookMoved: true
//                             });                       
//                         } else if (prevPiece.type === 'k' && !this.state.kingMoved) {
//                             this.setState({
//                                 kingMoved: true
//                             });
//                         };
//                     }
//                 }
//             } else {
//                 console.log("not legal move");
//             };
            
//         };
//         // unselect everything 
//         for (let i=0;i<boardSize; i++) {
//             for (let j=0;j<boardSize; j++) {
//                 tiles[i][j].state = "unselected";
//            }
//         }

//         tiles[i][j].state = "selected";

//         currSelected = [];
//         currSelected.push(i);
//         currSelected.push(j);
//         this.setState({
//             tiles: tiles,
//             currSelected: currSelected
//         });
//     };

//     castleIntent(pieces, i, j, y, x) {
//         // check if its intent to castle
//         // lots of condition for castle 
//         if (this.props.player === 'black' && pieces[i][j].type === 'k') {
//             if (i === 7 && j === 3 && y === 7 && x === 1                                        // start and end positions
//                 && !this.state.checked                                                          // not checked 
//                 && !this.state.opponentThreaten[7][2] && !this.state.opponentThreaten[7][1]     // king will not pass through threatened spots
//                 && !this.state.leftRookMoved && !this.state.kingMoved                           // king and rook has not moved
//                 && pieces[7][1] === null && pieces[7][2] === null) {                            // no pieces blocking
//                 // black castle left 
//                 return "bcl";
//             } else if (i === 7 && j === 3 && y === 7 && x === 5                                 // start and end positions
//                 && !this.state.checked                                                          // not checked 
//                 && !this.state.opponentThreaten[7][4] && !this.state.opponentThreaten[7][5]     // king will not pass through threatened spots
//                 && !this.state.rightRookMoved && !this.state.kingMoved                          // king and rook has not moved
//                 && pieces[7][4] === null && pieces[7][5] === null && pieces[7][6] === null) {   // no pieces blocking
//                 // black castle right
//                 return "bcr";
//             };
//         } else if (this.props.player === 'white' && pieces[i][j].type === 'k') {
//             console.log(this.state.leftRookMoved);
//             console.log(this.state.kingMoved);
//             if (i === 7 && j === 4 && y === 7 && x === 2                                        // start and end positions
//                 && !this.state.checked                                                          // not checked 
//                 && !this.state.opponentThreaten[7][3] && !this.state.opponentThreaten[7][2]     // king will not pass through threatened spots
//                 && !this.state.leftRookMoved && !this.state.kingMoved                           // king and rook has not moved
//                 && pieces[7][3] === null && pieces[7][2] === null && pieces[7][1] === null) {    // no pieces blocking
//                 // white castle left 
//                 return "wcl";
//             } else if (i === 7 && j === 4 && y === 7 && x === 6                                 // start and end positions
//                 && !this.state.checked                                                          // not checked 
//                 && !this.state.opponentThreaten[7][5] && !this.state.opponentThreaten[7][6]     // king will not pass through threatened spots
//                 && !this.state.rightRookMoved && !this.state.kingMoved                          // king and rook has not moved
//                 && pieces[7][5] === null && pieces[7][6] === null ) {                           // no pieces blocking
//                 // white castle right
//                 return "wcr";
//             };
//         } 

//         return "";
//     };

//     // move is not legal if the player making the move ends up being checked
//     isLegalMove(pieces, startI, startJ, endI, endJ) {
//         var p = this.clone(pieces);

//         var gameState = {
//             checked: false,
//             oppChecked: false,
//             opponentThreaten: new Array(8).fill(false).map(()=>new Array(8).fill(false))
//         }

//         p[endI][endJ] = p[startI][startJ];
//         p[startI][startJ] = null;
//         this.getThreats(gameState, p);

//         if (gameState.checked) {
//             return false;
//         } 
//         return true;
//     }

//     // TODO
//     getMoveable(tiles, i, j) {
//         var moveable = new Array(8).fill(false).map(()=>new Array(8).fill(false));
//         var piece = this.props.pieces[i][j];

//         if (piece === null) {
//             return;
//         }

//         if (this.pColor(piece.color) !== this.props.player) {
//             // player selected opponent's piece, ignore and return
//             return;
//         } 
//         if (piece.type === 'r' || piece.type === 'q') {
//             // up
//             var y = i-1;
//             while (y >= 0 && (this.props.pieces[y][j] === null || this.isOpponentPiece(this.props.pieces[y][j].color, this.props.player))) {
//                 if (this.isLegalMove(this.props.pieces, i, j, y, j)) {
//                     moveable[y][j] = true;
//                     tiles[y][j].state = "moveable";
//                     if (this.props.pieces[y][j] !== null) {
//                         break;
//                     }
//                 }
//                 y = y - 1;
                
//             }
//             // down
//             y = i+1
//             while (y <= 7 && (this.props.pieces[y][j] === null || this.isOpponentPiece(this.props.pieces[y][j].color, this.props.player))) {
//                 if (this.isLegalMove(this.props.pieces, i, j, y, j)) {
//                     moveable[y][j] = true;
//                     tiles[y][j].state = "moveable";
//                     if (this.props.pieces[y][j] !== null) {
//                         break;
//                     };
//                 };
//                 y = y + 1;
//             };
//             // left
//             y = j-1
//             while (y >= 0 && (this.props.pieces[i][y] === null || this.isOpponentPiece(this.props.pieces[i][y].color, this.props.player))) {
//                 if (this.isLegalMove(this.props.pieces, i, j, i, y)) {
//                     moveable[i][y] = true;
//                     tiles[i][y].state = "moveable";
//                     if (this.props.pieces[i][y] !== null) {
//                         break;
//                     };
//                 };
//                 y = y - 1;
//             };
//             // right
//             y = j+1
//             while (y <= 7 && (this.props.pieces[i][y] === null || this.isOpponentPiece(this.props.pieces[i][y].color, this.props.player))) {
//                 if (this.isLegalMove(this.props.pieces, i, j, i, y)) {
//                     moveable[i][y] = true;
//                     tiles[i][y].state = "moveable";
//                     if (this.props.pieces[i][y] !== null) {
//                         break;
//                     };
//                 };
//                 y = y + 1;
//             };
//         };
//         if (piece.type === 'b' || piece.type === 'q') {
//             // top right
//             y = i - 1;
//             var x = j + 1;
//             while (y >= 0 && x <= 7 && (this.props.pieces[y][x] === null || this.isOpponentPiece(this.props.pieces[y][x].color, this.props.player))) {
//                 if (this.isLegalMove(this.props.pieces, i, j, y, x)) {
//                     moveable[y][x] = true;
//                     tiles[y][x].state = "moveable";
//                     if (this.props.pieces[y][x] !== null) {
//                         break;
//                     };
//                 };
//                 y = y - 1;
//                 x = x + 1;
//             };
//             // top left
//             y = i - 1;
//             x = j - 1;
//             while (y >= 0 && x >= 0 && (this.props.pieces[y][x] === null || this.isOpponentPiece(this.props.pieces[y][x].color, this.props.player))) {
//                 if (this.isLegalMove(this.props.pieces, i, j, y, x)) {
//                     moveable[y][x] = true;
//                     tiles[y][x].state = "moveable";
//                     if (this.props.pieces[y][x] !== null) {
//                         break;
//                     };
//                 };
//                 y = y - 1;
//                 x = x - 1;
//             }
//             // bottom left
//             y = i + 1;
//             x = j - 1;
//             while (y <= 7 && x >= 0 && (this.props.pieces[y][x] === null || this.isOpponentPiece(this.props.pieces[y][x].color, this.props.player))) {
//                 if (this.isLegalMove(this.props.pieces, i, j, y, x)) {
//                     moveable[y][x] = true;
//                     tiles[y][x].state = "moveable";
//                     if (this.props.pieces[y][x] !== null) {
//                         break;
//                     };
//                 };
//                 y = y + 1;
//                 x = x - 1;
//             };
//             // bottom right
//             y = i + 1;
//             x = j + 1;
//             while (y <= 7 && x <= 7 && (this.props.pieces[y][x] === null || this.isOpponentPiece(this.props.pieces[y][x].color, this.props.player))) {
//                 if (this.isLegalMove(this.props.pieces, i, j, y, x)) {
//                     moveable[y][x] = true;
//                     tiles[y][x].state = "moveable";
//                     if (this.props.pieces[y][x] !== null) {
//                         break;
//                     };
//                 };
//                 y = y + 1;
//                 x = x + 1;
//             };
//         };

//         if (piece.type === 'n') {
//             var toCheck = [[i-1, j-2], [i-2, j-1], [i-2, j+1], [i-1, j+2], [i+2, j-1], [i+1, j-2], [i+1, j+2], [i+2, j+1]]

//             for (let h=0;h<toCheck.length;h++) {
//                 y = toCheck[h][0];
//                 x = toCheck[h][1];
//                 if (this.inRange(x, y) && (this.props.pieces[y][x] === null || this.isOpponentPiece(this.props.pieces[y][x].color, this.props.player))) {
//                     if (this.isLegalMove(this.props.pieces, i, j, y, x)) {
//                         moveable[y][x] = true;
//                         tiles[y][x].state = "moveable";
//                     };
//                 };
//             };
//         };

//         if (piece.type === 'p') {
//             // check sides for enemies
//             var left = j - 1;
//             var right = j + 1;
//             if (left >= 0 && (this.props.pieces[i-1][left] !== null && this.isOpponentPiece(this.props.pieces[i-1][left].color, this.props.player))) {
//                 if (this.isLegalMove(this.props.pieces, i, j, i-1, left)) {
//                     moveable[i-1][left] = true;
//                     tiles[i-1][left].state = "moveable";
//                 }
//             }
//             if (right <= 7 && (this.props.pieces[i-1][right] !== null && this.isOpponentPiece(this.props.pieces[i-1][right].color, this.props.player))) {
//                 if (this.isLegalMove(this.props.pieces, i, j, i-1, right)) {
//                     moveable[i-1][right] = true;
//                     tiles[i-1][right].state = "moveable";
//                 }
//             }
//             var up = i - 1;
//             if (up >= 0 && (this.props.pieces[up][j] === null)) {
//                 if (this.isLegalMove(this.props.pieces, i, j, up, j)) {
//                     moveable[up][j] = true;
//                     tiles[up][j].state = "moveable";
//                 }
//                 // if pawn is at original position, can move one more step
//                 if (i === 6) {
//                     up = up - 1;
//                     if (up >= 0 && (this.props.pieces[up][j] === null)) {
//                         if (this.isLegalMove(this.props.pieces, i, j, up, j)) {
//                             moveable[up][j] = true;
//                             tiles[up][j].state = "moveable";
//                         }
//                     };
//                 };
//             };
//         };

//         if (piece.type === 'k') {
//             toCheck = [[i-1, j], [i-1, j-1], [i-1, j+1], [i, j+1], [i+1, j-1], [i+1, j], [i, j+1], [i+1, j+1]];
//             for (let k=0;k<toCheck.length;k++) {
//                 y = toCheck[k][0];
//                 x = toCheck[k][1];
//                 if (y >= 0 && y <= 7 && x >= 0 && x <= 7 && !this.state.opponentThreaten[y][x] && (this.props.pieces[y][x] === null || this.isOpponentPiece(this.props.pieces[y][x].color, this.props.player))) {
//                     moveable[y][x] = true;
//                     tiles[y][x].state = "moveable";
//                 }
//             };
//         };
//         return moveable;
//     };

//     getThreats(gameState, pieces) {  
//         var tiles = this.state.tiles;

//         var update = function(ownPiece, q, w, e, r) {
//             if (pieces[e][r] !== null) {
//                     if (ownPiece) {
//                         // for your own piece, all you have to check is if you check the opponent
//                         if (pieces[e][r].type === 'k' && pieces[e][r].color !== pieces[q][w].color) {
//                             gameState.oppChecked = true;
//                         }
//                     } else {
//                         if (pieces[e][r].type === 'k' && pieces[e][r].color !== pieces[q][w].color) {
//                             gameState.checked = true;
//                         };
//                         gameState.opponentThreaten[e][r] = true;
//                     }
//                 return true;
//             }

//             if (!ownPiece) {
//                 gameState.opponentThreaten[e][r] = true;
//             }

//             return false;
//         }         
//         for (let i=0;i<8;i++) {
//             for (let j=0;j<8;j++) {
//                 if (pieces[i][j] === null) {
//                     continue;
//                 }
//                 var ownPiece = !this.isOpponentPiece(pieces[i][j].color, this.props.player);

//                 if (pieces[i][j].type === 'r' || pieces[i][j].type === 'q') {
//                     // up
//                     var y = i-1;
//                     var done = false;
//                     while (y >= 0 && !done) {
//                         done = update(ownPiece, i, j, y, j);
//                         y = y - 1;
//                     };
//                     // down
//                     y = i + 1;
//                     done = false;
//                     while(y <= 7 && !done) {
//                         done = update(ownPiece, i, j, y, j);
//                         y = y + 1;
//                     };
//                     // left 
//                     y = j - 1;
//                     done = false;
//                     while(y >= 0 && !done) {
//                         done = update(ownPiece, i, j, i, y);
//                         y = y - 1;
//                     };
//                     // right
//                     y = j + 1;
//                     done = false;
//                     while(y <= 7 && !done) {
//                         done = update(ownPiece, i, j, i, y);
//                         y = y + 1;
//                     };
//                 };

//                 if (pieces[i][j].type === 'b' || pieces[i][j].type === 'q') {
//                     // diagonally
//                     var directions = [[-1,-1], [-1, 1], [1, -1], [1, 1]];
                    
//                     for (let k=0; k<directions.length;k++) {
//                         y = directions[k][0] + i;
//                         var x = directions[k][1] + j;
//                         done = false;
//                         while (y >= 0 && y <= 7 && x >= 0 && x <= 7 && !done) {
//                             done = update(ownPiece, i, j, y, x);
//                             y = y + directions[k][0];
//                             x = x + directions[k][1];
//                         };
//                     };
//                 };
                
//                 if (pieces[i][j].type === 'n') {
//                     var toCheck = [[i-1, j-2], [i-2, j-1], [i-2, j+1], [i-1, j+2], [i+2, j-1], [i+1, j-2], [i+1, j+2], [i+2, j+1]];
//                     for (let k=0;k<toCheck.length;k++) {
//                         y = toCheck[k][0];
//                         x = toCheck[k][1];

//                         if (y >= 0 && y <= 7 && x >= 0 && x <= 7) {
//                             update(ownPiece, i, j, y, x);
//                         };                       
//                     };                    
//                 };

//                 if (pieces[i][j].type === 'p' && i !== 0) {
//                     if (j-1 >= 0) {
//                         update(ownPiece, i, j, i+1, j-1);
//                     }
//                     if (j+1 <= 7) {
//                         update(ownPiece, i, j, i+1, j+1);
//                     }
//                 }

//                 if (pieces[i][j].type === 'k') {
//                     toCheck = [[i-1, j-1], [i-1, j-1], [i-1, j+1], [i-1, j+1], [i+1, j-1], [i+1, j-1], [i+1, j+1], [i+1, j+1]];
//                     for (let k=0;k<toCheck.length;k++) {
//                         y = toCheck[k][0];
//                         x = toCheck[k][1];

//                         if (y >= 0 && y <= 7 && x >= 0 && x <= 7) {
//                             update(ownPiece, i, j, y, x);
//                         };                       
//                     };                     
//                 }
//             };                    
//         };
//         this.setState({
//             tiles: tiles
//         });
//     }

//     componentDidUpdate(prevProps) {
//         if (this.equals(this.props.pieces, prevProps.pieces)) {
//             return;
//         };

//         this.updateGameState();
//     };

//     updateGameState() {
//         var gameState = {
//             checked: false,
//             oppChecked: false,
//             opponentThreaten: new Array(8).fill(false).map(()=>new Array(8).fill(false))
//         };

//         var tiles = this.state.tiles;

//         // TODO: REMOVE THIS WHEN DONE
//         // unselect everything first
//         for (let i=0;i<boardSize; i++) {
//             for (let j=0;j<boardSize; j++) {
//                 tiles[i][j].state = "unselected";
//             }
//         }

//         this.getThreats(gameState, this.props.pieces);

//         this.setState({
//             opponentThreaten: gameState.opponentThreaten
//         });

//         var moveable = this.getMoveables(this.props.pieces);
//         var isCheckMate = gameState.checked;
//         if (gameState.checked) {
//             // check if there is any moveable spots 
//             for (let i=0;i<boardSize; i++) {
//                 for (let j=0;j<boardSize; j++) {
//                     if (moveable[i][j]) {
//                         isCheckMate = false;
//                     };
//                 };
//             };
//         };
        
//         this.setState({
//             oppChecked: gameState.oppChecked,
//             checked: gameState.checked,
//             opponentThreaten: gameState.opponentThreaten,
//             moveable: moveable,
//             isCheckMate: isCheckMate
//         });
//     };
//     getMoveables(pieces) {
//         var moveables = new Array(8).fill(false).map(()=>new Array(8).fill(false));
//         for (let i=0;i<8;i++) {
//             for (let j=0;j<8;j++) {
//                 // only need to care about your own pieces
//                 if (pieces[i][j] === null || this.isOpponentPiece(pieces[i][j].color, this.props.player)) {
//                     continue;
//                 };
//                 var moveableList = this.getMoveable(this.state.tiles, i, j);
//                 for (let k=0;k<8;k++) {
//                     for (let h=0;h<8;h++) {
//                         moveables[k][h] = moveableList[k][h] || moveables[k][h];
//                     };
//                 };
//             };
//         };
//         return moveables;
//     }
//     equals(pieces, pieces2) {
//         for (let i=0;i<8;i++) {
//             for (let j=0;j<8;j++) {
//                 if (pieces[i][j] === null) {
//                     if (pieces2[i][j] !== null) {
//                         return false;
//                     }
//                 }
//                 if (pieces2[i][j] === null) {
//                     if (pieces[i][j] !== null) {
//                         return false;
//                     }
//                 }
//                 if (pieces[i][j] !== null && pieces2[i][j] !== null && (pieces2[i][j].color !== pieces[i][j].color || pieces2[i][j].type !== pieces[i][j].type)) {
//                     return false;
//                 }
//             }
//         }
//         return true;
//     }

//     pColor(p) {
//         if (p === 'l') {
//             return "white";
//         }
//         if (p === 'd') {
//             return "black";
//         }

//         return "fail";
//     }

//     isOpponentPiece(p, d) {
//         if ((p === 'l' && d === 'black') || (p === 'd' && d === 'white')) {
//             return true;
//         }
//         return false;
//     }

//     inRange(i, j) {
//         if (i < 0 || i > 7 || j < 0 || j > 7) {
//             return false;
//         }
//         return true;
//     }

//     clone(pieces) {
//         return _.cloneDeep(pieces);
//     };

//     render() {        
//         if (this.state.oppChecked || this.state.checked) {
//             var checked = <div> Checked </div>;
//             if (this.state.isCheckMate) {
//                 checked = <div> Check Mate</div>;
//             }
//         } else {
//             checked = <div></div>
//         }
//         return <div className="gridview">
//             { this.state.tiles.map((v, i) => v.map((m, j) => {
//                 if (this.props.pieces != null && this.props.pieces[i][j] != null) {
//                     return <Tile key={`${i}${j}` } i={i} j={j} tilestate={`${this.state.tiles[i][j]["state"]}${this.state.tiles[i][j]["color"]}`} onClick={this.onClick} color={m.color} chesspiece={`${this.props.pieces[i][j].type}${this.props.pieces[i][j].color}.svg`}/>
//                 }
//                 return <Tile key={`${i}${j}` }  i={i} j={j} tilestate={`${this.state.tiles[i][j]["state"]}${this.state.tiles[i][j]["color"]}`} onClick={this.onClick} color={m.color} />
//              })) }
//              {checked}
//         </div>;
//     }
  
// }