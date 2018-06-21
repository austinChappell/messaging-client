import React, { Component } from 'react';
import { graphql } from 'react-apollo';

import { getUsers } from '../queries/';

class UserList extends Component {
  render() {
    console.log('USER LIST PROPS', this.props);
    const { data } = this.props;

    if (data.loading) {
      return (
        <div className="Loading">
          <h2>Loading...</h2>
        </div>
      )
    }

    const { users } = data;

    return (
      <div className="UserList">
        <h1>User List</h1>
        {users.map(user => (
          <div
            className="user"
            key={user.id}
          >
            {`${user.first_name} ${user.last_name}`}
          </div>
        ))}
      </div>
    )
  }
}

export default graphql(getUsers)(UserList);
