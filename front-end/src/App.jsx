// app.jsx
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Page from './page.jsx'; 
import Process from './Process.jsx';
import Login from './Login.jsx';
import Navbar from './Component/Navbar.jsx';
import "./styles.css"
import './i18n.js';
import AboutData from './aboutData.jsx';

function App(){
    return(
    <>
      <Navbar/>
      <div className="container">
      <Routes>
         <Route path="/" element={<Login />} />  
         <Route path="/Page" element={<Page />} />  
         <Route path="/process" element={<Process />} /> 
         <Route path="/aboutData" element={<AboutData />} /> 
      </Routes>
      </div>
      </>
    )
}


export default App;

