// dependencies
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import FontAwesome from 'react-fontawesome';

// custom queries and helpers
import queries from '../queries';
import helpers from '../helpers';

const {
  getUsers, // get all users
  myUnreadMessages, // get user's unread messages
} = queries;

const {
  searchMessages, // search filter
  sortByLatestMessage, // sort users by message history, newest on top
  truncate, // helper method to truncate string
} = helpers;

const propTypes = {
  fetchUsers: PropTypes.objectOf(PropTypes.any).isRequired, // graphql query for users
  openDrawer: PropTypes.bool.isRequired, // state of drawer
  selectedUser: PropTypes.string, // user id as string
  selectUser: PropTypes.func.isRequired, // function to select user
  toggleDrawer: PropTypes.func.isRequired, // toggle drawer state
  unreadMessages: PropTypes.objectOf(PropTypes.any).isRequired, // graphql query to get unread messages
  user: PropTypes.objectOf(PropTypes.any).isRequired, // logged in user info
};

const defaultProps = {
  selectedUser: null, // null on mount
};

class UserList extends Component {
  state = {
    searchResults: [],
    searchValue: '',
  }

  componentDidUpdate(prevProps) {
    const {
      fetchUsers,
      openDrawer,
    } = this.props;

    // if drawer is opening, refresh user list
    if (!prevProps.openDrawer && openDrawer) {
      fetchUsers.refetch();
    }
  }

  closeDrawer = () => {
    const { toggleDrawer } = this.props;
    toggleDrawer();
  }

  handleChange = (evt) => {
    this.setState({ searchValue: evt.target.value }, () => {
      this.search();
    });
  }

  search = () => {
    const { fetchUsers } = this.props;
    const { users } = fetchUsers;
    const { searchValue } = this.state;

    // pass in users and search value to helper method
    // search runs again user first and last name, and message content
    const searchResults = searchMessages(users, searchValue);
    this.setState({ searchResults });
  }

  // fires when user clicks a user in user list
  selectUser = (id) => {
    const { selectUser } = this.props;
    selectUser(id);
    this.closeDrawer();
  }

  render() {
    const {
      searchResults,
      searchValue,
    } = this.state;

    const {
      fetchUsers: data,
      openDrawer,
      selectedUser,
      unreadMessages,
      user,
    } = this.props;

    const { myUnreadMessages: unread } = unreadMessages;

    // just ids of unread messages
    const ids = unread
      ? unread
        .map(m => Number(m.sender_id))
      : [];

    const isFiltering = searchValue.trim() !== '';

    if (data.loading) {
      return (
        <div className="UserList Loading closed">
          <h2>
            Loading...
          </h2>
        </div>
      );
    }

    const userListClassName = openDrawer
      ? 'UserList open'
      : 'UserList closed';

    const users = isFiltering
      ? searchResults
      : data.users;

    const sortedUsers = sortByLatestMessage(users);

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
            type="button"
          >
            <FontAwesome name="times" />
          </button>
        </div>

        {sortedUsers.map((u) => {
          const hasUnread = ids.includes(Number(u.id));

          const notificationDot = hasUnread
            ? (
              <FontAwesome
                name="circle"
                style={{
                  color: '#ff0000',
                  fontSize: 12,
                }}
              />
            ) : null;

          if (Number(u.id) === user.id) {
            return null;
          }

          const message = u.last_message ? u.last_message.content : '';

          const userClassName = u.id === selectedUser
            ? 'user active'
            : 'user';

          return (
            <div
              key={u.id}
              className={userClassName}
              onClick={() => this.selectUser(u.id)}
              onKeyDown={(evt) => {
                if (evt.keyCode === 13) {
                  this.selectUser(u.id);
                }
              }}
              role="button"
              tabIndex="0"
            >
              <h4>
                {notificationDot}
                {' '}
                {`${u.first_name} ${u.last_name}`}
              </h4>
              <p>
                {truncate(message, 20)}
              </p>
            </div>
          );
        })}
      </div>
    );
  }
}

UserList.propTypes = propTypes;
UserList.defaultProps = defaultProps;

export default compose(
  graphql(getUsers, {
    name: 'fetchUsers',
    options: (props) => {
      const { user } = props;
      const { id } = user;
      return {
        variables: {
          id,
        },
      };
    },
  }),
  graphql(myUnreadMessages, {
    name: 'unreadMessages',
    options: (props) => {
      const { user } = props;
      const { id } = user;
      return {
        variables: {
          id,
        },
      };
    },
  }),
)(UserList);
