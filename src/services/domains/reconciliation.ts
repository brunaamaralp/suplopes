import { supabase } from '../../lib/supabase';
import { Reconciliation } from '../../types';

export const listCorrections = async (params?: { 
  bankAccountId?: string; 
  start?: string; 
  end?: string 
}): Promise<Reconciliation[]> => {
  let query = supabase
    .from('Reconciliation')
    .select('*')
    .order('date', { ascending: false });

  if (params?.bankAccountId) {
    query = query.eq('bankAccountId', Number(params.bankAccountId));
  }
  if (params?.start) {
    query = query.gte('date', params.start);
  }
  if (params?.end) {
    query = query.lte('date', params.end);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error loading reconciliations:', error);
    throw error;
  }

  return (data || []).map((c: any) => ({
    ...c,
    id: c.id ? String(c.id) : undefined,
    bankAccountId: String(c.bankAccountId),
    date: typeof c.date === 'string' ? c.date.split('T')[0] : c.date,
  }));
};

export const saveCorrection = async (c: Reconciliation): Promise<Reconciliation> => {
  const payload = {
    date: c.date,
    bankAccountId: Number(c.bankAccountId),
    systemBalance: c.systemBalance,
    bankBalance: c.bankBalance,
    difference: c.difference || null,
    status: c.status || null,
    notes: c.notes || null,
  };

  const { data, error } = await supabase
    .from('Reconciliation')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error creating reconciliation:', error);
    throw error;
  }

  return {
    ...data,
    id: String(data.id),
    bankAccountId: String(data.bankAccountId),
    date: data.date ? data.date.split('T')[0] : data.date,
  };
};

export const updateCorrection = async (id: string, c: Reconciliation): Promise<Reconciliation> => {
  const payload = {
    date: c.date,
    bankAccountId: Number(c.bankAccountId),
    systemBalance: c.systemBalance,
    bankBalance: c.bankBalance,
    difference: c.difference || null,
    status: c.status || null,
    notes: c.notes || null,
  };

  const { data, error } = await supabase
    .from('Reconciliation')
    .update(payload)
    .eq('id', Number(id))
    .select()
    .single();

  if (error) {
    console.error('Error updating reconciliation:', error);
    throw error;
  }

  return {
    ...data,
    id: String(data.id),
    bankAccountId: String(data.bankAccountId),
    date: data.date ? data.date.split('T')[0] : data.date,
  };
};
