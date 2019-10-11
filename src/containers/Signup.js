import React, { Component } from 'react';
import { FormText, FormGroup, FormControl, FormLabel, Form, Col } from 'react-bootstrap';
import LoaderButton from '../components/LoaderButton';
import { Auth } from 'aws-amplify';
import './Signup.css';

export default class Signup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      firstname: '',
      lastname: '',
      organization: '',
      email: '',
      password: '',
      confirmPassword: '',
      confirmationCode: '',
      phoneNumber: '',
      newUser: null
    };
  }

  validateForm() {
    return (
      this.state.firstname.length > 0 &&
      this.state.lastname.length > 0 &&
      this.state.organization.length > 0 &&
      this.state.email.length > 0 &&
      this.state.password.length > 0 &&
      this.state.password === this.state.confirmPassword
    );
  }

  validateConfirmationForm() {
    return this.state.confirmationCode.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };

  handleSubmit = async event => {
    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      const newUser = await Auth.signUp({
        username: this.state.email,
        password: this.state.password,
        attributes: {
          email: this.state.email,
          phone_number: this.state.phoneNumber
        }
      });
      this.setState({
        newUser
      });
    } catch (e) {
      alert(e.message);
    }

    this.setState({ isLoading: false });
  };

  handleConfirmationSubmit = async event => {
    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      await Auth.confirmSignUp(this.state.email, this.state.confirmationCode);
      await Auth.signIn(this.state.email, this.state.password);

      this.props.userHasAuthenticated(true);
      this.props.history.push('/');
    } catch (e) {
      alert(e.message);
      this.setState({ isLoading: false });
    }
  };

  renderConfirmationForm() {
    return (
      <form onSubmit={this.handleConfirmationSubmit}>
        <h2>Confirm</h2>
        <FormGroup controlId="confirmationCode" bsSize="large">
          <FormLabel>Confirmation Code</FormLabel>
          <FormControl autoFocus type="tel" value={this.state.confirmationCode} onChange={this.handleChange} />
          <FormText>Please check your phone for the code.</FormText>
        </FormGroup>
        <LoaderButton
          block
          bsSize="large"
          bsStyle="warning"
          disabled={!this.validateConfirmationForm()}
          type="submit"
          isLoading={this.state.isLoading}
          text="Verify"
          loadingText="Verifying…"
        />
      </form>
    );
  }

  renderForm() {
    return (
      <form onSubmit={this.handleSubmit}>
        <h2 align='center'>Sign Up</h2>
        <Form>
          <Form.Row>
            <FormGroup as={Col} controlId="firstname" bsSize="small">
              <FormLabel>First Name</FormLabel>
              <FormControl size="sm" autoFocus value={this.state.firstname} onChange={this.handleChange} />
            </FormGroup>
            <FormGroup as={Col} controlId="lastname" bsSize="small">
              <FormLabel>Last Name</FormLabel>
              <FormControl size="sm" autoFocus value={this.state.lastname} onChange={this.handleChange} />
            </FormGroup>
          </Form.Row>
          <FormGroup controlId="organization" bsSize="small">
            <FormLabel>Organization</FormLabel>
            <FormControl size="sm" autoFocus value={this.state.organization} onChange={this.handleChange} />
          </FormGroup>
          <FormGroup controlId="email" bsSize="small">
            <FormLabel>Email</FormLabel>
            <FormControl size="sm" autoFocus type="email" value={this.state.email} onChange={this.handleChange} />
          </FormGroup>
          <FormGroup controlId="phoneNumber" bsSize="small">
            <FormLabel>Phone Number</FormLabel>
            <FormControl size="sm" value={this.state.phoneNumber} onChange={this.handleChange} />
            <FormText>US based mobile number. Example: +14325551212</FormText>
          </FormGroup>
          <FormGroup controlId="password" bsSize="small">
            <FormLabel>Password</FormLabel>
            <FormControl size="sm" value={this.state.password} onChange={this.handleChange} type="password" />
            <FormText>8 characters min, uppercase letters, lowercase letters, numbers</FormText>
          </FormGroup>
          <FormGroup controlId="confirmPassword" bsSize="small">
            <FormLabel>Confirm Password</FormLabel>
            <FormControl size="sm" value={this.state.confirmPassword} onChange={this.handleChange} type="password" />
          </FormGroup>
          <LoaderButton
            block
            bsStyle="warning"
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
            isLoading={this.state.isLoading}
            text="Create Account"
            loadingText="Signing up…"
          />
        </Form>
      </form>
    );
  }

  render() {
    return (
      <div className="Signup">{this.state.newUser === null ? this.renderForm() : this.renderConfirmationForm()}</div>
    );
  }
}
