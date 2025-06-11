// client/src/graphql/mutations/blokMutations.js
import { gql } from '@apollo/client';

export const CREATE_BLOK = gql`
  mutation CreateBlok($name: String!) {
    createBlok(name: $name) {
      id
      name
      address # Modelde olduğu için döndürülebilir
      createdAt # Oluşturulma tarihi döndürülüyor
    }
  }
`;

export const UPDATE_BLOK = gql`
  mutation UpdateBlok($id: ID!, $name: String!) {
    updateBlok(id: $id, name: $name) {
      id
      name
      address
      createdAt
    }
  }
`;

export const DELETE_BLOK = gql`
  mutation DeleteBlok($id: ID!) {
    deleteBlok(id: $id) {
      success
      message
      id
    }
  }
`;