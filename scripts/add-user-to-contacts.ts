import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://juklxgvqfdjbkwofoioc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a2x4Z3ZxZmRqYmt3b2ZvaW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNzAyOTEsImV4cCI6MjA3MDg0NjI5MX0.8hlrvM-6YGU4VG5ZvtRXc_4ht3MAqtBmMr_gQuDSGt0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addUserToContacts() {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .insert([
        {
          email: 'villanuevajimena39@gmail.com',
          name: 'Jimena Villanueva'
        }
      ]);

    if (error) {
      console.error('Error adding user to contacts:', error);
    } else {
      console.log('User added to contacts successfully:', data);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

addUserToContacts();

