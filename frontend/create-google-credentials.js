const fs = require('fs');
const path = require('path');

/**
 * Script para crear google-credentials.json desde variable de entorno
 * Se ejecuta antes de iniciar el servidor (prestart)
 * Necesario para Railway y otros entornos donde no se puede subir archivos
 */

const credentialsPath = path.join(__dirname, 'google-credentials.json');

// Soporta dos formas de pasar credenciales en Railway:
// 1) GOOGLE_CREDENTIALS_JSON -> JSON crudo
// 2) GOOGLE_CREDENTIALS_B64  -> Base64 del JSON
let credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
const credentialsB64 = process.env.GOOGLE_CREDENTIALS_B64;

if (!credentialsJson && credentialsB64) {
  try {
    credentialsJson = Buffer.from(credentialsB64, 'base64').toString('utf8');
    console.log('ℹ️  GOOGLE_CREDENTIALS_B64 detectada, decodificando base64');
  } catch (err) {
    console.error('❌ Error al decodificar GOOGLE_CREDENTIALS_B64:', err.message);
    process.exit(1);
  }
}

if (credentialsJson) {
  try {
    // Validar que sea JSON válido
    JSON.parse(credentialsJson);

    // Escribir el archivo
    fs.writeFileSync(credentialsPath, credentialsJson, 'utf8');
    console.log('✅ google-credentials.json creado correctamente desde variable de entorno');
  } catch (error) {
    console.error('❌ Error al crear google-credentials.json:', error.message);
    console.error('Verifica que GOOGLE_CREDENTIALS_JSON o GOOGLE_CREDENTIALS_B64 representen un JSON válido');
    process.exit(1);
  }
} else {
  // En desarrollo local, puede existir el archivo directamente
  if (fs.existsSync(credentialsPath)) {
    console.log('ℹ️  Usando google-credentials.json existente (desarrollo local)');
  } else {
    const msg = '⚠️  GOOGLE_CREDENTIALS_JSON/GOOGLE_CREDENTIALS_B64 no definiadas y no existe google-credentials.json';
    console.warn(msg);
    console.warn('   Las funciones de Google APIs no funcionarán sin credenciales');

    // En producción queremos fail-fast: no iniciar sin credenciales válidas
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Entorno de producción sin credenciales de Google. Abortando arranque (fail-fast).');
      process.exit(1);
    }
  }
}
