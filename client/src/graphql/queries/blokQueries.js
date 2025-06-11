// client/src/graphql/queries/blokQueries.js
import { gql } from '@apollo/client';

export const GET_BLOKS = gql`
  query GetBloks {
    getBloks {
      id
      name
      address   # Bu alanı DataGrid'de göstermeseniz bile backend'den gelebilir.
      createdAt # <-- BU ALANIN BURADA OLMASI ÇOK ÖNEMLİ!
    }
  }
`;

// İleride eklenebilecek diğer blok sorguları:
// export const GET_BLOK_BY_ID = gql`
//   query GetBlokById($id: ID!) {
//     getBlokById(id: $id) {
//       id
//       name
//       address
//       createdAt
//     }
//   }
// `;