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
        this.whiteToPlay = true; 
        this.whiteKingInCheck = false;
        this.blackKingInCheck = false;
        this.legalMoves = new Map();
        this.attacks = new Map();
        this.calculateLegalMoves();
        
    }

    move(from,to){
        let piece = this.squares[from];
        let index;
        this.squares[from] = null;
        if(this.squares[to]){
        
            
            if(this.whiteToPlay){
                index = this.blackPieces.indexOf(to);
                this.blackPieces.splice(index, 1);
            }
            else {
                index = this.whitePieces.indexOf(to);
                this.whitePieces.splice(index, 1);
            }
        }
        this.squares[to] = piece;
        if(this.whiteToPlay){
            index = this.whitePieces.indexOf(from);
            this.whitePieces[index] = to;
        }
        else {
            index = this.blackPieces.indexOf(from);
            this.blackPieces[index] = to;
        }
        this.attacks.clear();
        this.calculateAttacks();
        this.whiteToPlay = !this.whiteToPlay;
        this.legalMoves.clear();
        this.calculateLegalMoves();
        console.log(this.attacks)
        
    }
  
    changeTurn(){
        this.whiteToPlay = !this.whiteToPlay;
        this.calculateLegalMoves();
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

    calculateAttacks(){
        let pieces = [];
     
        if(this.whiteToPlay){
            
            pieces = [...this.whitePieces];
        }
        else {
      
            pieces = [...this.blackPieces];
        }

        pieces.forEach(i => {
            const {x,y} = getXYPosition(i);
            
            switch (this.squares[i].toLowerCase()){
                case 'p': 
                    this.attacks.set(i,this.getPawnMoves(i,x,y,true));
                    break;

                case 'n':
                    this.attacks.set(i,this.getKnightMoves(x,y));
                    break;

                case 'b':
                    this.attacks.set(i,this.getBishopMoves(x,y));
                    break;

                case 'r':
                    this.attacks.set(i,this.getRookMoves(x,y));
                    break;
            
                
                case 'q':
                    this.attacks.set(i,this.getRookMoves(x,y).concat(
                    this.getBishopMoves(x,y)));
                    break;
                    /*
                case 'k':
                    return getKingMoves(x,y);
                    break;*/
            }
        })
        
    
    }

    calculateLegalMoves() {
        let pieces = [];
     
        if(this.whiteToPlay){
            
            pieces = [...this.whitePieces];
        }
        else {
      
            pieces = [...this.blackPieces];
        }

        pieces.forEach(i => {
            const {x,y} = getXYPosition(i);
            
            switch (this.squares[i].toLowerCase()){
                case 'p': 
                    this.legalMoves.set(i,this.getPawnMoves(i,x,y,false));
                    break;

                case 'n':
                    this.legalMoves.set(i,this.getKnightMoves(x,y));
                    break;

                case 'b':
                    this.legalMoves.set(i,this.getBishopMoves(x,y));
                    break;

                case 'r':
                    this.legalMoves.set(i,this.getRookMoves(x,y));
                    break;
            
                
                case 'q':
                    this.legalMoves.set(i,this.getRookMoves(x,y).concat(
                    this.getBishopMoves(x,y)));
                    break;
                    /*
                case 'k':
                    return getKingMoves(x,y);
                    break;*/
            }
        })
        
    
           
    }

    getLegalMoves(i){
        if((this.whiteToPlay &&  this.whitePieces.includes(i)) || (!this.whiteToPlay &&  this.blackPieces.includes(i))){
      
            return(this.legalMoves.get(i));

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

    getPawnMoves(i,x,y,onlyAttack) {
    
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

        if(!this.squares[i+(8*aux)] && !onlyAttack){ //y+1 square is empty
            moves.push(i+(8*aux));
            if(this.pawnHaventMove(y) && !this.squares[i+(16*aux)]){ //if first move and y+2 is empty
                moves.push(i+(16*aux));
            }
        }

        
        if(take1){
            if(onlyAttack){
                moves.push(take1);
            }
            else if (this.squares[take1]){
                if(!this.isAlly(this.squares[take1])){
                
                    moves.push(take1);
                }
            }
            
        }
        if(take2){
            if(onlyAttack){
                moves.push(take2);
            }
            else if (this.squares[take2]){
                if(!this.isAlly(this.squares[take2])){
                
                    moves.push(take2);
                }
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