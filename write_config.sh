#!/usr/bin/env bash
set -eo pipefail

write_config(){
    config_template="
export default {
    apiGateway: {
        REGION: 'us-east-2',
        URL: 'YOUR_API_GATEWAY_URL'
    },
    cognito: {
        REGION: '%s',
        USER_POOL_ID: '%s',
        APP_CLIENT_ID: '%s',
        IDENTITY_POOL_ID: '%s'
    }
};
"
    config=$(printf "$config_template" $REGION $USER_POOL_ID $APP_CLIENT_ID $IDENTITY_POOL_ID)
    echo "$config" > ./src/config.js
}

write_config