import React, { Component } from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props'
import { GoogleLogin } from 'react-google-login';

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
    loggedIn: false,
    selectedUser: null,
    user: null,
  }

  componentDidMount() {
    const token = localStorage.getItem('token');
    if (token) {
      this.loginUser(token);
    }
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

  selectUser = (id) => {
    console.log('SELECTING USER', id);
    this.setState({ selectedUser: id })
  }

  setUser = (user) => {
    localStorage.setItem('token', user.token);
    this.setState({ loggedIn: true, user })
  }

  render() {
    const {
      loggedIn,
      selectedUser,
      user,
    } = this.state;

    const content = loggedIn ?
      (
        <div className="App">
          <div className="navbar">
            <button
              onClick={this.logout}
            >
              Logout
            </button>
          </div>
          <div className="flex-container">
            <UserList
              selectUser={this.selectUser}
              selectedUser={selectedUser}
              user={user}
            />
            <Messenger
              selectedUser={selectedUser}
              user={user}
            />
          </div>
        </div>
      )
      :
      (
        <div className="LoginScreen">
          <h1>Login</h1>

          <FacebookLogin
            appId="1815948175379229"
            callback={this.fbLogin}
            fields="name,email"
            render={renderProps => (
              <button
                onClick={renderProps.onClick}
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
          />

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
