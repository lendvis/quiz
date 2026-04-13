let token: string | null = null;

export const setToken = (value: string) => {
  token = value;
};

export const getToken = () => token;

export const clearToken = () => {
  token = null;
};
