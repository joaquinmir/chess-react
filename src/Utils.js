const FENtoArray = (F) => {
    let squares = [];
    F = F.replaceAll("/","");
    F = F.split("");
    F.forEach(s => {
        if(isNaN(s)){
            squares.push(s);
        }
        else{
            for(let i = 0;i<parseInt(s);i++){
                squares.push(0);
            }
        }
    });
    return squares;
}

export const toChessFormat = (squares) => {
    return squares.map(square => {
        return square.value;
    })
}


export const setBoard = (FEN) => {
    FEN = FENtoArray(FEN);
    let squares = [];
   
    FEN.forEach(FENitem => {
        if(FENitem  === 0){
            squares.push(null);
        }
        else{
            squares.push(FENitem);
        }
    })
    
             
    return squares;
}

export const loadPieces = (squares) => {
    let blackPieces = [];
    let whitePieces = [];
    squares.forEach((square,i) => {
        if(square){
            
            if(isWhite(square)){
                whitePieces.push(i);
            }
            else{
                blackPieces.push(i);
            }
        }
    })

    return [whitePieces,blackPieces];
}

export const getXYPosition = (i) => {
    const x = i % 8 ;
    const y = Math.abs(Math.floor(i / 8))
    return { x, y }
}

export const isWhite = (piece) => {

    if(piece){

        return(piece === piece.toUpperCase());
    }
    else{
        return false;
    }
   
}

export const getIndexPosition = (x,y) => {
    return (x + y*8); 
}

export const getColor = (i) => {
    const {x,y} = getXYPosition(i);
    return ((((x+y) % 2) === 0) ? "white" : "black")
}



