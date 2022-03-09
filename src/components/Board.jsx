import React,{useState,useEffect} from 'react';
import {getIndexPosition,getXYPosition,setBoard,getColor,toChessFormat,isWhite} from '../Utils';
import '../App.css';
import Square from "./Square"
import Chess from "../Chess"


let FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
let chess = new Chess(FEN);
let activeSquare = null;



export default () => {
    const[squares,setSquares] = useState([]);
    
    useEffect(() => { 
        let item;
        let squaresAux = [];
        setBoard(FEN).forEach((square,i) => {
            item = {
                value: square,
                pos: getXYPosition(i),
                color: getColor(i)        
            }
            squaresAux.push(item);
        })
        setSquares(squaresAux);
    },[])

    const pieceMove = (active,i) => {

        let piece = squares[active].value;
        let update = squares.map((square,j) => {
            if(active === j){
                square.value = null;
                
            }
            else if (j === i){
                square.value = piece;
                
            }
            square.color = getColor(j);
            return square;
        });

        chess.squares = toChessFormat(update);
        chess.whiteToPlay = !chess.whiteToPlay;
        activeSquare = null;
        return update;
    }

    const renderLegalMoves = (i) => {
        const moves = chess.getLegalMoves(i);
                
        let update = squares.map((square,i) => {
            if(moves.includes(i)){
                square.color = "active";
            }
            else{
                square.color = getColor(i);
            }
            return square;
        })

        return update;
    }

    const handleClick = (x,y) => {
        let i = getIndexPosition(x,y);
        if(activeSquare){  //si hay cuadrado activo
            if(chess.newSelection(activeSquare,i)){ //me fijo si la seleccion es nueva y valida
                setSquares(renderLegalMoves(i));
                activeSquare = i;
            }
            else{ // si no me fijo si lo puedo mover a ese lugar
                const moves = chess.getLegalMoves(activeSquare);
                if(moves.includes(i)){
                    let update = pieceMove(activeSquare,i);
                    setSquares(update);
                }
            }
        }
        else{ //si no hay cuadrado activo lo selecciono a este como activo
            if(squares[i].value && chess.validateTurn(i)){
                activeSquare = i;
                setSquares(renderLegalMoves(i));
            }

        }
        
       
        
        

    }

    return(
        <div className="board">
            {squares.map((square) => (  
                <Square handleClick = {handleClick} isWhite={isWhite(square.value)} pos={square.pos} color={square.color} value={square.value} />
            ))}
        </div>
    );
}
