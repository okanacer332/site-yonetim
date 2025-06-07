// server/graphql/typeDefs/aidatTypeDefs.js
const { gql } = require('apollo-server-express');

const aidatTypeDefs = gql`
  type Aidat {
    id: ID!
    daire: Daire!
    borclu: Sakin! # Borcun atandığı kişi
    donem: String!
    tutar: Float!
    sonOdemeTarihi: String!
    odemeDurumu: String!
    odemeTarihi: String
    aciklama: String
  }

  extend type Query {
    # Filtrelerle aidatları getirme
    getAidatlar(donem: String, blokId: ID, odemeDurumu: String): [Aidat]
  }

  extend type Mutation {
    # Belirli bir dönem için tüm siteye aidat borcu oluşturma
    donemAidatiOlustur(donem: String!, tutar: Float!, sonOdemeTarihi: String!): [Aidat]

    # Tek bir aidat kaydının ödemesini işleme
    aidatOdemesiYap(aidatId: ID!, odemeTarihi: String!): Aidat
  }
`;

module.exports = aidatTypeDefs;