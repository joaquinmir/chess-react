import React,{useState,useEffect} from 'react';
import '../App.css';

function EndGame(props) {

    const handleClick = () => {
        window.location.reload(false);
    }

    return (props.trigger) ? (
        <div className = "popup">
            <div className = "popup-inner">
                <h3 className = "center">{props.message}</h3>
                <button onClick={() => handleClick()} className = "close-btn">Aceptar</button>
            </div>
        </div>
    ) : "";

}

export default EndGame;