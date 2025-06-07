// server/graphql/typeDefs/rootTypeDefs.js
const { gql } = require('apollo-server-express');

const rootTypeDefs = gql`
  # Temel Query ve Mutation tipleri
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }

  # YENİ: Tüm silme işlemleri için ortak, yeniden kullanılabilir yanıt tipi
  type DeleteResponse {
    success: Boolean!
    message: String!
    id: ID
  }
`;

module.exports = rootTypeDefs;