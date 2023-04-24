import './App.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import React from 'react';
import { Login } from './login';
import { MainPage } from './MainPage';

function App() {
    //return(
    //    <>
    //        <Login isLoggin={false}/>
    //    </>
    //)
    return(
    <BrowserRouter>
        <Routes>
            <Route path='/login' Component={Login}/>
            <Route path='/' Component={MainPage}/>
        </Routes>
    </BrowserRouter>
    )
}

export default App;
