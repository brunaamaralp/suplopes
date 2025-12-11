import { supabase } from '../lib/supabase';

const apiBase: string = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

const request = async (path: string, options?: RequestInit): Promise<any> => {
  // Obter token da sessão atual
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(`${apiBase}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    ...options,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch { }
  if (!res.ok) {
    const err: any = new Error((data && (data.error || data.message)) || `HTTP ${res.status}`);
    err.code = data && data.code;
    err.status = res.status;
    err.errors = data && data.errors;
    throw err;
  }
  return data;
};

export const get = async (path: string): Promise<any> => request(path);
export const post = async (path: string, body: any): Promise<any> => request(path, { method: 'POST', body: JSON.stringify(body) });
export const put = async (path: string, body: any): Promise<any> => request(path, { method: 'PUT', body: JSON.stringify(body) });
export const del = async (path: string): Promise<any> => request(path, { method: 'DELETE' });

