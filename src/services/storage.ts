const APP_KEY = "finance_app_v1";

// Armazena o userId atual para prefixar as chaves
let currentUserId: string | null = null;

// Gera a chave com prefixo do usuário
const getUserKey = (baseKey: string) => {
  if (!currentUserId) {
    return baseKey; // Fallback para chave sem prefixo (não deveria acontecer em prod)
  }
  return `${baseKey}_user_${currentUserId}`;
};

export const StorageService = {
  keys: {
    TRANSACTIONS: `${APP_KEY}_transactions`,
    CATEGORIES: `${APP_KEY}_categories`,
    ACCOUNTS: `${APP_KEY}_accounts`,
    BALANCE_CORRECTIONS: `${APP_KEY}_balance_corrections`,
    SETTINGS: `${APP_KEY}_settings`,
  },

  // Define o userId atual (chamado no login)
  setUserId(userId: string | null) {
    currentUserId = userId;
  },

  // Retorna o userId atual
  getUserId() {
    return currentUserId;
  },

  save(key: string, data: any) {
    try {
      const userKey = getUserKey(key);
      localStorage.setItem(userKey, JSON.stringify(data));
    } catch (e) {
      console.error("Erro ao salvar no localStorage", e);
    }
  },

  load(key: string, defaultValue: any) {
    try {
      const userKey = getUserKey(key);
      const item = localStorage.getItem(userKey);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error("Erro ao carregar do localStorage", e);
      return defaultValue;
    }
  },

  // Limpa todos os dados do usuário atual do localStorage
  clearUserData() {
    if (!currentUserId) return;

    const keysToRemove: string[] = [];
    const suffix = `_user_${currentUserId}`;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(suffix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`[StorageService] Limpou ${keysToRemove.length} itens do cache do usuário`);
  },

  // Limpa todas as chaves do app (para migração de dados antigos)
  clearAllAppData() {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(APP_KEY)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`[StorageService] Limpou ${keysToRemove.length} itens do cache do app`);
  },
};
