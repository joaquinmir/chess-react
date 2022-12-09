import {getXYPosition,getIndexPosition,setBoard,isWhite,loadPieces} from './Utils';

const knigthMovesX = [2, 1, -1, -2, -2, -1,  1,  2];
const knigthMovesY = [1, 2,  2,  1, -1, -2, -2, -1];
const bishopMovesY = [1,-1,1,-1];
const bishopMovesX = [-1,1,1,-1];
const rookMoves = [1,-1];
const kingMovesX = [0, 1, -1, 1, 0, -1, -1,  1];
const kingMovesY = [1, 0,  1,-1, -1, 0, -1, 1];


export default class Chess {
    constructor(fen){
        this.squares = setBoard(fen);
        [this.whitePieces,this.blackPieces] = loadPieces(this.squares); 
        this.whiteToPlay = true; 
        this.whiteKingInCheck = false;
        this.blackKingInCheck = false;
        this.wCastleQSide = true;
        this.wCastleKSide = true;
        this.bCastleQSide = true;
        this.bCastleKSide = true;
        this.end = false;
        this.pawnMovedTwoSquares = false;
        this.squareEnPassant = null;
        this.enPassantCounter = 0;
        this.enPassantDetected = false;
        this.winner = null;
        this.legalMoves = new Map();
        this.attacks = new Map();
        this.calculateLegalMoves();
        
    }

    move(from,to,castling = false){
        let piece = this.squares[from];
        let castle = false;
        let castleRook;
        let index;
        if(piece.toLowerCase() === "k"){
            if(this.whiteToPlay){
                if(to === 62){
                    castle = true;
                    castleRook = [63,61]
                }
                else if (to === 58){
                    castle = true;
                    castleRook = [56,59]
                }
                this.wCastleKSide = false;
                this.wCastleQSide = false;
            }
            else {
                if(to === 2){
                    castle = true;
                    castleRook = [0,3];
                } 
                else if(to === 6){
                    castle = true;
                    castleRook = [7,5];
                }
                this.bCastleKSide = false;
                this.bCastleQSide = false;
            }
        }
        else if (piece.toLowerCase() === "r" && !castling){
            if(this.whiteToPlay){
                if(from === 63 && this.wCastleKSide){
                    this.wCastleKSide = false;
                }
                else if (from === 56 && this.wCastleQSide){
                    this.wCastleQSide = false;
                }
            }
            else{
                if(from === 0 && this.bCastleQSide){
                    this.bCastleQSide = false;
                }
                else if (from === 7 && this.bCastleKSide){
                    this.bCastleKSide = false;
                }
            }
        }
        else if (piece.toLowerCase() === "p"){
            if(this.whiteToPlay){
                if(this.enPassantDetected && to === this.squareEnPassant){
                    this.squares[to + 8] = null;
                    index = this.blackPieces.indexOf(to+8);
                    this.blackPieces.splice(index, 1);
                }
                else if ((from - 16 ) === to){
                    this.pawnMovedTwoSquares = true;
                    this.squareEnPassant = from - 8;
                    this.enPassantCounter = 2;
                }
                else if(to < 8){
                    piece = "Q";
                }
            }
            else {
                if(this.enPassantDetected && to === this.squareEnPassant){
                    
                    this.squares[to - 8] = null;
                    index = this.whitePieces.indexOf(to-8);
                    this.whitePieces.splice(index, 1);
                }
                else if ((from + 16) === to){
                    this.pawnMovedTwoSquares = true;
                    this.squareEnPassant = from + 8;
                    this.enPassantCounter = 2;
                }
                else if(to > 55){
                    piece = "q";
                }
            } 
        }
        
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
        if(this.whiteToPlay) {
            this.whiteKingInCheck = false;
        }
        else {
            this.blackKingInCheck = false;
        }

        if(castle){
            
            this.move(castleRook[0],castleRook[1],true);
        }

        if(!castling){
            if(this.enPassantCounter){
                if(--this.enPassantCounter === 0){
                    this.enPassantDetected = false;
                    this.squareEnPassant = null;
                }
            }
            this.whiteToPlay = !this.whiteToPlay;
            this.attacks.clear();
            this.calculateAttacks();
            this.verifyCheck();
            this.legalMoves.clear();
            this.calculateLegalMoves();
            this.verifyMateAndStale();

        }
    
        
        
    }

    verifyCheck(){
        if(this.whiteToPlay){
            if(this.isAttacked(this.kingPosition(),this.attacks)){
           
                this.whiteKingInCheck = true;
            }
        }
        else if(this.isAttacked(this.kingPosition(),this.attacks)){
            this.blackKingInCheck = true;
        }
    }

    endGame(winner){
        this.winner = winner;
        
        this.end = true;
    }

    verifyMateAndStale() {
        const iterator = this.legalMoves.keys();
        for(let j = 0 ; j<this.legalMoves.size ; j++){
            if(this.legalMoves.get(iterator.next().value).length > 0){
                return;
            }
        }
        if(this.whiteToPlay){
            if(this.whiteKingInCheck){
                this.endGame("black");
            }
            else {
                this.endGame("draw");
            }
        }  
        else{
            if(this.blackKingInCheck){
                this.endGame("white");
            }
            else {
                this.endGame("draw");
            }
        }
        
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
            
            pieces = [...this.blackPieces];
        }
        else {
      
            pieces = [...this.whitePieces];
        }
  
        pieces.forEach(i => {
            const {x,y} = getXYPosition(i);
            
            switch (this.squares[i].toLowerCase()){
                case 'p': 
                    this.attacks.set(i,this.getPawnMoves(i,x,y,true));
                    break;

                case 'n':
                    this.attacks.set(i,this.getKnightMoves(x,y,true));
                    break;

                case 'b':
                    this.attacks.set(i,this.getBishopMoves(x,y,true));
                    break;

                case 'r':
                    this.attacks.set(i,this.getRookMoves(x,y,true));
                    break;
             
                
                case 'q':
                    this.attacks.set(i,this.getRookMoves(x,y,true).concat(
                    this.getBishopMoves(x,y,true)));
                    break;
                    
                case 'k':
                    return this.attacks.set(i,this.getKingMoves(x,y,true));
                    break;
            }
        })
        
    
    }


    kingPosition(){
        let pos;
        if(this.whiteToPlay){
            pos = this.squares.indexOf("K")
        }
        else {
            pos = this.squares.indexOf("k")
        }
        return pos;
    }

    canMakeThatMove(from,to){
        let piece = this.squares[from];
        let can = true;
        let index;
        let attacksSave = new Map(this.attacks);
        let squares = [...this.squares];
        let whitePieces = [...this.whitePieces];
        let blackPieces = [...this.blackPieces]; 
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
        if(this.isAttacked(this.kingPosition(),this.attacks)){
           
            can = false;
        }
        this.attacks = new Map(attacksSave);
        this.squares = [...squares];
        this.whitePieces = [...whitePieces];
        this.blackPieces = [...blackPieces];

        return can;

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
                    this.legalMoves.set(i,this.getKnightMoves(x,y,false));
                    break;

                case 'b':
                    this.legalMoves.set(i,this.getBishopMoves(x,y,false));
                    break;

                case 'r':
                    this.legalMoves.set(i,this.getRookMoves(x,y,false));
                    break;
            
                
                case 'q':
                    this.legalMoves.set(i,this.getRookMoves(x,y,false).concat(
                    this.getBishopMoves(x,y,false)));
                    break;
                    
                case 'k':
                    this.legalMoves.set(i,this.getKingMoves(x,y,false));
                    break;
            }
        })
        
    
           
    }

    getLegalMoves(i){
        if((this.whiteToPlay &&  this.whitePieces.includes(i)) || (!this.whiteToPlay &&  this.blackPieces.includes(i))){
      
            return(this.legalMoves.get(i));

        }
    }
    

    isAlly(square1,square2){
        if( isWhite(square1) && isWhite(square2)){
            return true;
        }
        else if (! isWhite(square1) && !isWhite(square2)){
            return true;
        }
        return false;
    }
    
    pawnHaventMove(i,y){
        if(isWhite(this.squares[i]) && y === 6){
            return true;
        }
        else if (!isWhite(this.squares[i]) && y === 1){
            return true;
        }

        return false;
    }

    checkForCastle(){
        let sides = [];
        if(this.whiteToPlay && !this.whiteKingInCheck){
            if(this.wCastleKSide){
                if(!this.squares[62] && !this.squares[61] && !this.isAttacked(62,this.attacks) 
                && !this.isAttacked(61,this.attacks)){
                    sides.push(62);
                } 
            }
            if (this.wCastleQSide){
                if(!this.squares[59] && !this.squares[58] && !this.squares[57] && !this.isAttacked(59,this.attacks)
                 && !this.isAttacked(58,this.attacks) && !this.isAttacked(57,this.attacks)){
                    sides.push(58);
                 }
            }
        }
        else if (!this.blackKingInCheck){

            if(this.bCastleKSide){
                if(!this.squares[5] && !this.squares[6] && !this.isAttacked(5,this.attacks) 
                && !this.isAttacked(6,this.attacks)){
                    sides.push(6);
                }
            }
            if (this.bCastleQSide){
                if(!this.squares[1] && !this.squares[2] && !this.squares[3] && !this.isAttacked(1,this.attacks)
                 && !this.isAttacked(2,this.attacks) && !this.isAttacked(3,this.attacks)){
                    sides.push(2);
                 }
            }
        }

        return sides;
    }

    getKingMoves(x,y,onlyAttack){
        let moves = [];
        let x0,y0,i0;
        let i = getIndexPosition(x,y);
        
        for (let j = 0; j < 8; j++) {
 
            // Position of knight after move
            x0 = x + kingMovesX[j];
            y0 = y + kingMovesY[j];
            i0 = getIndexPosition(x0,y0);

            // count valid moves
            if (x0 >= 0 && y0 >= 0 && x0 < 8 && y0 < 8){
                if(onlyAttack){
                    moves.push(i0);
                }
                else {
                    if(!this.squares[i0] || !this.isAlly(this.squares[i],this.squares[i0])){
                        if(!this.isAttacked(i0,this.attacks)){
                            moves.push(getIndexPosition(x0,y0));
                        }
                    }
                }
                
            }

            if(!onlyAttack){
                let sides = this.checkForCastle();
                sides.forEach((side) => {
                    
                    moves.push(side);
                })
            }
                
        }
        return moves;
    }

    

    getPawnMoves(i,x,y,onlyAttack) {
    
        let moves = [];
        let take1,take2;
        let aux;
        if(isWhite(this.squares[i])){
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
            if(this.canMakeThatMove(i,(i+(8*aux)))){
                moves.push(i+(8*aux));
            }
            
            if(this.pawnHaventMove(i,y) && !this.squares[i+(16*aux)]){ //if first move and y+2 is empty
                if(this.canMakeThatMove(i,(i+(16*aux)))){
                    moves.push(i+(16*aux));
                }
               
            }
        }

        
        if(take1){
            if(onlyAttack){
                moves.push(take1);
            }
            else if (this.squares[take1]){
                if(!this.isAlly(this.squares[i],this.squares[take1])){
                    if(this.canMakeThatMove(i,take1)){
                        moves.push(take1);
                    }
                  
                }
            }
            else if (this.squareEnPassant && this.squareEnPassant === take1){
                if(this.canMakeThatMove(i,take1)){
                    moves.push(take1);
                    this.enPassantDetected = true;
                }
            }
            
        }
        if(take2){
            if(onlyAttack){
                moves.push(take2);
            }
            else if (this.squares[take2]){
                if(!this.isAlly(this.squares[i],this.squares[take2])){
                    if(this. canMakeThatMove(i,take2)){
                        moves.push(take2);
                    }
                  
                }
            }
            else if (this.squareEnPassant && this.squareEnPassant === take2){
                if(this.canMakeThatMove(i,take2)){
                    moves.push(take2);
                    this.enPassantDetected = true;
                }
            }
            
        }

        return moves;
    }


    getRookMoves(x,y,onlyAttack){
        let moves = [];
        let x0;
        let y0 = y;
        let i0;
        let i = getIndexPosition(x,y);
        for (let j = 0; j < 2; j++) {
            
            x0 = x + rookMoves[j];
            i0 = getIndexPosition(x0,y0);
            while(x0>=0 && x0<8 && y0>=0 && y0<8){
                if(this.squares[i0]){
                  
                    if(onlyAttack){
                        if(!this.isEnemyKing(this.squares[i],this.squares[i0])){
                            break;
                        }
                    }
                    else {
                        break;
                    }
                }
                if(onlyAttack){
                    moves.push(i0);
                }
                else if(this.canMakeThatMove(i,i0)){
                    moves.push(i0);
                }
               
                x0 = x0 + rookMoves[j];
                i0 = getIndexPosition(x0,y0);
            }
            
            if(x0>=0 && x0<8 && y0>=0 && y0<8){
                if(onlyAttack){
                    moves.push(i0)
                }
                else if(!this.isAlly(this.squares[i],this.squares[i0])){
                    if(this.canMakeThatMove(i,i0)){
                        moves.push(i0);
                    }
                    
                }
            }
        }
        x0 = x;
        for (let k = 0; k < 2; k++) {
            y0 = y + rookMoves[k];
            i0 = getIndexPosition(x0,y0);
            while(x0>=0 && x0<8 && y0>=0 && y0<8){
                if(this.squares[i0]){
                    if(onlyAttack){
                        if(!this.isEnemyKing(this.squares[i],this.squares[i0])){
                            break;
                        }
                    }
                    else {
                        break;
                    }
                }
                if(onlyAttack){
                    moves.push(i0);
                }
                else if(this.canMakeThatMove(i,i0)){
                    moves.push(i0);
                }
                y0 = y0 + rookMoves[k];
                i0 = getIndexPosition(x0,y0);
            }
            if(x0>=0 && x0<8 && y0>=0 && y0<8){
                if(onlyAttack){
                    moves.push(i0)
                }
                else if(!this.isAlly(this.squares[i],this.squares[i0])){
                    if(this.canMakeThatMove(i,i0)){
                        moves.push(i0);
                    }
                    
                }
            }
        }
        return moves;
    }

    isEnemyKing(from,to){
        
        if(to.toLowerCase() === "k"){
            if(!this.isAlly(from,to)){
              
                return true;
            }
        }

        return false;
    }

    getBishopMoves(x,y,onlyAttack){
        let moves = [];
        let i0;
        let x0;
        let y0;
        let i = getIndexPosition(x,y); 
        for (let j = 0; j < 4; j++) {
            x0 = x + bishopMovesX[j];
            y0 = y + bishopMovesY[j];
            i0 = getIndexPosition(x0,y0);
            while(x0>=0 && x0<8 && y0>=0 && y0<8){
                if(this.squares[i0]){
                    if(onlyAttack){
                        if(!this.isEnemyKing(this.squares[i],this.squares[i0])){
                
                            break;
                        }
                    }
                    else {
                        break;
                    }
                }
                if(onlyAttack){
                    moves.push(i0);
                }
                else if(this.canMakeThatMove(i,i0)){
                    moves.push(i0);
                }
                
                x0 = x0 + bishopMovesX[j];
                y0 = y0 + bishopMovesY[j];
                i0 = getIndexPosition(x0,y0);
            }
            if(x0>=0 && x0<8 && y0>=0 && y0<8){
                if(onlyAttack){
                    moves.push(i0)
                }
                else if(!this.isAlly(this.squares[i],this.squares[i0])){
                    if(this.canMakeThatMove(i,i0)){
                        moves.push(i0);
                    }
                    
                }
            }
        }
        
        return moves;

    }

    isAttacked(i,attacks){  
        const iterator = attacks.keys();
        for(let j = 0 ; j<attacks.size ; j++){
            if(attacks.get(iterator.next().value).includes(i)){
                return true;
            }
            
        }
        
        return false;
    }

    getKnightMoves(x,y,onlyAttack){
        let moves = [];
        let x0,y0,i0;
        let i = getIndexPosition(x,y);
        
        for (let j = 0; j < 8; j++) {
 
            // Position of knight after move
            x0 = x + knigthMovesX[j];
            y0 = y + knigthMovesY[j];
            i0 = getIndexPosition(x0,y0);

            // count valid moves
            if (x0 >= 0 && y0 >= 0 && x0 < 8 && y0 < 8){
                if(onlyAttack){
                    moves.push(i0);
                }
                else if(this.canMakeThatMove(i,i0) && (!this.isAlly(this.squares[i],this.squares[i0]) || !this.squares[i0])){
                    moves.push(i0);
                }   
               
            }
                
        }
        return moves;
    }
}