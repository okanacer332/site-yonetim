import { useState, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:8080/api';

// GÜNCELLEME 1: API hatalarını merkezi olarak işleyecek bir yardımcı fonksiyon ekliyoruz.
const handleApiError = async (response: Response) => {
  try {
    // Sunucudan gelen JSON formatındaki hatayı okumaya çalış.
    const errorData = await response.json();
    // Eğer bizim GlobalExceptionHandler'ımızın gönderdiği 'message' alanı varsa, onu kullan.
    if (errorData && errorData.message) {
      throw new Error(errorData.message);
    }
    // JSON'da message yoksa veya JSON formatında değilse, genel bir HTTP hatası fırlat.
    throw new Error(`Sunucu Hatası: ${response.status} ${response.statusText}`);
  } catch (e) {
    // Yukarıdaki try bloğunda bir hata olursa (örn: JSON parse hatası),
    // ilk hatayı (eğer anlamlıysa) veya genel bir hata fırlat.
    if (e instanceof Error) {
       throw e;
    }
    throw new Error(`Bilinmeyen bir ağ hatası oluştu.`);
  }
};


interface UseCrudApi<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  fetchData: () => void;
  addItem: (item: Omit<T, 'id'>) => Promise<T>;
  updateItem: (id: string, item: Partial<T>) => Promise<T>;
  deleteItem: (id: string) => Promise<void>;
}

export function useCrudApi<T extends { id: string }>(endpoint: string): UseCrudApi<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fullUrl = `${API_BASE_URL}${endpoint}`;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(fullUrl);
      if (!response.ok) {
        // GÜNCELLEME 2: Genel hata yerine yeni yardımcı fonksiyonumuzu kullanıyoruz.
        return await handleApiError(response);
      }
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [fullUrl]);

  const addItem = async (item: Omit<T, 'id'>): Promise<T> => {
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!response.ok) {
        // GÜNCELLEME 3: Tüm API çağrılarında merkezi hata yöneticisini kullanıyoruz.
        return await handleApiError(response);
    }
    fetchData(); 
    return response.json();
  };

  const updateItem = async (id: string, item: Partial<T>): Promise<T> => {
    const response = await fetch(`${fullUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!response.ok) {
        return await handleApiError(response);
    }
    fetchData();
    return response.json();
  };

  const deleteItem = async (id: string): Promise<void> => {
    const response = await fetch(`${fullUrl}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
        return await handleApiError(response);
    }
    fetchData();
  };

  return { data, isLoading, error, fetchData, addItem, updateItem, deleteItem };
}