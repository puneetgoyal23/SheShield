import { create } from 'zustand';
import axiosInstance from '../services/api/axiosInstance';

const useContactStore = create((set, get) => ({
  contacts: [],
  isLoading: false,
  error: null,
  isModalOpen: false,

  setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),

  fetchContacts: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get('/contacts');
      set({ contacts: res.data?.contacts || [], isLoading: false });
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
      set({ error: 'Failed to load contacts', isLoading: false });
    }
  },

  addContact: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.post('/contacts', payload);
      const newContact = res.data?.contact;
      if (newContact) {
        set((state) => ({ contacts: [...state.contacts, newContact] }));
      }
      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      console.error('Failed to add contact:', err);
      const msg = err.response?.data?.message || 'Failed to add contact';
      set({ error: msg, isLoading: false });
      return { success: false, message: msg };
    }
  },

  updateContact: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.patch(`/contacts/${id}`, payload);
      const updatedContact = res.data?.contact;
      if (updatedContact) {
        set((state) => ({
          contacts: state.contacts.map((c) => (c._id === id ? updatedContact : c)),
        }));
      }
      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      console.error('Failed to update contact:', err);
      const msg = err.response?.data?.message || 'Failed to update contact';
      set({ error: msg, isLoading: false });
      return { success: false, message: msg };
    }
  },

  deleteContact: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.delete(`/contacts/${id}`);
      set((state) => ({
        contacts: state.contacts.filter((c) => c._id !== id),
      }));
      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      console.error('Failed to delete contact:', err);
      const msg = err.response?.data?.message || 'Failed to delete contact';
      set({ error: msg, isLoading: false });
      return { success: false, message: msg };
    }
  },
}));

export default useContactStore;
