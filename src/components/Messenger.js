import React, { Component } from 'react';
import { graphql } from 'react-apollo';

import { addMessage } from '../queries/';

class Messenger extends Component {
  state = {
    content: '',
    recipientId: 2,
    senderId: 5,
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
    this.props.mutate({
      variables: {
        content,
        recipient_id: recipientId,
        sender_id: senderId,
      }
    })
  }

  render() {
    const { content } = this.state;

    return (
      <div className="Messenger">
        <h1>Messenger</h1>
        <div className="messages">

        </div>
        <form
          onSubmit={evt => this.submit(evt)}
        >
          <input
            placeholder="Type your message here..."
            onChange={evt => this.handleChange(evt)}
            value={content}
          />
          <button>Send</button>
        </form>
      </div>
    )
  }
}

export default graphql(addMessage)(Messenger);
