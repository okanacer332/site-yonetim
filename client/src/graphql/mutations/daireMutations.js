// client/src/graphql/mutations/daireMutations.js
import { gql } from '@apollo/client';

export const CREATE_DAIRE = gql`
  mutation CreateDaire($input: CreateDaireInput!) {
    createDaire(input: $input) {
      id
      daireNo
    }
  }
`;

export const UPDATE_DAIRE = gql`
  mutation UpdateDaire($id: ID!, $input: UpdateDaireInput!) {
    updateDaire(id: $id, input: $input) {
      id
      daireNo
      kat
      durum
      blok { id name }
      evSahibi { id adSoyad }
      mevcutSakin { id adSoyad }
    }
  }
`;

export const DELETE_DAIRE = gql`
  mutation DeleteDaire($id: ID!) {
    deleteDaire(id: $id) {
      success
      message
      id
    }
  }
`;