# Configuración del Panel de Administración

## Configuración de Supabase

Para usar el panel de administración (`/admin`), necesitas configurar Supabase:

### 1. Crear archivo .env

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
VITE_USE_SUPABASE=true
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

### 2. Obtener credenciales de Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto
2. En el dashboard de tu proyecto, ve a Settings > API
3. Copia la URL del proyecto y la clave anónima (anon key)
4. Pega estos valores en tu archivo `.env`

### 3. Configurar la base de datos

Ejecuta las migraciones de Supabase para crear las tablas necesarias:

```bash
# Si tienes el CLI de Supabase instalado
supabase db push

# O ejecuta manualmente los archivos SQL en supabase/migrations/
```

### 4. Crear un usuario administrador

1. Crea un usuario en Supabase Auth (Authentication > Users)
2. Inserta el usuario en la tabla `user_profiles` con rol admin:

```sql
INSERT INTO user_profiles (id, email, name, role) 
VALUES ('user-uuid-from-auth', 'admin@example.com', 'Admin Name', 'admin');
```

### 5. Reiniciar el servidor

```bash
npm run dev
```

## Uso del Panel de Administración

1. Navega a `http://localhost:5174/admin`
2. Inicia sesión con las credenciales del usuario administrador
3. Accede al dashboard con estadísticas y herramientas de administración

## Solución de Problemas

- **Error "Supabase no está configurado"**: Verifica que las variables de entorno estén correctamente configuradas
- **Error de autenticación**: Verifica que el usuario exista en Supabase Auth y tenga rol admin en user_profiles
- **Error de permisos**: Asegúrate de que las políticas RLS estén configuradas correctamente
