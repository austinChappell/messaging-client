// dependencies
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import FontAwesome from 'react-fontawesome';

// graphql queries
import queries from '../queries';

const {
  addMessage, // post a message
  getUser, // get single user and paired messages
  myUnreadMessages, // get user's unread messages
  readMessages, // mark messages as read
} = queries;

const propTypes = {
  fetchUser: PropTypes.objectOf(PropTypes.any).isRequired, // graphql query messaging user
  logout: PropTypes.func.isRequired, // logout user
  mutate: PropTypes.func.isRequired, // graphql post message
  markAsRead: PropTypes.func.isRequired, // graphql mark message as read
  openDrawer: PropTypes.bool.isRequired, // status of drawer
  selectedUser: PropTypes.string, // user id of messaging user
  socket: PropTypes.objectOf(PropTypes.any).isRequired, // socket to server
  toggleDrawer: PropTypes.func.isRequired, // open/close drawer
  user: PropTypes.objectOf(PropTypes.any).isRequired, // logged in user info
  unreadMessages: PropTypes.objectOf(PropTypes.any).isRequired, // graphql query unread messages
};

const defaultProps = {
  selectedUser: null, // will be null on mount
};

class Messenger extends Component {
  constructor(props) {
    super(props);
    this.messageWindow = React.createRef();

    this.state = {
      content: '', // input bar
      friendTyping: false, // show if messaging user is typing via socket
    };
  }

  componentDidMount() {
    this.subscribe(); // init socket
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

    // if query was made to fetch messages
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

      // refetch messages
      fetchUser.refetch();

      // mark all messages in view as read
      setTimeout(() => {
        markAsRead({
          variables: {
            recipient_id: user.id,
            sender_id: selectedUser,
          },
          refetchQueries: [
            {
              // update unread message list
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

    // notify other user of typing
    this.setState({ content: evt.target.value }, () => {
      this.toggleTyping('SEND_TYPING');

      // if user stops typing for 2 seconds, remove "is typing" message
      this.keepTyping = setTimeout(() => {
        this.toggleTyping('STOP_TYPING');
      }, 2000);
    });
  }

  receiveTyping = (param, data) => {
    const { socket } = this.props;
    const initTyping = param === 'RECEIVE_TYPING';

    socket.on(param, (data) => {
      const {
        recipientId,
        userId,
      } = data;

      // this must be defined in the callback, not the same time as start of subscribe
      // otherwise, selectedUser is undefined
      const {
        selectedUser,
        user,
      } = this.props;

      // messaging user is sender
      const senderMatch = Number(selectedUser) === userId;

      // logged in user is recipient
      const recipientMatch = user.id === Number(recipientId);

      if (senderMatch && recipientMatch) {
        const { friendTyping } = this.state;

        // if currently not typing and supposed to initialize
        if (!friendTyping && initTyping) {
          this.setState({ friendTyping: true });

        // if friend is typing and is stopping
        } else if (friendTyping && !initTyping) {
          this.setState({ friendTyping: false });
        }
      }
    });
  }

  // scroll to last message
  scrollDown = (behavior) => {
    this.lastMsg.scrollIntoView({ behavior });
  }

  toggleTyping = (param) => {
    const {
      selectedUser,
      socket,
      user,
    } = this.props;

    const data = {
      recipientId: selectedUser,
      userId: user.id,
    };

    socket.emit(param, data);
  }

  // post message
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

    this.toggleTyping('STOP_TYPING');

    // clear the input
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

    // set up listeners for starting and stopping typing message
    this.receiveTyping('RECEIVE_TYPING');
    this.receiveTyping('RECEIVE_STOP_TYPING');

    socket.on('RECEIVE_MESSAGE', (data) => {
      const message = data.message.data.addMessage; // the message sent
      const recipientId = message.recipient_id; // the recipient
      const senderId = message.sender_id; // the sender
      const {
        selectedUser,
        user,
      } = this.props;
      const senderMatch = senderId === selectedUser; // sender was messaging friend
      const recipientMatch = Number(recipientId) === user.id; // recipient is logged in user

      if (recipientMatch && !senderMatch) {
        // if was sent user but message window not open to sender
        unreadMessages.refetch();
      }

      // was sent to user and message window was open to sender
      if (senderMatch && recipientMatch) {
        fetchUser.refetch();
        setTimeout(() => {
          // mark message as read
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

    const { myUnreadMessages: unread } = unreadMessages; // array of unread messages
    const hasUnread = unread && unread.length > 0; // unread messages exist for user
    const { user: fetchedUser } = fetchUser; // user info which contains messages

    // messages of user or empty array
    const messages = fetchedUser
      ? fetchedUser.messages : [];

    // user name or placeholder if no user
    const title = fetchedUser
      ? fetchedUser.first_name : '';

    // show or hide "is typing message"
    const typingMessageClassName = friendTyping ? 'typing-message show' : 'typing-message';

    // notification badge if unread messages exist, to be displayed to hamburger icon
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

    // long return statement. should ideally be 3 or 4 components
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
              className={selectedUser ? '' : 'disabled'}
              disabled={!selectedUser}
              placeholder="Type your message here..."
              onChange={evt => this.handleChange(evt)}
              value={content}
            />
            <button
              className={selectedUser ? '' : 'disabled'}
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
