// server/graphql/typeDefs/sakinTypeDefs.js
const { gql } = require('apollo-server-express');

const sakinTypeDefs = gql`
  type Sakin {
    id: ID!
    adSoyad: String!
    telefon: String
    email: String
    tcNo: String
    notlar: String
    createdAt: String
    updatedAt: String
  }

  input SakinInput {
    adSoyad: String!
    telefon: String
    email: String
    tcNo: String
    notlar: String
  }

  extend type Query {
    getSakinler: [Sakin]
    getSakin(id: ID!): Sakin
  }

  extend type Mutation {
    createSakin(input: SakinInput!): Sakin
    updateSakin(id: ID!, input: SakinInput!): Sakin
    deleteSakin(id: ID!): DeleteResponse
  }
`;

module.exports = sakinTypeDefs;