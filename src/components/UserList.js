import React, { Component } from 'react';
import { graphql } from 'react-apollo';

import { getUsers } from '../queries/';

import helpers from '../helpers/';

const { truncate } = helpers;

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
            const message = u.last_message.content;
            return (
              <div
                key={u.id}
                className="user"
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
