import { supabase } from '../../lib/supabase';
import { Transaction, MovementType } from '../../types';

export const listTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('Transaction')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error loading transactions:', error);
    throw error;
  }

  return (data || []).map((item: any) => ({
    ...item,
    id: String(item.id),
    categoryCode: String(item.categoryId),
    accountId: String(item.accountId),
    date: item.date ? item.date.split('T')[0] : item.date,
    type: ((): MovementType => {
      const t = String(item.type || '').toUpperCase();
      if (t === 'INCOME' || t === 'ENTRADA') return MovementType.INCOME;
      if (t === 'EXPENSE' || t === 'SAÍDA' || t === 'SAIDA') return MovementType.EXPENSE;
      if (t === 'TRANSFER' || t === 'TRANSFERÊNCIA' || t === 'TRANSFERENCIA') return MovementType.TRANSFER;
      return MovementType.EXPENSE;
    })(),
  }));
};

export const saveTransaction = async (t: Transaction): Promise<Transaction> => {
  const isExisting = !isNaN(Number(t.id)) && Number(t.id) > 0;

  // Get categoryId from categoryCode
  const categoryId = Number(t.categoryCode);
  if (isNaN(categoryId)) {
    throw new Error('Invalid categoryCode: must be a valid category ID');
  }

  const payload = {
    description: t.description || '',
    date: t.date,
    amount: Number(t.amount),
    type: t.type,
    accountId: Number(t.accountId),
    categoryId: categoryId,
  };

  if (isExisting) {
    const { data, error } = await supabase
      .from('Transaction')
      .update(payload)
      .eq('id', Number(t.id))
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }

    return {
      ...data,
      id: String(data.id),
      categoryCode: String(data.categoryId),
      accountId: String(data.accountId),
      date: data.date ? data.date.split('T')[0] : data.date,
      type: t.type,
    };
  } else {
    const { data, error } = await supabase
      .from('Transaction')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }

    return {
      ...data,
      id: String(data.id),
      categoryCode: String(data.categoryId),
      accountId: String(data.accountId),
      date: data.date ? data.date.split('T')[0] : data.date,
      type: t.type,
    };
  }
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('Transaction')
    .delete()
    .eq('id', Number(id));

  if (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};
