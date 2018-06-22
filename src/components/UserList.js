import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import FontAwesome from 'react-fontawesome';

import { getUsers } from '../queries/';

import helpers from '../helpers/';

const { searchMessages, truncate } = helpers;

class UserList extends Component {
  state = {
    searchResults: [],
    searchValue: '',
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.openDrawer && this.props.openDrawer) {
      this.props.data.refetch();
    }
  }

  closeDrawer = () => {
    this.props.toggleDrawer();
  }

  handleChange = (evt) => {
    this.setState({ searchValue: evt.target.value }, () => {
      this.search();
    });
  }

  search = () => {
    const { users } = this.props.data;
    const { searchValue } = this.state;
    const searchResults = searchMessages(users, searchValue);
    this.setState({ searchResults });
  }

  selectUser = (id) => {
    this.props.selectUser(id);
    this.closeDrawer();
  }

  render() {
    const { searchResults, searchValue } = this.state;
    const {
      data,
      openDrawer,
      selectedUser,
      user,
    } = this.props;

    const isFiltering = searchValue.trim() !== '';

    if (data.loading) {
      return (
        <div className="UserList Loading closed">
          <h2>Loading...</h2>
        </div>
      )
    }

    const userListClassName = openDrawer ? "UserList open" : "UserList closed";
    const users = isFiltering ? searchResults : data.users;

    return (
      <div className={userListClassName}>
        <div className="search-bar">
          <input
            onChange={evt => this.handleChange(evt)}
            placeholder="Search users or messages..."
            value={searchValue}
          />
          <button
            onClick={this.closeDrawer}
          >
            <FontAwesome name="times" />
          </button>
        </div>

        {users.map(u => {
          if (Number(u.id) === user.id) {
            return null;
          }
          const message = u.last_message ? u.last_message.content : '';
          const userClassName = u.id === selectedUser ? "user active" : "user";
          return (
            <div
              key={u.id}
              className={userClassName}
              onClick={() => this.selectUser(u.id)}
            >
              <h4>
                {`${u.first_name} ${u.last_name}`}
              </h4>
              <p>
                {truncate(message, 20)}
              </p>
            </div>
          )
        })}
      </div>
    )
  }
}

export default graphql(getUsers, {
  options: props => ({
    variables: {
      id: props.user.id,
    }
  })
})(UserList);
