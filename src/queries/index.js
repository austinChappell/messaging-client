import { gql } from 'apollo-boost';

export const getUsers = gql`
  query($id: ID) {
    users {
      id
      first_name
      last_name
      messages(id: $id) {
        id
        content
      }
      last_message(id: $id) {
        content
      }
    }
  }
`;

export const getUser = gql`
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

export const addMessage = gql`
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