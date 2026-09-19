const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function getData() {
  const { data, error } = await supabase.from('your_table').select('*');
  if (error) throw error;
  return data;
}

module.exports = { supabase, getData };
