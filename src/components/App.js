// dependencies
import React, { Component } from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { GoogleLogin } from 'react-google-login';
import io from 'socket.io-client';

// custom apis
import authAPI from '../api/auth';

// custom components
import Messenger from './Messenger';
import UserList from './UserList';

// api functions
const {
  fbAuth,
  googleAuth,
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
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    loggedIn: false,
    openDrawer: false,
    selectedUser: null, // will be a user id if not null
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

  // if user exists with fb creds, log them in, else sign them up
  fbLogin = async (user) => {
    const loginResults = await fbAuth(user);
    this.setUser(loginResults);
  }

  // if user exists with google creds, log them in, else sign them up
  googleLogin = async (user) => {
    const loginResults = await googleAuth(user);
    this.setUser(loginResults);
  }

  handleChange = (evt, key) => {
    const { value } = evt.target;
    const o = {};
    o[key] = value;
    this.setState(o);
  }

  login = async (evt) => {
    evt.preventDefault();
    const {
      email,
      password,
    } = this.state;
    const body = {
      email,
      password,
    };
    const user = await login(body);
    console.log('USER', user);
    this.setUser(user);
  }

  loginUser = async (token) => {
    console.log('TOKEN', token);
    const loginResults = await loginUser(token);
    console.log('RSULTS', loginResults);
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
    localStorage.setItem('token', user.token);
    this.setState({
      checkedToken: true,
      loggedIn: true,
      user,
    });
  }

  submit = async (evt) => {
    evt.preventDefault();
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    } = this.state;
    const body = {
      firstName,
      lastName,
      email,
      password,
    };
    const result = await signUp(body);
    console.log('RESULT', result);
  }

  // open and close user list
  toggleDrawer = () => {
    const { openDrawer } = this.state;
    this.setState({ openDrawer: !openDrawer });
  }

  render() {
    const {
      checkedToken,
      loggedIn,
      openDrawer,
      selectedUser,
      user,
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
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
          <h1>
            My GraphQL Chat App
          </h1>

          <div className="sign-up">
            <form
              onSubmit={evt => this.submit(evt)}
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
              <button>
                Sign Up
              </button>
            </form>
          </div>

          <div className="login">
            <form
              onSubmit={evt => this.login(evt)}
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
              <button>
                Login
              </button>
            </form>
          </div>

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
