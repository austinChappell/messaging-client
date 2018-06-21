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