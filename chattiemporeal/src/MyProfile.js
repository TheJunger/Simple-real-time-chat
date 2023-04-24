import React from "react"
import userImg from './imgTest.jpg' //THIS WILL NOT WORK

const MyProfileSchema = (props) =>{
    return(
        <div className="MPminiSchema">
            <div className="ImgMPminiCont">
                <img className="imgMPmini" src={userImg}/>
            </div>
            <div className="textMPmini">
                <div className="MPminiName">{props.userName}</div>
                <div className="MPminiStatus">Conectado</div>
            </div>
        </div>
    )
}

export {MyProfileSchema}