import { gql } from 'apollo-boost';

const getUsers = gql`
  query($id: ID) {
    users {
      id
      first_name
      last_name
      messages(id: $id) {
        content
      }
      last_message(id: $id) {
        content
      }
    }
  }
`;

const getUser = gql`
  query($id: ID, $self: ID) {
    user(id: $id) {
      id
      first_name
      last_name
      messages(id: $self) {
        id
        content
        recipient_id
        sender_id
        timestamp
        read
      }
    }
  }
`;

const addMessage = gql`
  mutation($content: String!, $sender_id: ID!, $recipient_id: ID!) {
    addMessage(content: $content, sender_id: $sender_id, recipient_id: $recipient_id) {
      id
      content
      sender_id
      recipient_id
      read
      timestamp
    }
  }
`;

const myUnreadMessages = gql`
  query($id: ID!) {
    myUnreadMessages(id: $id) {
      sender_id
    }
  }
`;

const readMessages = gql`
  mutation($recipient_id: ID!, $sender_id: ID!) {
    readMessages(recipient_id: $recipient_id, sender_id: $sender_id) {
      id
    }
  }
`;

export default {
  addMessage,
  getUsers,
  getUser,
  myUnreadMessages,
  readMessages,
}
