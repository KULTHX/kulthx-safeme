import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function saveScript(scriptData) {
  const { data, error } = await supabase
    .from('scripts')
    .insert([scriptData]);

  if (error) {
    console.error('Error saving script:', error);
    return null;
  }
  return data[0];
}

export async function getScript(id) {
  const { data, error } = await supabase
    .from('scripts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error getting script:', error);
    return null;
  }
  return data;
}

export async function getAllScripts() {
  const { data, error } = await supabase
    .from('scripts')
    .select('*');

  if (error) {
    console.error('Error getting all scripts:', error);
    return [];
  }
  return data;
}

export async function deleteScript(id) {
  const { data, error } = await supabase
    .from('scripts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting script:', error);
    return false;
  }
  return true;
}


