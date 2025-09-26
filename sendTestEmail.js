// sendTestEmail.js - Script masivo que envía tickets a todos los usuarios
import dotenv from 'dotenv';
import fs from 'fs';

// Intentar cargar desde .env.local primero, luego .env
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
  console.log('📁 Cargando variables desde .env.local');
} else if (fs.existsSync('.env')) {
  dotenv.config({ path: '.env' });
  console.log('📁 Cargando variables desde .env');
} else {
  console.log('⚠️  No se encontró archivo .env ni .env.local');
}

// Cargar usuarios desde users.json
let users = [];
try {
  const usersData = fs.readFileSync('users.json', 'utf8');
  users = JSON.parse(usersData);
  console.log(`📋 Cargados ${users.length} usuarios desde users.json`);
} catch (error) {
  console.error('❌ Error cargando users.json:', error.message);
  process.exit(1);
}

// Configuración para envío masivo (ajustada para rate limits de Resend)
const BATCH_SIZE = 2; // Enviar solo 2 emails a la vez (límite de Resend)
const DELAY_BETWEEN_BATCHES = 1100; // 1.1 segundos entre lotes (para estar seguros)
const DELAY_BETWEEN_EMAILS = 600; // 0.6 segundos entre emails individuales

// Función para enviar un email individual
async function sendSingleEmail(user, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) {
  const ticketEmailData = {
    userFirstname: user.name,
    email: user.email,
    amount: 1200,
    currency: "MXN",
    planType: "Individual",
    orderDate: new Date().toLocaleDateString("es-MX"),
    paymentMethod: "Tarjeta de crédito/débito",
    courseTitle: "Legal AI Summit México 2025",
    courseId: "155",
    // Datos adicionales del ticket
    userId: user.id,
    confirmationUrl: `https://agenda.lawgic.institute/access/${user.id}-token-2025`,
    eventDates: 'Del 29 de septiembre al 3 de octubre de 2025',
    eventOrganizer: 'LAWGIC'
  };

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        data: ticketEmailData
      })
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        user: user,
        messageId: result.messageId
      };
    } else {
      const errorText = await response.text();
      return {
        success: false,
        user: user,
        error: `${response.status}: ${errorText}`
      };
    }
  } catch (error) {
    return {
      success: false,
      user: user,
      error: error.message
    };
  }
}

// Función principal de envío masivo
async function sendBulkEmails() {
  console.log('🔍 Verificando variables de entorno...');
  
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('Variables encontradas:');
  console.log('- VITE_SUPABASE_URL:', SUPABASE_URL ? '✅ Configurada' : '❌ Faltante');
  console.log('- SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurada' : '❌ Faltante');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('\n❌ Variables de entorno faltantes');
    console.log('\n📝 Asegúrate de tener en tu archivo .env:');
    console.log('VITE_SUPABASE_URL=tu_supabase_url');
    console.log('SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui');
    return;
  }

  console.log(`\n🚀 Iniciando envío masivo de ${users.length} tickets del Legal AI Summit...`);
  console.log(`📦 Configuración: ${BATCH_SIZE} emails por lote, ${DELAY_BETWEEN_BATCHES}ms entre lotes`);

  // Estadísticas
  let successful = 0;
  let failed = 0;
  const errors = [];
  const startTime = Date.now();

  // Procesar usuarios en lotes
  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(users.length / BATCH_SIZE);
    
    console.log(`\n📦 Procesando lote ${batchNumber}/${totalBatches} (usuarios ${i + 1}-${Math.min(i + BATCH_SIZE, users.length)})`);

    // Enviar emails del lote en paralelo
    const promises = batch.map(user => sendSingleEmail(user, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY));
    const results = await Promise.all(promises);

    // Procesar resultados del lote
    for (const result of results) {
      if (result.success) {
        successful++;
        console.log(`✅ ${result.user.name} <${result.user.email}>`);
      } else {
        failed++;
        errors.push({ user: result.user, error: result.error });
        console.log(`❌ ${result.user.name} <${result.user.email}>: ${result.error}`);
      }
    }

    // Pausa entre lotes (excepto en el último)
    if (i + BATCH_SIZE < users.length) {
      console.log(`⏳ Esperando ${DELAY_BETWEEN_BATCHES}ms antes del siguiente lote...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }

  // Resumen final
  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DEL ENVÍO MASIVO');
  console.log('='.repeat(60));
  console.log(`✅ Exitosos: ${successful}`);
  console.log(`❌ Fallidos: ${failed}`);
  console.log(`📧 Total procesados: ${users.length}`);
  console.log(`⏱️  Tiempo total: ${duration} segundos`);
  console.log(`📈 Tasa de éxito: ${((successful / users.length) * 100).toFixed(1)}%`);

  // Mostrar errores si los hay
  if (errors.length > 0) {
    console.log('\n❌ ERRORES DETALLADOS:');
    console.log('-'.repeat(40));
    errors.forEach(({ user, error }) => {
      console.log(`• ${user.name} <${user.email}>: ${error}`);
    });
  }

  console.log('\n✨ Proceso completado');
}

// Función para crear un script de prueba con pocos usuarios
function createTestScript() {
  const testUsers = users.slice(0, 3); // Solo los primeros 3 usuarios para prueba
  console.log('🧪 MODO PRUEBA: Solo enviando a los primeros 3 usuarios');
  console.log('📋 Usuarios de prueba:');
  testUsers.forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.name} <${user.email}>`);
  });
  
  // Reemplazar temporalmente el array de usuarios
  const originalUsers = [...users];
  users.length = 0;
  users.push(...testUsers);
  
  return () => {
    // Restaurar usuarios originales
    users.length = 0;
    users.push(...originalUsers);
  };
}

// Verificar si se quiere ejecutar en modo prueba
const args = process.argv.slice(2);
const isTestMode = args.includes('--test') || args.includes('-t');
const confirmSend = args.includes('--confirm') || args.includes('-c');

if (isTestMode) {
  const restore = createTestScript();
  sendBulkEmails()
    .then(() => {
      restore();
      console.log('\n🧪 Prueba completada. Usa --confirm para enviar a todos los usuarios.');
    })
    .catch((err) => {
      restore();
      console.error("❌ Error en prueba:", err);
    });
} else if (confirmSend) {
  console.log('🚀 MODO PRODUCCIÓN: Enviando a todos los usuarios...\n');
  sendBulkEmails()
    .catch((err) => console.error("❌ Error general:", err));
} else {
  console.log('📧 SCRIPT DE ENVÍO MASIVO DE TICKETS');
  console.log('=' .repeat(50));
  console.log(`📊 Total de usuarios: ${users.length}`);
  console.log('\n🎯 OPCIONES DE EJECUCIÓN:');
  console.log('  --test, -t    : Modo prueba (solo 3 usuarios)');
  console.log('  --confirm, -c : Enviar a TODOS los usuarios');
  console.log('\n💡 EJEMPLOS:');
  console.log('  node sendTestEmail.js --test     # Prueba con 3 usuarios');
  console.log('  node sendTestEmail.js --confirm  # Envío masivo completo');
  console.log('\n⚠️  IMPORTANTE: El envío masivo puede tardar varios minutos');
}
