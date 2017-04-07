import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './components/App';
import './fonts/font-awesome';

const rootDiv = document.createElement("div");

document.body.appendChild(rootDiv);

ReactDOM.render(<App description="Root App" />, rootDiv);
