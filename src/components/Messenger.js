import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import FontAwesome from 'react-fontawesome';

import queries from '../queries';

const {
  addMessage,
  getUser,
  myUnreadMessages,
  readMessages,
} = queries;

const propTypes = {
  fetchUser: PropTypes.objectOf(PropTypes.any).isRequired,
  logout: PropTypes.func.isRequired,
  mutate: PropTypes.func.isRequired,
  markAsRead: PropTypes.func.isRequired,
  openDrawer: PropTypes.bool.isRequired,
  selectedUser: PropTypes.string,
  socket: PropTypes.objectOf(PropTypes.any).isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  user: PropTypes.objectOf(PropTypes.any).isRequired,
  unreadMessages: PropTypes.objectOf(PropTypes.any).isRequired,
};

const defaultProps = {
  selectedUser: null,
};

class Messenger extends Component {
  constructor(props) {
    super(props);
    this.messageWindow = React.createRef();

    this.state = {
      content: '',
      friendTyping: false,
    };
  }

  componentDidMount() {
    this.subscribe();
  }

  componentDidUpdate(prevProps) {
    const {
      fetchUser,
      markAsRead,
      openDrawer,
      user,
    } = this.props;

    const prevUser = prevProps.fetchUser.user;
    const currUser = fetchUser.user;

    if (prevUser !== currUser) {
      if (this.lastMsg && !prevUser) {
        // initial message load
        this.scrollDown('instant');
      } else if (this.lastMsg) {
        // update existing messages
        this.scrollDown('smooth');
      }
    }

    // drawer is closing
    if (prevProps.openDrawer && !openDrawer) {
      const {
        selectedUser,
      } = this.props;

      fetchUser.refetch();

      setTimeout(() => {
        markAsRead({
          variables: {
            recipient_id: user.id,
            sender_id: selectedUser,
          },
          refetchQueries: [
            {
              query: myUnreadMessages,
              variables: {
                id: user.id,
              },
            },
          ],
        });
      }, 1000);
    }
  }

  handleChange = (evt) => {
    clearTimeout(this.keepTyping);

    const {
      selectedUser,
      socket,
      user,
    } = this.props;

    const data = {
      recipientId: selectedUser,
      userId: user.id,
    };

    this.setState({ content: evt.target.value }, () => {
      socket.emit('SEND_TYPING', data);
      this.keepTyping = setTimeout(() => {
        socket.emit('STOP_TYPING', data);
      }, 3000);
    });
  }

  scrollDown = (behavior) => {
    this.lastMsg.scrollIntoView({ behavior });
  }

  submit = (evt) => {
    evt.preventDefault();

    const {
      content,
    } = this.state;

    const {
      mutate,
      selectedUser,
      socket,
      user,
    } = this.props;

    const data = {
      recipientId: selectedUser,
      userId: user.id,
    };

    socket.emit('STOP_TYPING', data);

    this.setState({
      content: '',
    }, async () => {
      const result = await mutate({
        variables: {
          content,
          recipient_id: selectedUser,
          sender_id: user.id,
        },
        refetchQueries: [
          {
            query: getUser,
            variables: {
              id: selectedUser,
              self: user.id,
            },
          },
        ],
      });
      socket.emit('SEND_MESSAGE', { message: result });
    });
  }

  subscribe = () => {
    const {
      fetchUser,
      markAsRead,
      socket,
      unreadMessages,
    } = this.props;

    socket.on('RECEIVE_TYPING', (data) => {
      const {
        recipientId,
        userId,
      } = data;

      // this must be defined in the callback, not the same time as socket
      const { selectedUser, user } = this.props;
      const senderMatch = Number(selectedUser) === userId;
      const recipientMatch = user.id === Number(recipientId);

      if (senderMatch && recipientMatch) {
        const { friendTyping } = this.state;
        if (!friendTyping) {
          this.setState({ friendTyping: true });
        }
      }
    });

    socket.on('RECEIVE_STOP_TYPING', (data) => {
      const { friendTyping } = this.state;
      if (friendTyping) {
        this.setState({ friendTyping: false });
      }
    });

    socket.on('RECEIVE_MESSAGE', (data) => {
      const message = data.message.data.addMessage;
      const recipientId = message.recipient_id;
      const senderId = message.sender_id;
      const { user, selectedUser } = this.props;
      const userId = user.id;
      const senderMatch = senderId === selectedUser;
      const recipientMatch = Number(recipientId) === userId;

      if (recipientMatch && !senderMatch) {
        // if was sent user but message not open
        unreadMessages.refetch();
      }

      // was sent to user
      if (senderMatch && recipientMatch) {
        fetchUser.refetch();
        setTimeout(() => {
          markAsRead({
            variables: {
              recipient_id: user.id,
              sender_id: selectedUser,
            },
            refetchQueries: [
              {
                query: myUnreadMessages,
                variables: {
                  id: user.id,
                },
              },
            ],
          });
        }, 1000);
      }
    });
  }

  render() {
    const {
      content,
      friendTyping,
    } = this.state;
    const {
      fetchUser,
      logout,
      openDrawer,
      selectedUser,
      toggleDrawer,
      unreadMessages,
      user,
    } = this.props;

    const { myUnreadMessages: unread } = unreadMessages;
    const hasUnread = unread && unread.length > 0;

    const { user: fetchedUser } = fetchUser;

    const messages = fetchedUser
      ? fetchedUser.messages : [];

    const title = fetchedUser
      ? fetchedUser.first_name : 'Select A User';

    const typingMessageClassName = friendTyping ? 'typing-message show' : 'typing-message';

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

    return (
      <div className="Messenger">
        <div className="navbar">
          <div>
            <button
              onClick={toggleDrawer}
              style={{
                alignItems: 'flex-start',
                display: 'flex',
              }}
              type="button"
            >
              <FontAwesome name="bars" />
              {notificationDot}
            </button>
          </div>

          <h1>
            {title}
          </h1>

          <div className="navbar-right">
            <span>
              {user.first_name}
            </span>
            <button
              onClick={logout}
              type="button"
            >
              <FontAwesome name="power-off" />
            </button>
          </div>
        </div>

        <div className={openDrawer ? 'overlay show' : 'overlay'} />
        <p className={typingMessageClassName}>
          {`${title} is typing...`}
        </p>
        <div className="messages" ref={this.messageWindow}>
          {messages.map((msg, index) => {
            const isSender = user.id === Number(msg.sender_id);
            const lastMsg = index === messages.length - 1;
            const messageClass = isSender
              ? 'message sender' : 'message recipient';
            return (
              <div
                key={msg.id}
                className={messageClass}
                ref={lastMsg ? el => this.lastMsg = el : false}
              >
                {msg.content}
              </div>
            );
          })}
        </div>
        <form
          onSubmit={evt => this.submit(evt)}
        >
          <div className="message-input">
            <input
              disabled={!selectedUser}
              placeholder="Type your message here..."
              onChange={evt => this.handleChange(evt)}
              value={content}
            />
            <button
              disabled={!selectedUser}
              type="submit"
            >
              <FontAwesome name="paper-plane" />
            </button>
          </div>
        </form>
      </div>
    );
  }
}

Messenger.propTypes = propTypes;
Messenger.defaultProps = defaultProps;

export default compose(
  graphql(addMessage),
  graphql(getUser, {
    name: 'fetchUser',
    options: (props) => {
      const { selectedUser, user } = props;
      return {
        variables: {
          id: selectedUser,
          // self is used to get messages between self and other user
          self: user.id,
        },
      };
    },
  }),
  graphql(readMessages, { name: 'markAsRead' }),
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
)(Messenger);
