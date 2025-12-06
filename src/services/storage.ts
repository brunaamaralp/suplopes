const APP_KEY = "finance_app_v1";

export const StorageService = {
  keys: {
    TRANSACTIONS: `${APP_KEY}_transactions`,
    CATEGORIES: `${APP_KEY}_categories`,
    ACCOUNTS: `${APP_KEY}_accounts`,
    BALANCE_CORRECTIONS: `${APP_KEY}_balance_corrections`,
    SETTINGS: `${APP_KEY}_settings`,
  },

  save(key: string, data: any) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error("Erro ao salvar no localStorage", e);
    }
  },

  load(key: string, defaultValue: any) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error("Erro ao carregar do localStorage", e);
      return defaultValue;
    }
  },
};
