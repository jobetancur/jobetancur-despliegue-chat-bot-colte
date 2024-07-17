# WhatsApp Chat Project

Este proyecto integra la API de OpenAI con Twilio para crear un sistema de chat automatizado que utiliza modelos de lenguaje avanzado para interactuar con los usuarios a través de WhatsApp.

## Descripción

El proyecto permite a los usuarios enviar mensajes a un número de WhatsApp administrado por Twilio, y recibir respuestas generadas por un modelo de lenguaje de OpenAI. El sistema está diseñado para manejar conversaciones de manera fluida, almacenando el historial de chat y utilizando este contexto para generar respuestas más coherentes y precisas.

## Librerías Utilizadas

- **express**: Un framework de servidor web para Node.js, utilizado para manejar las solicitudes HTTP.
- **dotenv**: Para cargar variables de entorno desde un archivo `.env`.
- **cors**: Middleware para permitir solicitudes HTTP desde otros dominios.
- **@supabase/supabase-js**: Cliente de JavaScript para interactuar con Supabase, utilizado para almacenar y recuperar datos.
- **@langchain/openai**: Cliente para interactuar con la API de OpenAI.
- **@langchain/community**: Librería para integrar funcionalidades adicionales, como el almacén vectorial de Supabase.
- **uuid**: Para generar identificadores únicos para las sesiones de chat.
- **axios**: Cliente HTTP utilizado en el frontend para enviar solicitudes al servidor.

## Instalación y Configuración

### Requisitos

- Node.js (versión 14 o superior)
- npm o yarn

### Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/GameFather92/whatsapp-chat.git
cd whatsapp-chat
```

2. Crear un archivo .env en la raíz del proyecto y añadir las siguientes variables de entorno:

```bash
# Twilio
VITE_TWILIO_ACCOUNT_SID=your_twilio_account_sid
VITE_TWILIO_AUTH_TOKEN=your_twilio_auth_token
VITE_TWILIO_WEBHOOK_PATH=/whatsapp-webhook
VITE_TWILIO_NUMBER=whatsapp:+14155238886

# OpenAI
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_OPENAI_ORGANIZATION=your_openai_organization
VITE_OPENAI_MODEL_NAME=gpt-3.5-turbo

# General
PORT=3000
```
3. Instala las dependencias:

```bash
npm install
```

Por ultimo si todo sale bien, puedes ejecutar el siguiente comando
```bash
npm run dev  
```

4. Importar PDFs y generar embeddings

Para importar los archivos PDF y generar los embeddings en Supabase, sigue estos pasos:

a. Asegúrate de que tus archivos PDF estén en la carpeta `./documents` en la raíz del proyecto.

b. Navega a la carpeta `utils`:

```bash
cd utils
```

c. Ejecuta el script de embeddings:

```bash
npx tsx embeddings.ts
```

Este proceso leerá todos los archivos PDF de la carpeta `./documents`, extraerá su contenido, generará los embeddings y los almacenará en tu base de datos Supabase.

Nota: Asegúrate de que tu conexión a Supabase esté correctamente configurada en el archivo `.env` antes de ejecutar este script.

Una vez completado este proceso, tus embeddings estarán disponibles en Supabase para su uso en la aplicación.

5. Iniciar la aplicación

Después de generar los embeddings, puedes iniciar la aplicación ejecutando:

```bash
npm run dev
```

Esto iniciará el servidor de desarrollo y podrás acceder a la aplicación en tu navegador.