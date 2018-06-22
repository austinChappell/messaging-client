import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import FontAwesome from 'react-fontawesome';

import queries from '../queries/';
import helpers from '../helpers/';

const { getUsers, myUnreadMessages } = queries;

const { getUnread, searchMessages, truncate } = helpers;

class UserList extends Component {
  state = {
    searchResults: [],
    searchValue: '',
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.openDrawer && this.props.openDrawer) {
      this.props.getUsers.refetch();
    }
    if (this.props.unreadMessages.myUnreadMessages) {
      const prevMsgs = prevProps.unreadMessages.myUnreadMessages ? 
        prevProps.unreadMessages.myUnreadMessages : [];
      const currMsgs = this.props.unreadMessages.myUnreadMessages;
      const numChanged = prevMsgs.length !== currMsgs.length;
      const newUnread = numChanged && currMsgs.length > 0;
      const allRead = numChanged && currMsgs.length == 0;
      console.log('ALL READ', currMsgs);

      if (newUnread) {
        this.props.notify(true);
      } else if (allRead) {
        this.props.notify(false);
      }
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
      getUsers: data,
      openDrawer,
      selectedUser,
      unreadMessages,
      user,
    } = this.props;

    const {myUnreadMessages} = unreadMessages;

    const ids = myUnreadMessages ?
      myUnreadMessages
        .map(m => Number(m.sender_id))
      :
      [];
    
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
          const hasUnread = ids.includes(Number(u.id));
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
        
          if (Number(u.id) == user.id) {
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
                {notificationDot} {`${u.first_name} ${u.last_name}`}
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

export default compose(
  graphql(getUsers, {
    name: 'getUsers',
    options: props => ({
      variables: {
        id: props.user.id,
      }
    })
  }),
  graphql(myUnreadMessages, {
    name: 'unreadMessages',
    options: props => ({
      variables: {
        id: props.user.id,
      }
    })
  })
)(UserList)


