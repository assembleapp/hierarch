import Aviator from "aviator"
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Bills from './bills';
import reportWebVitals from './reportWebVitals';

import Hierarch from "./hierarch"

const go = (block) => {
  ReactDOM.render(
    <React.StrictMode>
      { process.env.NODE_ENV === 'development'
        ? <Hierarch>{block}</Hierarch>
        : block
      }
    </React.StrictMode>,
    document.getElementById('base')
  )
}

Aviator.setRoutes({
  "/":      () => go(<App/>),
  "/bills": () => go(<Bills/>),
})

Aviator.dispatch()

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
