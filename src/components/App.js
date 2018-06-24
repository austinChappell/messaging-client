// dependencies
import React, { Component } from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import io from 'socket.io-client';
import { RingLoader } from 'react-spinners';

// custom apis
import authAPI from '../api/auth';

// custom components
import Messenger from './Messenger';
import UserList from './UserList';

// api functions
const {
  loginUser,
  login,
  signUp,
} = authAPI;

// server url
const {
  REACT_APP_SERVER_URL,
} = process.env;

// apollo client
const client = new ApolloClient({
  uri: `${REACT_APP_SERVER_URL}/graphql`,
});

class App extends Component {
  state = {
    checkedToken: false, // false until server has checked token
    confirmPassword: '',
    email: '',
    errorMessage: null,
    firstName: '',
    lastName: '',
    loggedIn: false,
    openDrawer: false,
    password: '',
    selectedUser: null, // will be a user id if not null
    signingUp: true,
    submitting: false,
    user: null, // user info for logged in user
  }

  componentDidMount() {
    const token = localStorage.getItem('token');

    if (token) {
      this.loginUser(token);
    } else {
      // if no token found, set checkToken to true
      this.checkedToken();
    }

    // connect the socket to the server
    this.socket = io(REACT_APP_SERVER_URL);
  }

  checkedToken = () => {
    this.setState({ checkedToken: true });
  }

  handleChange = (evt, key) => {
    const { value } = evt.target;
    const o = {};
    o[key] = value;
    this.setState(o);
  }

  // called when submitting login form
  login = (evt, formComplete) => {
    if (evt) {
      evt.preventDefault();
    }
    this.setState({
      errorMessage: null,
      submitting: true,
    }, async () => {
      const {
        email,
        password,
      } = this.state;

      const body = {
        email,
        password,
      };

      if (formComplete) {
        const result = await login(body);
        if (!result.error) {
          this.setUser(result);
        } else {
          this.setState({
            errorMessage: 'Invalid credentials',
            submitting: false,
          });
        }
      }
    });
  }

  loginUser = async (token) => {
    const loginResults = await loginUser(token);
    if (loginResults.error) {
      // set checkToken to true, but do not log them in
      this.checkedToken();
    } else {
      // set checkToken to true and log in the user
      this.setUser(loginResults);
    }
  }

  // remove token and logout user
  logout = () => {
    localStorage.removeItem('token');
    this.setState({
      loggedIn: false,
      selectedUser: null,
      user: null,
    });
  }

  selectUser = (id) => {
    this.setState({ selectedUser: id });
  }

  // store user from db in state
  setUser = (user) => {
    if (!user.error) {
      localStorage.setItem('token', user.token);
      this.setState({
        checkedToken: true,
        loggedIn: true,
        user,
        errorMessage: null,
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        submitting: false,
      });
    } else {
      this.setState({
        errorMessage: 'Invalid credentials',
        submitting: false,
      });
    }
  }

  // called when submitting sign up form
  signup = (evt, formComplete) => {
    evt.preventDefault();
    this.setState({
      errorMessage: null,
      submitting: true,
    }, async () => {
      if (formComplete) {
        const {
          firstName,
          lastName,
          email,
          password,
        } = this.state;
        const body = {
          firstName,
          lastName,
          email,
          password,
        };
        const result = await signUp(body);
        if (result.id) {
          this.login(null, true);
        } else {
          this.setState({
            errorMessage: result.error,
            submitting: false,
          });
        }
      }
    });
  }

  // open and close user list
  toggleDrawer = () => {
    const { openDrawer } = this.state;
    this.setState({ openDrawer: !openDrawer });
  }

  // flip between logging in and signing up
  toggleForm = () => {
    const { signingUp } = this.state;
    this.setState({ signingUp: !signingUp });
  }

  // this should be broken out into 2 or 3 components
  render() {
    const {
      checkedToken,
      confirmPassword,
      email,
      errorMessage,
      firstName,
      lastName,
      loggedIn,
      openDrawer,
      password,
      selectedUser,
      signingUp,
      submitting,
      user,
    } = this.state;

    // loader prior to token check
    if (!checkedToken) {
      return (
        <div className="LoginScreen">
          <h1>
            Loading...
          </h1>
          <h2>
            This may take some time due to Heroku server.
          </h2>
        </div>
      );
    }

    const firstNameComplete = firstName.trim().length > 1;
    const lastNameComplete = lastName.trim().length > 1;
    const emailComplete = email.trim().length > 3;
    const pwComplete = password.trim().length > 6;
    const pwMatch = password === confirmPassword;
    const demographicInfoComplete = firstNameComplete && lastNameComplete && emailComplete;
    const formComplete = demographicInfoComplete && pwComplete && pwMatch;

    const loginFormComplete = emailComplete && pwComplete;

    const spinner = submitting ? (
      <div className="fixed-fill flex-center darken-bg center">
        <div className="flex-center-horiz">
          <h2>
              Logging In...
          </h2>
          <div className="center">
            <RingLoader
              color="#ffffff"
              loading={submitting}
            />
          </div>
        </div>
      </div>
    ) : null;

    const errorNotification = errorMessage
      ? (
        <div className="center error">
          <span>
            {errorMessage}
          </span>
        </div>
      ) : null;

    const authForm = signingUp
      ? (
        <div className="auth-form">
          <form
            onSubmit={evt => this.signup(evt, formComplete)}
          >
            <div>
              <input
                onChange={evt => this.handleChange(evt, 'firstName')}
                placeholder="First Name"
                value={firstName}
              />
            </div>
            <div>
              <input
                onChange={evt => this.handleChange(evt, 'lastName')}
                placeholder="Last Name"
                value={lastName}
              />
            </div>
            <div>
              <input
                onChange={evt => this.handleChange(evt, 'email')}
                placeholder="Email"
                type="email"
                value={email}
              />
            </div>
            <div>
              <input
                onChange={evt => this.handleChange(evt, 'password')}
                placeholder="Password"
                type="password"
                value={password}
              />
            </div>
            <div>
              <input
                onChange={evt => this.handleChange(evt, 'confirmPassword')}
                placeholder="Confirm Password"
                type="password"
                value={confirmPassword}
              />
            </div>
            {errorNotification}
            <div>
              <button
                disabled={!formComplete}
                type="submit"
              >
                Sign Up
              </button>
            </div>
          </form>
          <div className="center">
            <p>
              Already have an account?
            </p>
            <span
              className="form-toggle"
              onClick={this.toggleForm}
              onKeyDown={(evt) => {
                if (evt.keyCode === 13) {
                  this.toggleForm();
                }
              }}
              role="button"
              tabIndex="0"
            >
              Log In
            </span>
          </div>
        </div>
      )
      : (
        <div className="auth-form">
          <form
            onSubmit={evt => this.login(evt, loginFormComplete)}
          >
            <div>
              <input
                onChange={evt => this.handleChange(evt, 'email')}
                placeholder="Email"
                type="email"
                value={email}
              />
            </div>
            <div>
              <input
                onChange={evt => this.handleChange(evt, 'password')}
                placeholder="Password"
                type="password"
                value={password}
              />
            </div>
            {errorNotification}
            <div>
              <button
                disabled={!loginFormComplete}
                type="submit"
              >
                Login
              </button>
            </div>
          </form>
          <div className="center">
            <p>
              Need an account?
            </p>
            <span
              className="form-toggle"
              onClick={this.toggleForm}
              onKeyDown={(evt) => {
                if (evt.keyCode === 13) {
                  this.toggleForm();
                }
              }}
              role="button"
              tabIndex="0"
            >
              Sign Up
            </span>
          </div>
        </div>
      );

    // if logged in, show messager app
    // else show login buttons
    const content = loggedIn
      ? (
        <div className="App">
          <div className="flex-container">
            <UserList
              openDrawer={openDrawer}
              selectUser={this.selectUser}
              selectedUser={selectedUser}
              toggleDrawer={this.toggleDrawer}
              user={user}
            />
            <Messenger
              logout={this.logout}
              openDrawer={openDrawer}
              selectedUser={selectedUser}
              socket={this.socket}
              toggleDrawer={this.toggleDrawer}
              user={user}
            />
          </div>
        </div>
      )
      : (
        <div className="LoginScreen">
          {spinner}
          <h1 className="center">
            Austin's
            <br />
            GraphQL Chat App
          </h1>

          {authForm}
        </div>
      );

    return (
      <ApolloProvider client={client}>
        {content}
      </ApolloProvider>
    );
  }
}

export default App;
