import React, { Component } from 'react';
import { graphql } from 'react-apollo';

import { getUsers } from '../queries/';

class UserList extends Component {
  render() {
    const {
      data,
      selectUser,
      user,
    } = this.props;

    if (data.loading) {
      return (
        <div className="Loading">
          <h2>Loading...</h2>
        </div>
      )
    }

    const { users } = data;
    console.log('USERS', users);

    return (
      <div className="UserList">
        <h1>User List</h1>
        {users.map(u => {
          if (Number(u.id) !== user.id) {
            return (
              <div
                key={u.id}
                className="user"
                onClick={() => selectUser(u.id)}
              >
                {`${u.first_name} ${u.last_name}`}
              </div>
            )
          }
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
