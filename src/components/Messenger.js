import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';

import { addMessage, getUser, getUsers } from '../queries/';

class Messenger extends Component {
  constructor(props) {
    super(props);

    this.state = {
      content: '',
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selectedUser !== this.props.selectedUser) {
      this.getMessages(this.props.selectedUser);
    }
  }

  getMessages = (id) => {
    
  }

  handleChange = (evt) => {
    this.setState({ content: evt.target.value });
  }

  submit = (evt) => {
    evt.preventDefault();

    const {
      content,
      recipientId,
      senderId,
    } = this.state;
    const {
      user,
      selectedUser,
    } = this.props;

    this.props.mutate({
      variables: {
        content,
        recipient_id: selectedUser,
        sender_id: user.id,
      },
      refetchQueries: [
        {
          query: getUsers,
          variables: { id: user.id },
        },
        {
          query: getUser,
          variables: {
            id: selectedUser,
            self: user.id,
          }
        }
      ]
    });
    this.setState({ content: '' })
  }

  render() {
    const { content } = this.state;
    const { selectedUser, user } = this.props;
    const fetchedUser = this.props.getUser.user;
    const messages = fetchedUser ?
      fetchedUser.messages : [];

    console.log('MESSAGES', messages);

    return (
      <div className="Messenger">
        <h1>Messenger</h1>
        <div className="messages">
          {messages.map(msg => {
            const isSender = user.id === Number(msg.sender_id);
            console.log('IS SENDER', isSender);
            const messageClass = isSender ?
              'message sender' : 'message recipient';
            return (
              <div
                key={msg.id}
                className={messageClass}
              >
                {msg.content}
              </div>
            )
          })}
        </div>
        <form
          onSubmit={evt => this.submit(evt)}
        >
          <div className="message-input">
            <input
              placeholder="Type your message here..."
              onChange={evt => this.handleChange(evt)}
              value={content}
            />
            <button
              disabled={!selectedUser}
            >
              Send
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
