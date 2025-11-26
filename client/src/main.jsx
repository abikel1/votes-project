import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './app/store';
import App from './App.jsx';
import './index.css';
import './i18n';
import DirectionWrapper from './DirectionWrapper.jsx';
import './components/Footer/Footer.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <DirectionWrapper>
          <App />
        </DirectionWrapper>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
