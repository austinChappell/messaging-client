import React, { Component } from 'react';
import { graphql } from 'react-apollo';

import { addMessage } from '../queries/';

class Messenger extends Component {
  constructor(props) {
    super(props);

    this.state = {
      content: '',
    }
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
      }
    })
  }

  render() {
    console.log('MESSENGER STATE', this.state);
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
        </form>
      </div>
    )
  }
}

export default graphql(addMessage)(Messenger);
