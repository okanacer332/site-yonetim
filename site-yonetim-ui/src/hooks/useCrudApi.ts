import { useState, useCallback } from 'react';

// API'nin temel URL'sini merkezi bir yerden yönetiyoruz.
const API_BASE_URL = 'http://localhost:8080/api';

// Bu hook'un dışarıya döndüreceği değerlerin ve fonksiyonların tip tanımı.
interface UseCrudApi<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  fetchData: () => void;
  addItem: (item: Omit<T, 'id'>) => Promise<T>;
  updateItem: (id: string, item: Partial<T>) => Promise<T>;
  deleteItem: (id: string) => Promise<void>;
}

// T: Jenerik bir tip, bu sayede hook'u hem Blok, hem Daire, hem de diğer modellerle kullanabiliriz.
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
      if (!response.ok) throw new Error('Veri çekilemedi.');
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
    if (!response.ok) throw new Error('Öğe eklenemedi.');
    fetchData(); // Listeyi güncelle
    return response.json();
  };

  const updateItem = async (id: string, item: Partial<T>): Promise<T> => {
    const response = await fetch(`${fullUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error('Öğe güncellenemedi.');
    fetchData(); // Listeyi güncelle
    return response.json();
  };

  const deleteItem = async (id: string): Promise<void> => {
    const response = await fetch(`${fullUrl}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Öğe silinemedi.');
    fetchData(); // Listeyi güncelle
  };

  return { data, isLoading, error, fetchData, addItem, updateItem, deleteItem };
}
