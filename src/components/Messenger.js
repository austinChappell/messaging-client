import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import FontAwesome from 'react-fontawesome';

import { addMessage, getUser } from '../queries/';

class Messenger extends Component {
  constructor(props) {
    super(props);
    this.messageWindow = React.createRef();

    this.state = {
      content: '',
      friendTyping: false,
    }
  }

  componentDidMount() {
    this.subscribe();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.getUser.user !== this.props.getUser.user) {
      if (this.lastMsg) {
        this.scrollDown();
      }
    }

    // drawer is closing
    if (prevProps.openDrawer && !this.props.openDrawer) {
      this.props.getUser.refetch();
    }
  }

  handleChange = (evt) => {
    clearTimeout(this.keepTying);

    const { selectedUser, socket, user } = this.props;
    const data = {
      recipientId: selectedUser,
      userId: user.id,
    }

    this.setState({ content: evt.target.value }, () => {
      socket.emit('SEND_TYPING', data)
      this.keepTying = setTimeout(() => {
        socket.emit('STOP_TYPING', data);
      }, 3000);
    });
  }

  scrollDown = () => {
    this.lastMsg.scrollIntoView({ behavior: 'smooth' });
  }

  submit = (evt) => {
    evt.preventDefault();

    const {
      content,
    } = this.state;
    
    const {
      user,
      selectedUser,
      socket,
    } = this.props;

    const data = {
      recipientId: selectedUser,
      userId: user.id,
    }

    socket.emit('STOP_TYPING', data);

    this.setState({
      content: '',
    }, async () => {
      const result = await this.props.mutate({
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
            }
          }
        ]
      });
      this.props.socket.emit('SEND_MESSAGE', { message: result })
    });
  }

  subscribe = () => {
    const { socket } = this.props;

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
        if (!this.state.friendTyping) {
          this.setState({ friendTyping: true }, () => {
            this.scrollDown();
          })
        }
      }
    })

    socket.on('RECEIVE_STOP_TYPING', data => {
      if (this.state.friendTyping) {
        this.setState({ friendTyping: false })
      }
    })
    
    socket.on('RECEIVE_MESSAGE', (data) => {
      const message = data.message.data.addMessage;
      const recipientId = message.recipient_id;
      const senderId = message.sender_id;
      const userId = this.props.user.id;
      const { selectedUser } = this.props;
      const senderMatch = senderId === selectedUser;
      const recipientMatch = Number(recipientId) === userId;

      // was sent to user
      if (senderMatch && recipientMatch) {
        this.props.getUser.refetch();
      }
    })
  }

  render() {
    const {
      content,
      friendTyping,
    } = this.state;
    const {
      openDrawer,
      selectedUser,
      user,
    } = this.props;

    const fetchedUser = this.props.getUser.user;
    const messages = fetchedUser ?
      fetchedUser.messages : [];
    const title = fetchedUser ?
      fetchedUser.first_name : 'Select A User';
    
    const typingMessage = friendTyping ? (
      <p className="typing-message">
        {`${title} is typing...`}
      </p>
    ) : null;

    return (
      <div className="Messenger">
        <div className={openDrawer ? 'overlay show' : 'overlay'}>
        </div>
        <h1>{title}</h1>
        <div className="messages" ref={this.messageWindow}>
          {messages.map((msg, index) => {
            const isSender = user.id === Number(msg.sender_id);
            const lastMsg = index === messages.length - 1;
            const messageClass = isSender ?
              'message sender' : 'message recipient';
            return (
              <div
                key={msg.id}
                className={messageClass}
                ref={lastMsg ? (el) => this.lastMsg = el : false}
              >
                {msg.content}
              </div>
            )
          })}
          {typingMessage}
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
            >
              <FontAwesome name="paper-plane" />
            </button>
          </div>
        </form>
      </div>
    )
  }
}

export default compose(
  graphql(addMessage),
  graphql(getUser, {
    name: 'getUser',
    options: props => ({
      variables: {
        id: props.selectedUser,
        // self is used to get messages between self and other user
        self: props.user.id,
      }
    })
  })
)(Messenger);
