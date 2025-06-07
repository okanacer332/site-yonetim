// server/graphql/typeDefs/ikametTypeDefs.js
const { gql } = require('apollo-server-express');

const ikametTypeDefs = gql`
  type Ikamet {
    id: ID!
    daire: Daire!
    sakin: Sakin!
    rol: String! # 'Ev Sahibi' veya 'Kiracı'
    baslangicTarihi: String!
    bitisTarihi: String # Boş ise, hala orada oturuyor
  }

  extend type Query {
    getIkametGecmisi(daireId: ID!): [Ikamet]
  }

  extend type Mutation {
    # Bir sakini daireye yerleştirme (taşınma) işlemi
    yerlesimEkle(daireId: ID!, sakinId: ID!, rol: String!): Ikamet

    # Bir sakinin ikametini sonlandırma (taşınma) işlemi
    yerlesimBitir(ikametId: ID!, bitisTarihi: String!): Ikamet
  }
`;

module.exports = ikametTypeDefs;