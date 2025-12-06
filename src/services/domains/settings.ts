import { supabase } from '../../lib/supabase';

export const getClosingDate = async (): Promise<{ closingDate: string | null }> => {
  const { data, error } = await supabase
    .from('Settings')
    .select('value')
    .eq('key', 'closingDate')
    .single();

  if (error) {
    // If not found, return null
    if (error.code === 'PGRST116') {
      return { closingDate: null };
    }
    console.error('Error getting closing date:', error);
    throw error;
  }

  return { closingDate: data?.value || null };
};

export const setClosingDate = async (closingDate: string | null): Promise<void> => {
  const { error } = await supabase
    .from('Settings')
    .update({ value: closingDate })
    .eq('key', 'closingDate');

  if (error) {
    console.error('Error setting closing date:', error);
    throw error;
  }
};
