import React, { Component } from 'react';
import ApolloClient from 'apollo-boost';
import FontAwesome from 'react-fontawesome';

import { ApolloProvider } from 'react-apollo';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props'
import { GoogleLogin } from 'react-google-login';
import io from 'socket.io-client';

import authAPI from '../api/auth';

import Messenger from './Messenger';
import UserList from './UserList';

const { fbAuth, googleAuth, loginUser } = authAPI;

const {
  REACT_APP_SERVER_URL,
} = process.env;

const client = new ApolloClient({
  uri: `${REACT_APP_SERVER_URL}/graphql`,
});

class App extends Component {
  state = {
    checkedToken: false,
    hasUnread: false,
    loggedIn: false,
    openDrawer: false,
    selectedUser: null,
    user: null,
  }

  componentDidMount() {
    const token = localStorage.getItem('token');
    if (token) {
      this.loginUser(token);
    } else {
      this.checkedToken();
    }
    this.socket = io(REACT_APP_SERVER_URL);

    this.socket.on('connect', () => {
      console.log('CONNECTED');
    })
  }

  checkedToken = () => {
    this.setState({ checkedToken: true });
  }

  fbLogin = async (user) => {
    const loginResults = await fbAuth(user);
    this.setUser(loginResults);
  }

  loginUser = async (token) => {
    const loginResults = await loginUser(token);
    this.setUser(loginResults);
  }

  logout = () => {
    localStorage.removeItem('token');
    this.setState({
      loggedIn: false,
      selectedUser: null,
      user: null,
    })
  }

  googleLogin = async (user) => {
    const loginResults = await googleAuth(user);
    this.setUser(loginResults);
  }

  notify = (bool) => {
    this.setState({ hasUnread: bool });
  }

  selectUser = (id) => {
    this.setState({ selectedUser: id })
  }

  setUser = (user) => {
    localStorage.setItem('token', user.token);
    this.setState({ checkedToken: true, loggedIn: true, user });
  }

  toggleDrawer = () => {
    this.setState({ openDrawer: !this.state.openDrawer })
  }

  render() {
    const {
      checkedToken,
      hasUnread,
      loggedIn,
      openDrawer,
      selectedUser,
      user,
    } = this.state;

    if (!checkedToken) {
      return (
        <div className="LoginScreen">
          <h1>Loading...</h1>
          <h2>This may take some time due to Heroku server.</h2>
        </div>
      )
    }

    const notificationDot = hasUnread ?
      (
        <FontAwesome
          name="circle"
          style={{
            color : '#ff0000',
            fontSize: 12,
          }}
        />
      ) : null;

    const content = loggedIn ?
      (
        <div className="App">
          <div className="navbar">
            <div>
              <button
                onClick={this.toggleDrawer}
                style={{ display: 'flex', alignItems: 'flex-start' }}
              >
                <FontAwesome name="bars" />
                {notificationDot}
              </button>
            </div>
            <div className="navbar-right">
              <span>{user.first_name}</span>
              <button
                onClick={this.logout}
              >
                <FontAwesome name="power-off" />
              </button>
            </div>
          </div>
          <div className="flex-container">
            <UserList
              notify={this.notify}
              openDrawer={openDrawer}
              selectUser={this.selectUser}
              selectedUser={selectedUser}
              toggleDrawer={this.toggleDrawer}
              user={user}
            />
            <Messenger
              openDrawer={openDrawer}
              selectedUser={selectedUser}
              socket={this.socket}
              user={user}
            />
          </div>
        </div>
      )
      :
      (
        <div className="LoginScreen">
          <h1>My GraphQL Chat App</h1>

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
    )
  }
}

export default App;
