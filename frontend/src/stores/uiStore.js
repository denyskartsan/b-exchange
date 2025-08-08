import { create } from 'zustand';

export const useUIStore = create((set, get) => ({
  // Loading states
  globalLoading: false,
  
  // Modal states
  modals: {},
  
  // Notification state
  notifications: [],
  
  // Theme state
  theme: 'light',
  
  // Mobile menu state
  isMobileMenuOpen: false,

  // Global loading actions
  setGlobalLoading: (loading) => {
    set({ globalLoading: loading });
  },

  // Modal actions
  openModal: (modalName, data = null) => {
    set(state => ({
      modals: {
        ...state.modals,
        [modalName]: { isOpen: true, data }
      }
    }));
  },

  closeModal: (modalName) => {
    set(state => ({
      modals: {
        ...state.modals,
        [modalName]: { isOpen: false, data: null }
      }
    }));
  },

  isModalOpen: (modalName) => {
    const { modals } = get();
    return modals[modalName]?.isOpen || false;
  },

  getModalData: (modalName) => {
    const { modals } = get();
    return modals[modalName]?.data || null;
  },

  // Notification actions
  addNotification: (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      duration: 4500,
      ...notification
    };

    set(state => ({
      notifications: [...state.notifications, newNotification]
    }));

    // Auto remove notification after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  },

  removeNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(notification => notification.id !== id)
    }));
  },

  clearAllNotifications: () => {
    set({ notifications: [] });
  },

  // Theme actions
  setTheme: (theme) => {
    set({ theme });
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
  },

  toggleTheme: () => {
    const { theme } = get();
    const newTheme = theme === 'light' ? 'dark' : 'light';
    get().setTheme(newTheme);
  },

  // Mobile menu actions
  openMobileMenu: () => {
    set({ isMobileMenuOpen: true });
  },

  closeMobileMenu: () => {
    set({ isMobileMenuOpen: false });
  },

  toggleMobileMenu: () => {
    set(state => ({ isMobileMenuOpen: !state.isMobileMenuOpen }));
  }
}));
