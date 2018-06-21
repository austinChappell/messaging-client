import { gql } from 'apollo-boost';

export const getUsers = gql`
  {
    users {
      id
      first_name
      last_name
    }
  }
`;

export const getUser = gql`
  query($id: ID) {
    user(id: $id) {
      id
      first_name
      last_name
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