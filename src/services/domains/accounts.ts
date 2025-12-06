import { supabase } from '../../lib/supabase';
import { Account } from '../../types';

export const listAccounts = async (): Promise<Account[]> => {
  const { data, error } = await supabase
    .from('Account')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error loading accounts:', error);
    throw error;
  }

  return (data || []).map((a: any) => ({
    id: String(a.id),
    name: a.name,
    initialBalance: typeof a.balance === 'number' ? a.balance : 0,
  }));
};

export const saveAccount = async (a: Account): Promise<Account> => {
  const isExisting = !isNaN(Number(a.id)) && Number(a.id) > 0;

  if (isExisting) {
    // Update existing account
    const { data, error } = await supabase
      .from('Account')
      .update({
        name: a.name,
        balance: a.initialBalance || 0,
      })
      .eq('id', Number(a.id))
      .select()
      .single();

    if (error) {
      console.error('Error updating account:', error);
      throw error;
    }

    return {
      id: String(data.id),
      name: data.name,
      initialBalance: data.balance || 0,
    };
  } else {
    // Insert new account
    const { data, error } = await supabase
      .from('Account')
      .insert({
        name: a.name,
        balance: a.initialBalance || 0,
        type: 'conta_corrente',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating account:', error);
      throw error;
    }

    return {
      id: String(data.id),
      name: data.name,
      initialBalance: data.balance || 0,
    };
  }
};

export const deleteAccount = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('Account')
    .delete()
    .eq('id', Number(id));

  if (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};
