import {getXYPosition,getIndexPosition,setBoard,isWhite,loadPieces} from './Utils';

const knigthMovesX = [2, 1, -1, -2, -2, -1,  1,  2];
const knigthMovesY = [1, 2,  2,  1, -1, -2, -2, -1];
const bishopMovesY = [1,-1,1,-1];
const bishopMovesX = [-1,1,1,-1];
const rookMoves = [1,-1];


export default class Chess {
    constructor(fen){
        this.squares = setBoard(fen);
        [this.whitePieces,this.blackPieces] = loadPieces(this.squares); 
        this.whiteKingInCheck = false;
        this.blackKingInCheck = false;
        
        this.whiteToPlay = true; 
    }

  

    validateTurn(i){
        
        if(this.squares[i]){
            if(isWhite(this.squares[i]) && this.whiteToPlay){
                return true;
            }
            else if(!isWhite(this.squares[i]) && !this.whiteToPlay){
                return true;
            }

            return false;
        }

        return false;
    }

    newSelection(active, selected){
        if(selected){
            if(active !== selected){
                return(this.validateTurn(selected));
            }
        }
        

        return false;
    }

    getLegalMoves(i) {
        const {x,y} = getXYPosition(i);
        switch (this.squares[i].toLowerCase()){
            case 'p': 
                return this.getPawnMoves(i,x,y);
                break;

            case 'n':
                return this.getKnightMoves(x,y);
                break;

            case 'b':
                return this.getBishopMoves(x,y);
                break;

            case 'r':
                return this.getRookMoves(x,y);
                break;
           
            
            case 'q':
                return this.getRookMoves(x,y).concat(this.getBishopMoves(x,y));
                break;
                 /*
            case 'k':
                return getKingMoves(x,y);
                break;*/
        }
    }

    isAlly(square){
        if(this.whiteToPlay && isWhite(square)){
            return true;
        }
        else if (!this.whiteToPlay && !isWhite(square)){
            return true;
        }
        return false;
    }
    
    pawnHaventMove(y){
        if(this.whiteToPlay && y === 6){
            return true;
        }
        else if (!this.whiteToPlay && y === 1){
            return true;
        }

        return false;
    }

    getPawnMoves(i,x,y) {
        let moves = [];
        let take1,take2;
        let aux;
        if(this.whiteToPlay){
            aux = -1;
        }
        else {
            aux = 1;
        }
                                                              
        if(x > 0) {
            take1 = getIndexPosition(x-1,y+(aux));
        }
    
        if(x<7){
            take2 = getIndexPosition(x+1,y+(aux));
        }

        if(!this.squares[i+(8*aux)]){ //y+1 square is empty
            moves.push(i+(8*aux));
            if(this.pawnHaventMove(y) && !this.squares[i+(16*aux)]){ //if first move and y+2 is empty
                moves.push(i+(16*aux));
            }
        }

        if(take1 && this.squares[take1]){
            if(!this.isAlly(this.squares[take1])){
                
                moves.push(take1);
            }
        }
        if(take2 && this.squares[take2]){
            if(!this.isAlly(this.squares[take2])){
                
                moves.push(take2);
            }
        }
    
        return moves;
    }

    getRookMoves(x,y){
        let moves = [];
        let x0;
        let y0 = y;
        let i ;
        for (let j = 0; j < 2; j++) {
            
            x0 = x + rookMoves[j];
            i = getIndexPosition(x0,y0);
            while(!this.squares[i] && x0>=0 && x0<8 && y0>=0 && y0<8){
                moves.push(i);
                x0 = x0 + rookMoves[j];
                i = getIndexPosition(x0,y0);
            }
            
            if(!this.isAlly(this.squares[i]) && x0>=0 && x0<8 && y0>=0 && y0<8){
                moves.push(i);
            }
        }
        x0 = x;
        for (let k = 0; k < 2; k++) {
            y0 = y + rookMoves[k];
            i = getIndexPosition(x0,y0);
            while(!this.squares[i] && x0>=0 && x0<8 && y0>=0 && y0<8){
                moves.push(i);
                y0 = y0 + rookMoves[k];
                i = getIndexPosition(x0,y0);
            }
            if(!this.isAlly(this.squares[i]) && x0>=0 && x0<8 && y0>=0 && y0<8){
                moves.push(i);
            }
        }
        return moves;
    }

    getBishopMoves(x,y){
        let moves = [];
        let x0;
        let y0;
        let i ;
        for (let j = 0; j < 4; j++) {
            x0 = x + bishopMovesX[j];
            y0 = y + bishopMovesY[j];
            i = getIndexPosition(x0,y0);
            while(!this.squares[i] && x0>=0 && x0<8 && y0>=0 && y0<8){
                moves.push(i);
                x0 = x0 + bishopMovesX[j];
                y0 = y0 + bishopMovesY[j];
                i = getIndexPosition(x0,y0);
            }
            if(!this.isAlly(this.squares[i]) && x0>=0 && x0<8 && y0>=0 && y0<8){
                moves.push(i);
            }
        }


        return moves;

    }

    getKnightMoves(x,y){
        let moves = [];
        let x0,y0,i;
        
        for (let j = 0; j < 8; j++) {
 
            // Position of knight after move
            x0 = x + knigthMovesX[j];
            y0 = y + knigthMovesY[j];
            i = getIndexPosition(x0,y0);

            // count valid moves
            if (x0 >= 0 && y0 >= 0 && x0 < 8 && y0 < 8 && (!this.isAlly(this.squares[i]) || !this.squares[i])){
                moves.push(getIndexPosition(x0,y0));
            }
                
        }
        return moves;
    }
}