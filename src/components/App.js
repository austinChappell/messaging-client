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
    localStorage.setItem('token', user.token);
    this.setState({
      checkedToken: true,
      loggedIn: true,
      user,
    });
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

          <div className="buttons">
            <FacebookLogin
              appId="1815948175379229"
              callback={this.fbLogin}
              fields="name,email"
              render={renderProps => (
                <button
                  onClick={renderProps.onClick}
                  style={{
                    backgroundColor: '#3C5B97',
                    color: '#ffffff',
                  }}
                  type="button"
                >
                  Login with Facebook
                </button>
              )}
            />

            <GoogleLogin
              clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
              buttonText="Login with Google"
              onSuccess={this.googleLogin}
              onFailure={this.googleLogin}
              style={{
                backgroundColor: '#DE4940',
                color: '#ffffff',
              }}
            />
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
