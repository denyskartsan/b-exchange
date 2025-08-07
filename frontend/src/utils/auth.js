const TOKEN_KEY = 'bookExchangeToken';

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const isTokenExpired = (token) => {
  try {
    const decoded = decodeToken(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};
