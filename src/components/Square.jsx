import React,{useState} from 'react';



export default (props) => {
    const value = props.value;
    const color = props.color;
    const isWhite = props.isWhite;
    let img;
    const {x,y} = props.pos;

    if(value){
        if(isWhite){
            img = require(`../../public/assets/${value.toLowerCase()}_w.png`)
        }
        else{
            img = require(`../../public/assets/${value}_b.png`)
        }
    }
    const handleClick = () => {

        props.handleClick(x,y);
        
    }

    

    return(
        
        <div className={`cell ${color}`} onClick={() => handleClick()}>
            {value ? 
            <div><img src={img}/></div>
            : 
            
            <div></div>}
            
        </div>
    );
}