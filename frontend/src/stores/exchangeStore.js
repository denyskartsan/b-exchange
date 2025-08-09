import { create } from 'zustand';
import { exchangeAPI } from '../utils/api';

export const useExchangeStore = create((set, get) => ({
  receivedExchanges: [],
  sentExchanges: [],
  isLoading: false,
  responseLoading: false,
  error: null,

  // Fetch received exchanges
  fetchReceivedExchanges: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await exchangeAPI.getReceived();
      set({ receivedExchanges: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Fetch sent exchanges
  fetchSentExchanges: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await exchangeAPI.getSent();
      set({ sentExchanges: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Fetch all exchanges (both received and sent)
  fetchAllExchanges: async () => {
    set({ isLoading: true, error: null });
    try {
      const [receivedResponse, sentResponse] = await Promise.all([
        exchangeAPI.getReceived(),
        exchangeAPI.getSent()
      ]);

      set({
        receivedExchanges: receivedResponse.data,
        sentExchanges: sentResponse.data,
        isLoading: false
      });

      return {
        received: receivedResponse.data,
        sent: sentResponse.data
      };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Create new exchange request
  createExchange: async (exchangeData) => {
    set({ error: null });
    try {
      const response = await exchangeAPI.create(exchangeData);
      const newExchange = response.data;
      
      // Add to sent exchanges
      set(state => ({
        sentExchanges: [newExchange, ...state.sentExchanges]
      }));
      
      return newExchange;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Respond to exchange request (accept/decline)
  respondToExchange: async (exchangeId, action) => {
    set({ responseLoading: true, error: null });
    try {
      const response = await exchangeAPI.respond(exchangeId, action);
      
      // After successful response, refetch both received and sent exchanges
      // to ensure we have properly populated book data
      const [receivedResponse, sentResponse] = await Promise.all([
        exchangeAPI.getReceived(),
        exchangeAPI.getSent()
      ]);
      
      set({
        receivedExchanges: receivedResponse.data,
        sentExchanges: sentResponse.data,
        responseLoading: false
      });
      
      return response.data;
    } catch (error) {
      set({ error: error.message, responseLoading: false });
      throw error;
    }
  },

  // Get pending received exchanges count
  getPendingReceivedCount: () => {
    const { receivedExchanges } = get();
    return receivedExchanges.filter(exchange => exchange.status === 'pending').length;
  },

  // Get pending sent exchanges count
  getPendingSentCount: () => {
    const { sentExchanges } = get();
    return sentExchanges.filter(exchange => exchange.status === 'pending').length;
  },

  // Get exchange by ID
  getExchangeById: (exchangeId) => {
    const { receivedExchanges, sentExchanges } = get();
    return receivedExchanges.find(ex => ex.id === exchangeId) ||
           sentExchanges.find(ex => ex.id === exchangeId);
  },

  // Clear error state
  clearError: () => {
    set({ error: null });
  },

  // Reset store
  reset: () => {
    set({
      receivedExchanges: [],
      sentExchanges: [],
      isLoading: false,
      responseLoading: false,
      error: null
    });
  }
}));
