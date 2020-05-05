import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import AppliedRoute from './components/AppliedRoute';
import Home from './containers/Home';
import NotFound from './containers/NotFound';
import Login from './containers/Login';
import Signup from './containers/Signup';
import Alerts from './containers/Alerts';
import Project from './containers/Project';
import Data from './containers/Data';
import StationDashboard from './containers/StationDashboard'

function PrivateRoute({ children, ...rest }) {

    const {isAuthenticated} = rest;

    return (
        <Route
            {...rest}
            render={({ location, match }) =>
                isAuthenticated ? (
                        React.cloneElement(children,{...rest, match})
                ) : (
                    <Redirect
                        to={{
                            pathname: "/login",
                            state: { from: location }
                        }}
                    />
                )
            }
        />
    );
}

export default ({ childProps }) => {
    return (
        <Switch>
            <AppliedRoute path="/" exact component={Home} props={childProps}/>
            <AppliedRoute path="/login" exact component={Login} props={childProps}/>
            <AppliedRoute path="/signup" exact component={Signup} props={childProps}/>
            <AppliedRoute path="/alerts" exact component={Alerts} props={childProps}/>
            <AppliedRoute path="/project" exact component={Project} props={childProps}/>
            <AppliedRoute path="/data" exact component={Data} props={childProps}/>
            <PrivateRoute path="/:id" {...childProps}>
                <StationDashboard/>
            </PrivateRoute>
            {/*<AppliedRoute path="/:id" component={StationDashboard} props={childProps}/>*/}
            {/* Finally, catch all unmatched routes */}
            <Route component={NotFound}/>
        </Switch>
    )
};
