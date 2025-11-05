import { api } from '@/lib/api';
import { create, type StateCreator } from 'zustand';

export type VaultItem = {
  id: string;
  siteName: string;
  username: string;
  password?: string;  // decrypted, in-memory only
  notes?: string;     // decrypted, in-memory only
};

type VaultState = {
  items: VaultItem[];
  loading: boolean;
  error: string | null;
  fetchList: () => Promise<void>;
  addItem: (body: { siteName: string; username: string; password: string; notes?: string }) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  updateItem: (id: string, body: Partial<VaultItem>) => Promise<void>;
  getById: (id: string) => VaultItem | undefined;
};

const creator: StateCreator<VaultState> = (set, get) => ({
  items: [],
  loading: false,
  error: null,

  // GET ALL ITEMS (decrypted by backend)
  fetchList: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/api/vault');
      const items = (res.data || []).map((item: any) => ({
        ...item,
        id: item.id || item._id,
      }));
      set({ items });
    } catch (e: any) {
      set({ error: e?.response?.data?.message || 'Failed to load vault' });
    } finally {
      set({ loading: false });
    }
  },

  // ✅ ADD ITEM (no need to refetch)
  addItem: async (body) => {
    const res = await api.post('/api/vault', body);
    const { itemId } = res.data;

    const newItem: VaultItem = {
      id: itemId,
      ...body, // keep decrypted values in memory
    };

    set({ items: [...get().items, newItem] });
  },

  deleteItem: async (id) => {
    await api.delete(`/api/vault/${id}`);
    set({ items: get().items.filter((i) => i.id !== id) });
  },

  // UPDATE ITEM → refresh list because decryption needed again
  updateItem: async (id, body) => {
    await api.put(`/api/vault/${id}`, body);
    await get().fetchList();
  },

  getById: (id) => get().items.find((i) => i.id === id),
});

export const useVaultStore = create<VaultState>(creator);
