// client/src/graphql/mutations/sakinMutations.js
import { gql } from '@apollo/client';

export const CREATE_SAKIN = gql`
  mutation CreateSakin($input: SakinInput!) {
    createSakin(input: $input) { id, adSoyad }
  }
`;

export const UPDATE_SAKIN = gql`
  mutation UpdateSakin($id: ID!, $input: SakinInput!) {
    updateSakin(id: $id, input: $input) { id, adSoyad, telefon, email, tcNo, notlar }
  }
`;

export const DELETE_SAKIN = gql`
  mutation DeleteSakin($id: ID!) {
    deleteSakin(id: $id) {
      success
      message
    }
  }
`;