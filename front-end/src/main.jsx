// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import i18n from './P1/i18n.js'
// import './index.css'
// import "./styles.css"
// import{BrowserRouter} from "react-router-dom"

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <App />
//     </BrowserRouter>
//   </React.StrictMode>,
// );

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import i18n from './i18n.js'
import './index.css'
import "./styles.css"
import{BrowserRouter} from "react-router-dom"
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);


