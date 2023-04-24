import React from "react";
import './login.css'
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = ()=>{
    const [loggin, handleLoggin] = useState(false)
    const navigate = useNavigate()

    const checkStatus = ()=>{
        handleLoggin(true)
        navigate('/')
    }

    const sendFetch = ()=>{
        try {
            //LOW SECURE, CHANGE
            fetch('http://localhost:3001/rsc/login',{
                method: 'POST',
                headers : { "Content-Type": "application/json" },
                //body: JSON.stringify({'email':'fulanitodetal@testuser.com', 'password':'123456', 'tryLogin': true})
                body: JSON.stringify({'email':'testuser@example.com', 'password':'testpassword', 'tryLogin': true})
            })
            .then(res => res.json())
            .then(data => {console.log(data);checkStatus()})
        } catch (error) {
            alert('Inicio de sesion invalido')
        }
    }

    return(
        <div className="container">
            <div className="navbar">
                <div>Volver</div>
            </div>
            <div className="mainContent">
                <div className="mainContainer">
                    <div className="loginText">Inicia sesion</div>
                    <input type='text' className='user' value='testuser@example.com' placeholder="Ingresa tu usuario" />
                    <input type='text' className='pass' value='testpassword' placeholder="Ingresa tu contraseña" />
                    <a className="btnForgot" href="">Olvidaste tu contraseña</a>
                    <input type='button' className='btnLogin' onClick={sendFetch} value="Ingresar" />
                </div>
            </div>
        </div>
    )
}

export {Login}