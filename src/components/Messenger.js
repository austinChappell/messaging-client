import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';

import { addMessage, getUser, getUsers } from '../queries/';

class Messenger extends Component {
  constructor(props) {
    super(props);
    this.messageWindow = React.createRef();

    this.state = {
      content: '',
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.getUser.user !== this.props.getUser.user) {
      if (this.lastMsg) {
        this.scrollDown();
      }
    }
  }

  getMessages = (id) => {
    
  }

  handleChange = (evt) => {
    this.setState({ content: evt.target.value });
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
    const title = fetchedUser ?
      fetchedUser.first_name : 'Select A User';

    return (
      <div className="Messenger">
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
