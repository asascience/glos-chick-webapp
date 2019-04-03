import React, { Component } from 'react';
import { PageHeader, ListGroup } from 'react-bootstrap';
import { API, Auth } from 'aws-amplify';
import './Home.css';

export default class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            testApiCall: []
        };
    }

    async componentDidMount() {
        if (!this.props.isAuthenticated) {
            return;
        }
        try {
            const testApiCall = await this.testApiCall();
            this.setState({ testApiCall });
        } catch (e) {
            alert(e);
        }
        this.setState({ isLoading: false });
    }

    testApiCall() {
        return API.get('testApiCall', '/hello');
    }

    renderTestAPI(testApiCall) {
        console.log(testApiCall);
        console.log(Auth.currentAuthenticatedUser())
        return testApiCall.message;
    }

    renderLander() {
        return (
            <div className="lander">
                <h1>GLOS Chick Demo App</h1>
                <p>A simple react app</p>
            </div>
        );
    }

    renderTest() {
        return (
            <div className="test">
                <PageHeader>Test API call</PageHeader>

                <ListGroup>{!this.state.isLoading && this.renderTestAPI(this.state.testApiCall)}</ListGroup>
            </div>
        );
    }

    render() {
        return <div className="Home">{this.props.isAuthenticated ? this.renderTest() : this.renderLander()}</div>;
    }
}
