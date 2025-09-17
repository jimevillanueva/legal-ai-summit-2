import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://juklxgvqfdjbkwofiojc.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a2x4Z3ZxZmRqYmt3b2ZvaW9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTI3MDI5MSwiZXhwIjoyMDcwODQ2MjkxfQ.3VYgN_5xHKGtsBSSv91p1FeRhrUmEP7QJ02qnRxSMTY';

// Crear cliente con service role (para operaciones administrativas)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || 'Administrador';

  if (!email || !password) {
    console.error('❌ Uso: npm run create-admin <email> <password> [name]');
    console.error('Ejemplo: npm run create-admin admin@example.com password123 "Admin Name"');
    process.exit(1);
  }

  try {
    console.log('🔐 Creando usuario administrador...');
    
    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Confirmar email automáticamente
    });

    if (authError) {
      console.error('❌ Error creando usuario en Auth:', authError.message);
      process.exit(1);
    }

    console.log('✅ Usuario creado en Auth:', authData.user?.email);

    // 2. Crear perfil de usuario con rol admin
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user!.id,
        email: authData.user!.email!,
        name: name,
        role: 'admin'
      });

    if (profileError) {
      console.error('❌ Error creando perfil de usuario:', profileError.message);
      process.exit(1);
    }

    console.log('✅ Perfil de administrador creado exitosamente');
    console.log('🎉 Usuario administrador configurado:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: admin`);
    console.log('\n🌐 Ahora puedes acceder a http://localhost:5174/admin');

  } catch (error) {
    console.error('❌ Error inesperado:', error);
    process.exit(1);
  }
}

createAdminUser();
