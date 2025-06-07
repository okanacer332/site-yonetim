// server/server.js
const express = require('express');
const { ApolloServer } = require('apollo-server-express'); // gql artık burada değil
const mongoose = require('mongoose');

// Yeni yapımızdan typeDefs ve resolvers'ı import ediyoruz
const typeDefs = require('./graphql/typeDefs'); // Bu, typeDefs dizisini getirecek
const resolvers = require('./graphql/resolvers'); // Bu, birleştirilmiş resolver objesini getirecek

// --- AYARLAR ---
const PORT = process.env.PORT || 5005;
const MONGODB_URI = 'mongodb://localhost:27017/site_yonetim_db';

// --- Ana Sunucu Fonksiyonu ---
async function startServer() {
  const app = express();

  // 1. MongoDB'ye Bağlanma
  try {
    await mongoose.connect(MONGODB_URI); // Mongoose v6+ için opsiyonlar gerekmiyor
    console.log(`✅ MongoDB bağlantısı başarılı! Veritabanı: ${MONGODB_URI}`);
  } catch (err) {
    console.error('❌ MongoDB bağlantı hatası:', err.message);
    process.exit(1);
  }

  // 2. Apollo GraphQL Sunucusunu Oluşturma
  // Artık typeDefs ve resolvers'ı dışarıdan alıyoruz
  const apolloServer = new ApolloServer({
    typeDefs,  // typeDefs/index.js'ten gelen dizi
    resolvers, // resolvers/index.js'ten gelen obje
    // context, plugins vb. eklenebilir
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: '/graphql' }); // path'i belirtmek iyi bir pratiktir

  // Basit bir Express test endpoint'i (isteğe bağlı, kaldırılabilir)
  app.get('/express-test', (req, res) => {
    res.send('Express sunucusu temel olarak çalışıyor!');
  });

  // 3. Express Sunucusunu Dinlemeye Başla
  app.listen(PORT, () => {
    console.log(`🚀 Backend sunucusu http://localhost:${PORT} adresinde çalışıyor.`);
    console.log(`GraphQL Playground http://localhost:${PORT}${apolloServer.graphqlPath} adresinde hazır.`);
  });
}

// Sunucuyu başlat
startServer();