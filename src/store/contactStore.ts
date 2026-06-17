import { create } from "zustand";
import {
  loadContactsFromCloud,
  syncContactsToCloud,
} from "../services/contactService";

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
    const contacts = await loadContactsFromCloud();
    set({ contacts });
  },

  addContact: async (c) => {
    const updated = [...get().contacts, c];
    set({ contacts: updated });
    await syncContactsToCloud(updated);
  },

  removeContact: async (id) => {
    const updated = get().contacts.filter((c) => c.id !== id);
    set({ contacts: updated });
    await syncContactsToCloud(updated);
  },
}));