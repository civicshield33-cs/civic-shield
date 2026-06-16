import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "EMERGENCY_CONTACTS";

type Contact = {
  id: string;
  name: string;
  phone: string;
};

type ContactStore = {
  contacts: Contact[];
  loadContacts: () => Promise<void>;
  addContact: (c: Contact) => Promise<void>;
  removeContact: (id: string) => Promise<void>;
};

export const useContactStore = create<ContactStore>((set, get) => ({
  contacts: [],

  loadContacts: async () => {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) {
      set({ contacts: JSON.parse(saved) });
    }
  },

  addContact: async (c) => {
    const updated = [...get().contacts, c];
    set({ contacts: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  removeContact: async (id) => {
    const updated = get().contacts.filter((c) => c.id !== id);
    set({ contacts: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },
}));