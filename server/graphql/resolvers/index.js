// server/graphql/resolvers/index.js
const { merge } = require('lodash'); // Daha güvenli birleştirme için lodash.merge kullanalım
                                     // terminalde: npm install lodash

const blokResolvers = require('./blokResolvers');
const sakinResolvers = require('./sakinResolvers');
const daireResolvers = require('./daireResolvers');
const ikametResolvers = require('./ikametResolvers');
const aidatResolvers = require('./aidatResolvers');

// deepmerge yerine lodash.merge kullanmak daha yaygın ve güvenilirdir.
// Tüm resolver objelerini birleştiriyoruz.
const resolvers = merge(
  blokResolvers,
  sakinResolvers,
  daireResolvers,
  ikametResolvers,
  aidatResolvers
);

module.exports = resolvers;