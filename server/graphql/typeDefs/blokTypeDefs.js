// server/graphql/typeDefs/blokTypeDefs.js
const { gql } = require('apollo-server-express');

const blokTypeDefs = gql`
  type Blok {
    id: ID!
    name: String!
    address: String
    createdAt: String
  }

  # DeleteBlokResponse tanımı buradan kaldırıldı.

  extend type Query {
    getBloks: [Blok]
  }

  extend type Mutation {
    createBlok(name: String!): Blok
    updateBlok(id: ID!, name: String!): Blok
    # deleteBlok artık ortak 'DeleteResponse' tipini döndürüyor
    deleteBlok(id: ID!): DeleteResponse 
  }
`;

module.exports = blokTypeDefs;