// client/src/graphql/queries/sakinQueries.js
import { gql } from '@apollo/client';

export const GET_SAKINLER = gql`
  query GetSakinler {
    getSakinler {
      id
      adSoyad
      telefon
      email
      tcNo
      notlar
    }
  }
`;