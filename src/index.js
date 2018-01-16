import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './app';
import './pages/style/index.css';

import { Provider } from 'react-redux';
import configureStore from './store/configureStore';
const store = configureStore();

const getConfirmation = (message, callback) => {
  const allowTransition = window.confirm(message);
  callback(allowTransition);
};

ReactDOM.render(
  <Provider store={store}>
    <Router getUserConfirmation={getConfirmation}>
      <App />
    </Router>
  </Provider>,
  document.getElementById('root')
);
