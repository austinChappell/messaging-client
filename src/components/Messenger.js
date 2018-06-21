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
      ]
    });
    this.setState({ content: '' })
  }

  render() {
    console.log('MESSENGER PROPS', this.props);
    const { content } = this.state;
    const { selectedUser } = this.props;

    return (
      <div className="Messenger">
        <h1>Messenger</h1>
        <div className="messages">

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
