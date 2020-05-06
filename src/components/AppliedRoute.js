import React from 'react';
import {Redirect, Route} from 'react-router-dom';

export default ({ component: C, props: cProps, ...rest }) => {
    const {isAuthenticated} = cProps;
    const {privateResource} = rest;

    return (
        <Route {...rest} render={props => {
            const {location} = props;

            if (privateResource && !isAuthenticated) {
                return (
                    <Redirect
                        to={{
                            pathname: "/login",
                            state: {from: location}
                        }}
                    />
                )
            }

            return <C {...props} {...cProps} />
        }}
    />)
}
