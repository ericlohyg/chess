import React from 'react'
import Tile from './Tile'
const boardSize = 8;

export default class Board extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            tiles: [],
            currSelected: [],
            pieces: null,
            moveable: new Array(8).fill(false).map(()=>new Array(8).fill(false)),
            checked: false,
            oppChecked: false,
            opponentThreaten: new Array(8).fill(false).map(()=>new Array(8).fill(false)),
        };

        for(let i=0;i<boardSize;i++) {
            var row = [];
            for(let j=0;j<boardSize;j++) {
                if ( i % 2 === 0 ) {
                    if (j % 2 === 0) {
                        row.push({
                            color: "dark", 
                            state: "unselected"
                        })  
                    } else {
                        row.push({
                            color: "light", 
                            state: "unselected"
                        }) 
                    };
                } else {
                    if (j % 2 === 0) {
                        row.push({
                            color: "light", 
                            state: "unselected"
                        }) 
                    } else {
                        row.push({
                            color: "dark", 
                            state: "unselected"
                        })                       
                    };                   
                }
            };
            this.state.tiles.push(row);
        }
        this.onClick = this.onClick.bind(this);
        this.equals = this.equals.bind(this);

    }

    onClick(e, i, j) {
        e.preventDefault();
        
        console.log(`pressed: ${i} ${j}`);

        var tiles = this.state.tiles;
        var moveable = this.state.moveable;
        // this.state.currSelected refers to the previous selection indexes before this click
        var prevSelected = this.state.currSelected;
        
        if (tiles[i][j].state === "selected") {
            for (let i=0;i<boardSize; i++) {
                for (let j=0;j<boardSize; j++) {
                    tiles[i][j].state = "unselected";
               }
            }
            var currSelected = [];
            this.setState({
                tiles: tiles,
                currSelected: currSelected
            });
            return;
        }

        // if previous piece selected is the player's and the new place is a valid spot, send move to server
        if (prevSelected.length !== 0 && moveable[i][j]) {
            var prevPiece = this.props.pieces[prevSelected[0]][prevSelected[1]];
            if (prevPiece !== null && ((prevPiece.color === 'l' && this.props.player === 'white') || (prevPiece.color === 'd' && this.props.player === 'black'))) {
                var msg = {};

                msg.type = "move";
                msg.player = this.props.player;
                msg.move = `${prevSelected[0]}${prevSelected[1]}${i}${j}`
                this.props.ws.send(JSON.stringify(msg));

                // once moved, unselect everything 
                for (let i=0;i<boardSize; i++) {
                    for (let j=0;j<boardSize; j++) {
                        tiles[i][j].state = "unselected";
                        moveable[i][j] = false;
                   }
                }

                this.setState({
                    tiles: tiles,
                    moveable: moveable
                })
                return;
            }
        }
        // unselect everything first
        for (let i=0;i<boardSize; i++) {
            for (let j=0;j<boardSize; j++) {
                tiles[i][j].state = "unselected";
           }
        }

        tiles[i][j].state = "selected";
        this.updateMovable(tiles, i, j);

        currSelected = [];
        currSelected.push(i);
        currSelected.push(j);
        this.setState({
            tiles: tiles,
            currSelected: currSelected
        });
    }

    // TODO
    updateMovable(tiles, i, j) {
        var moveable = this.state.moveable;
        var piece = this.props.pieces[i][j];
        if (piece === null) {
            return;
        }

        if (this.pColor(piece.color) !== this.props.player) {
            // player selected opponent's piece, ignore and return
            return;
        } 
        if (piece.type === 'r' || piece.type === 'q') {
            // up
            var y = i-1;
            while (y >= 0 && (this.props.pieces[y][j] === null || this.isOpponentPiece(this.props.pieces[y][j].color, this.props.player))) {
                moveable[y][j] = true;
                tiles[y][j].state = "moveable";
                if (this.props.pieces[y][j] !== null) {
                    break;
                }
                y = y - 1;
            }
            // down
            y = i+1
            while (y <= 7 && (this.props.pieces[y][j] === null || this.isOpponentPiece(this.props.pieces[y][j].color, this.props.player))) {
                moveable[y][j] = true;
                tiles[y][j].state = "moveable";
                if (this.props.pieces[y][j] !== null) {
                    break;
                };
                y = y + 1;
            };
            // left
            y = j-1
            while (y >= 0 && (this.props.pieces[i][y] === null || this.isOpponentPiece(this.props.pieces[i][y].color, this.props.player))) {
                moveable[i][y] = true;
                tiles[i][y].state = "moveable";
                if (this.props.pieces[i][y] !== null) {
                    break;
                };
                y = y - 1;
            };
            // right
            y = j+1
            while (y <= 7 && (this.props.pieces[i][y] === null || this.isOpponentPiece(this.props.pieces[i][y].color, this.props.player))) {
                moveable[i][y] = true;
                tiles[i][y].state = "moveable";
                if (this.props.pieces[i][y] !== null) {
                    break;
                };
                y = y + 1;
            };
        };
        if (piece.type === 'b' || piece.type === 'q') {
            // top right
            y = i - 1;
            var x = j + 1;
            while (y >= 0 && x <= 7 && (this.props.pieces[y][x] === null || this.isOpponentPiece(this.props.pieces[y][x].color, this.props.player))) {
                moveable[y][x] = true;
                tiles[y][x].state = "moveable";
                if (this.props.pieces[y][x] !== null) {
                    break;
                };
                y = y - 1;
                x = x + 1;
            };
            // top left
            y = i - 1;
            x = j - 1;
            while (y >= 0 && x >= 0 && (this.props.pieces[y][x] === null || this.isOpponentPiece(this.props.pieces[y][x].color, this.props.player))) {
                moveable[y][x] = true;
                tiles[y][x].state = "moveable";
                if (this.props.pieces[y][x] !== null) {
                    break;
                };
                y = y - 1;
                x = x - 1;
            }
            // bottom left
            y = i + 1;
            x = j - 1;
            while (y <= 7 && x >= 0 && (this.props.pieces[y][x] === null || this.isOpponentPiece(this.props.pieces[y][x].color, this.props.player))) {
                moveable[y][x] = true;
                tiles[y][x].state = "moveable";
                if (this.props.pieces[y][x] !== null) {
                    break;
                };
                y = y + 1;
                x = x - 1;
            };
            // bottom right
            y = i + 1;
            x = j + 1;
            while (y <= 7 && x <= 7 && (this.props.pieces[y][x] === null || this.isOpponentPiece(this.props.pieces[y][x].color, this.props.player))) {
                moveable[y][x] = true;
                tiles[y][x].state = "moveable";
                if (this.props.pieces[y][x] !== null) {
                    break;
                };
                y = y + 1;
                x = x + 1;
            };
        };

        if (piece.type === 'n') {
            var toCheck = [[i-1, j-2], [i-2, j-1], [i-2, j+1], [i-1, j+2], [i+2, j-1], [i+1, j-2], [i+1, j+2], [i+2, j+1]]

            for (let h=0;h<toCheck.length;h++) {
                y = toCheck[h][0];
                x = toCheck[h][1];
                if (this.inRange(x, y) && (this.props.pieces[y][x] === null || this.isOpponentPiece(this.props.pieces[y][x].color, this.props.player))) {
                    moveable[y][x] = true;
                    tiles[y][x].state = "moveable";
                };
            };
        };

        if (piece.type === 'p') {
            // check sides for enemies
            var left = j - 1;
            var right = j + 1;
            if (left >= 0 && (this.props.pieces[i-1][left] !== null && this.isOpponentPiece(this.props.pieces[i-1][left].color, this.props.player))) {
                moveable[i-1][left] = true;
                tiles[i-1][left].state = "moveable";
            }
            if (right <= 7 && (this.props.pieces[i-1][right] !== null && this.isOpponentPiece(this.props.pieces[i-1][right].color, this.props.player))) {
                moveable[i-1][right] = true;
                tiles[i-1][right].state = "moveable";
            }
            var up = i - 1;
            if (up >= 0 && (this.props.pieces[up][j] === null)) {
                moveable[up][j] = true;
                tiles[up][j].state = "moveable";
                // if pawn is at original position, can move one more step
                if (i === 6) {
                    up = up - 1;
                    if (up >= 0 && (this.props.pieces[up][j] === null)) {
                        moveable[up][j] = true;
                        tiles[up][j].state = "moveable";
                    };
                };
            };
        };

        if (piece.type === 'k') {
            toCheck = [[i-1, j], [i-1, j-1], [i-1, j+1], [i, j+1], [i+1, j-1], [i+1, j], [i, j+1], [i+1, j+1]];

            for (let k=0;k<toCheck.length;k++) {
                y = toCheck[k][0];
                x = toCheck[k][1];
                if (y >= 0 && y <= 7 && x >= 0 && x <= 7 && !this.state.opponentThreaten[y][x] && (this.props.pieces[y][x] === null || this.isOpponentPiece(this.props.pieces[y][x].color, this.props.player))) {
                    moveable[y][x] = true;
                    tiles[y][x].state = "moveable";
                }
            }
        };

    };

    componentDidUpdate(prevProps) {

        if (this.equals(this.props.pieces, prevProps.pieces)) {
            return;
        }

        var playerIsChecked = false;
        var oppChecked = false;
        var opponentThreaten = new Array(8).fill(false).map(()=>new Array(8).fill(false));
        var pieces = this.props.pieces;
        var tiles = this.state.tiles;

        // TODO: REMOVE THIS WHEN DONE
        // unselect everything first
        for (let i=0;i<boardSize; i++) {
            for (let j=0;j<boardSize; j++) {
                tiles[i][j].state = "unselected";
            }
        }
        var update = function(ownPiece, q, w, e, r) {
            if (pieces[e][r] !== null) {
                if (pieces[q][w].color !== pieces[e][r].color) {
                    if (ownPiece) {
                        // for your own piece, all you have to check is if you check the opponent
                        if (pieces[e][r].type === 'k') {
                            oppChecked = true;
                        }
                    } else {
                        if (pieces[e][r].type === 'k') {
                            playerIsChecked = true;
                            opponentThreaten[e][r] = true;
                            // REMOVE THIS ONCE DONE 
                            tiles[e][r].state = "opponentthreaten";
                        }
                    }
                }
                return true;
            }

            if (!ownPiece) {
                opponentThreaten[e][r] = true;
                tiles[e][r].state = "opponentthreaten";
            }

            return false;
        }         
        for (let i=0;i<8;i++) {
            for (let j=0;j<8;j++) {
                if (pieces[i][j] === null) {
                    continue;
                }
                var ownPiece = !this.isOpponentPiece(this.props.pieces[i][j].color, this.props.player);

                if (pieces[i][j].type === 'r' || pieces[i][j].type === 'q') {
                    // up
                    var y = i-1;
                    var done = false;
                    while (y >= 0 && !done) {
                        done = update(ownPiece, i, j, y, j);
                        y = y - 1;
                    };
                    // down
                    y = i + 1;
                    done = false;
                    while(y <= 7 && !done) {
                        done = update(ownPiece, i, j, y, j);
                        y = y + 1;
                    };
                    // left 
                    y = j - 1;
                    done = false;
                    while(y >= 0 && !done) {
                        done = update(ownPiece, i, j, i, y);
                        y = y - 1;
                    };
                    // right
                    y = j + 1;
                    done = false;
                    while(y <= 7 && !done) {
                        done = update(ownPiece, i, j, i, y);
                        y = y + 1;
                    };
                };

                if (pieces[i][j].type === 'b' || pieces[i][j].type === 'q') {
                    // diagonally
                    var directions = [[-1,-1], [-1, 1], [1, -1], [1, 1]];
                    
                    for (let k=0; k<directions.length;k++) {
                        y = directions[k][0] + i;
                        var x = directions[k][1] + j;
                        done = false;
                        while (y >= 0 && y <= 7 && x >= 0 && x <= 7 && !done) {
                            done = update(ownPiece, i, j, y, x);
                            y = y + directions[k][0];
                            x = x + directions[k][1];
                        };
                    };
                };
                
                if (pieces[i][j].type === 'n') {
                    var toCheck = [[i-1, j-2], [i-2, j-1], [i-2, j+1], [i-1, j+2], [i+2, j-1], [i+1, j-2], [i+1, j+2], [i+2, j+1]];
                    for (let k=0;k<toCheck.length;k++) {
                        y = toCheck[k][0];
                        x = toCheck[k][1];

                        if (y >= 0 && y <= 7 && x >= 0 && x <= 7) {
                            update(ownPiece, i, j, y, x);
                        };                       
                    };                    
                };

                if (pieces[i][j].type === 'p' && i !== 0) {
                    if (j-1 >= 0) {
                        update(ownPiece, i, j, i+1, j-1);
                    }
                    if (j+1 <= 7) {
                        update(ownPiece, i, j, i+1, j+1);
                    }
                }

                if (pieces[i][j].type === 'k') {
                    toCheck = [[i-1, j-1], [i-1, j-1], [i-1, j+1], [i-1, j+1], [i+1, j-1], [i+1, j-1], [i+1, j+1], [i+1, j+1]];
                    for (let k=0;k<toCheck.length;k++) {
                        y = toCheck[k][0];
                        x = toCheck[k][1];

                        if (y >= 0 && y <= 7 && x >= 0 && x <= 7) {
                            update(ownPiece, i, j, y, x);
                        };                       
                    };                     
                }
            };                    
        };

        this.setState({
            tiles: tiles,
            oppChecked: oppChecked,
            checked: playerIsChecked,
            opponentThreaten: opponentThreaten,
        })
    }

    equals(pieces, pieces2) {
        for (let i=0;i<8;i++) {
            for (let j=0;j<8;j++) {
                if (pieces[i][j] === null) {
                    if (pieces2[i][j] !== null) {
                        return false;
                    }
                }
                if (pieces2[i][j] === null) {
                    if (pieces[i][j] !== null) {
                        return false;
                    }
                }
                if (pieces[i][j] !== null && pieces2[i][j] !== null && (pieces2[i][j].color !== pieces[i][j].color || pieces2[i][j].type !== pieces[i][j].type)) {
                    return false;
                }
            }
        }
        return true;
    }

    pColor(p) {
        if (p === 'l') {
            return "white";
        }
        if (p === 'd') {
            return "black";
        }

        return "fail";
    }

    isOpponentPiece(p, d) {
        if ((p === 'l' && d === 'black') || (p === 'd' && d === 'white')) {
            return true;
        }
        return false;
    }

    inRange(i, j) {
        if (i < 0 || i > 7 || j < 0 || j > 7) {
            return false;
        }
        return true;
    }

    
    render() {
        if (this.state.oppChecked || this.state.checked) {
            var checked = <div> Checked </div>;
        } else {
            checked = <div></div>
        }
        return <div className="gridview">
            { this.state.tiles.map((v, i) => v.map((m, j) => {
                if (this.props.pieces != null && this.props.pieces[i][j] != null) {
                    return <Tile key={`${i}${j}` } i={i} j={j} tilestate={`${this.state.tiles[i][j]["state"]}${this.state.tiles[i][j]["color"]}`} onClick={this.onClick} color={m.color} chesspiece={`${this.props.pieces[i][j].type}${this.props.pieces[i][j].color}.svg`}/>
                }
                return <Tile key={`${i}${j}` }  i={i} j={j} tilestate={`${this.state.tiles[i][j]["state"]}${this.state.tiles[i][j]["color"]}`} onClick={this.onClick} color={m.color} />
             })) }
             {checked}
        </div>;
    }
  
}