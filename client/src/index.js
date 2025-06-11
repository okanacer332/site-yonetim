// client/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Genel CSS dosyanız
import App from './App'; // Ana App bileşeniniz
import reportWebVitals from './reportWebVitals';

// Apollo Client için gerekli importlar
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider
} from "@apollo/client";

// React Router için BrowserRouter importu
import { BrowserRouter } from 'react-router-dom';

// Apollo Client instance'ını oluşturalım
const client = new ApolloClient({
  uri: 'http://localhost:5005/graphql', // Backend GraphQL endpoint'iniz
  cache: new InMemoryCache()
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* React Router için BrowserRouter ile sarmalıyoruz */}
      <ApolloProvider client={client}> {/* ApolloProvider BrowserRouter'ın içinde veya dışında olabilir, genellikle bu sıra iyidir */}
        <App />
      </ApolloProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();