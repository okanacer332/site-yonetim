// server/graphql/typeDefs/daireTypeDefs.js
const { gql } = require('apollo-server-express');

const daireTypeDefs = gql`
  type Daire {
    id: ID!
    blok: Blok
    daireNo: String!
    kat: Int!
    evSahibi: Sakin
    mevcutSakin: Sakin
    
    # DÜZELTME: Bu alanın da boş olabilmesine izin veriyoruz.
    durum: String 
    
    createdAt: String
    updatedAt: String
  }

  input CreateDaireInput {
    blok: ID!
    daireNo: String!
    kat: Int!
    evSahibi: ID!
    durum: String!
    kiraci: ID
  }

  input UpdateDaireInput {
    blok: ID
    daireNo: String
    kat: Int
    evSahibi: ID
    durum: String
    kiraci: ID
  }

  extend type Query {
    getDaireler(blokId: ID): [Daire]
    getDaire(id: ID!): Daire
  }

  extend type Mutation {
    createDaire(input: CreateDaireInput!): Daire
    updateDaire(id: ID!, input: UpdateDaireInput!): Daire
    deleteDaire(id: ID!): DeleteResponse
  }
`;

module.exports = daireTypeDefs;