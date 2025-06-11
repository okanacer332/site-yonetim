// client/src/graphql/queries/daireQueries.js
import { gql } from '@apollo/client';

// Bu sorgu, sunucudaki yeni ve doğru veri yapısını istiyor.
export const GET_DAIRELER = gql`
  query GetDaireler($blokId: ID) {
    getDaireler(blokId: $blokId) {
      # Daire'nin kendi temel alanları
      id
      daireNo
      kat
      durum
      createdAt
      updatedAt # Bu alanı da isteyelim, ileride lazım olabilir
      
      # İlişkili Blok objesi ve onun alanları
      blok {
        id
        name
      }

      # İlişkili Ev Sahibi (Sakin) objesi ve onun alanları
      evSahibi {
        id
        adSoyad
      }
      
      # HESAPLANMIŞ Mevcut Sakin (Sakin) objesi ve onun alanları
      # 'sakinAdiSoyadi' YERİNE ARTIK BU YAPIYI KULLANIYORUZ
      mevcutSakin {
        id
        adSoyad
        telefon
      }
    }
  }
`;