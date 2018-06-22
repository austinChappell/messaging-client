import React, { Component } from 'react';
import { graphql } from 'react-apollo';

import { getUsers } from '../queries/';

import helpers from '../helpers/';

const { searchMessages, truncate } = helpers;

class UserList extends Component {
  state = {
    searchResults: [],
    searchValue: '',
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

  render() {
    const { searchResults, searchValue } = this.state;
    const isFiltering = searchValue.trim() !== '';

    const {
      data,
      selectUser,
      selectedUser,
      user,
    } = this.props;

    if (data.loading) {
      return (
        <div className="Loading">
          <h2>Loading...</h2>
        </div>
      )
    }

    const users = isFiltering ? searchResults : data.users;

    return (
      <div className="UserList">
        <div className="search-bar">
          <input
            onChange={evt => this.handleChange(evt)}
            placeholder="Search..."
            value={searchValue}
          />
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
              onClick={() => selectUser(u.id)}
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
