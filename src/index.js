import axi from 'axios';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

axi.defaults.baseURL ="https://pokeapi.co/api/v2"
ReactDOM.render(
  
    <App />
  ,
  document.getElementById('root')
);