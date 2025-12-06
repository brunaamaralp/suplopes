import { supabase } from '../../lib/supabase';
import { Category } from '../../types';

export const listChart = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('Category')
    .select('*')
    .order('sortOrder', { ascending: true, nullsFirst: false });

  if (error) {
    console.error('Error loading categories:', error);
    throw error;
  }

  const mapped = (data || []).map((c: any) => {
    const nameParts = c.name.split(' - ');
    const extractedCode = nameParts.length > 1 ? nameParts[0].trim() : (c.code || String(c.id));

    return {
      ...c,
      id: String(c.id),
      code: c.code || extractedCode,
      isActive: c.isActive !== undefined ? c.isActive : true,
    };
  });

  // Deduplicate by code
  const seen = new Set<string>();
  return mapped.filter(cat => {
    if (seen.has(cat.code)) return false;
    seen.add(cat.code);
    return true;
  });
};

export const saveChartItem = async (c: Category): Promise<Category> => {
  const isExisting = !isNaN(Number(c.id)) && Number(c.id) > 0;

  const payload = {
    name: c.name,
    type: c.type,
    code: c.code,
    isActive: c.isActive,
    group: c.group || null,
    nature: c.nature || null,
    level: c.level || null,
    parentCode: c.parentCode || null,
    isSystem: c.isSystem || false,
    isEditable: c.isEditable !== false,
    canDelete: c.canDelete !== false,
    side: c.side || null,
    sortOrder: c.sortOrder || null,
    accountType: c.accountType || null,
  };

  if (isExisting) {
    const { data, error } = await supabase
      .from('Category')
      .update(payload)
      .eq('id', Number(c.id))
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }

    return { ...data, id: String(data.id) };
  } else {
    const { data, error } = await supabase
      .from('Category')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }

    return { ...data, id: String(data.id) };
  }
};

export const updateChartItem = async (c: Category): Promise<Category> => {
  const payload = {
    name: c.name,
    type: c.type,
    code: c.code,
    isActive: c.isActive,
    group: c.group || null,
    nature: c.nature || null,
    parentCode: c.parentCode || null,
    side: c.side || null,
    accountType: c.accountType || null,
  };

  const { data, error } = await supabase
    .from('Category')
    .update(payload)
    .eq('id', Number(c.id))
    .select()
    .single();

  if (error) {
    console.error('Error updating category:', error);
    throw error;
  }

  return { ...data, id: String(data.id) };
};

export const toggleActive = async (id: string, isActive: boolean): Promise<void> => {
  const { error } = await supabase
    .from('Category')
    .update({ isActive })
    .eq('id', Number(id));

  if (error) {
    console.error('Error toggling category status:', error);
    throw error;
  }
};

export const seedChart = async (items: Category[]): Promise<void> => {
  // Insert all categories in batch
  const payload = items.map(c => ({
    name: c.name,
    type: c.type,
    code: c.code,
    isActive: c.isActive !== false,
    group: c.group || null,
    nature: c.nature || null,
    level: c.level || null,
    parentCode: c.parentCode || null,
    isSystem: c.isSystem || false,
    isEditable: c.isEditable !== false,
    canDelete: c.canDelete !== false,
    side: c.side || null,
    sortOrder: c.sortOrder || null,
    accountType: c.accountType || null,
  }));

  const { error } = await supabase
    .from('Category')
    .insert(payload);

  if (error) {
    console.error('Error seeding categories:', error);
    throw error;
  }
};
