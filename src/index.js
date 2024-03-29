import React from 'react';
import ReactDOM from 'react-dom';
import Amplify from 'aws-amplify';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import dotenv from 'dotenv'
import config from './config/config';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

Amplify.configure({
    Auth: {
        mandatorySignIn: true,
        region: config.cognito.REGION,
        userPoolId: config.cognito.USER_POOL_ID,
        identityPoolId: config.cognito.IDENTITY_POOL_ID,
        userPoolWebClientId: config.cognito.APP_CLIENT_ID
    },
    API: {
        endpoints: [
            {
                name: 'testApiCall',
                endpoint: config.apiGateway.URL,
                region: config.apiGateway.REGION
            }
        ]
    }
});

ReactDOM.render(
    <Router>
        <App />
    </Router>,
    document.getElementById('root') || document.createElement('div')
);
registerServiceWorker();
