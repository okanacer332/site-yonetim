// client/src/graphql/mutations/ikametMutations.js
import { gql } from '@apollo/client';

export const YERLESIM_EKLE = gql`
  mutation YerlesimEkle($daireId: ID!, $sakinId: ID!, $rol: String!) {
    yerlesimEkle(daireId: $daireId, sakinId: $sakinId, rol: $rol) {
      id
      rol
      sakin { id adSoyad }
    }
  }
`;