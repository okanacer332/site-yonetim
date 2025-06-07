// server/graphql/typeDefs/index.js
const rootTypeDefs = require('./rootTypeDefs');
const blokTypeDefs = require('./blokTypeDefs');
const sakinTypeDefs = require('./sakinTypeDefs'); // Yeni
const daireTypeDefs = require('./daireTypeDefs');   // Güncellendi
const ikametTypeDefs = require('./ikametTypeDefs'); // Yeni
const aidatTypeDefs = require('./aidatTypeDefs');   // Yeni

const typeDefs = [
  rootTypeDefs,
  blokTypeDefs,
  sakinTypeDefs,
  daireTypeDefs,
  ikametTypeDefs,
  aidatTypeDefs,
];

module.exports = typeDefs;