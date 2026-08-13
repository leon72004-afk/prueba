# AI Workflow Chat (n8n Integration)

Una aplicación de chat web full-stack, moderna y funcional, construida con **Next.js / Express**, **React 19**, **TypeScript** y **Tailwind CSS**, diseñada para conectarse de extremo a extremo con flujos de trabajo (workflows) de **n8n** mediante Webhooks seguros.

---

## 📐 Arquitectura del Sistema

La arquitectura implementa una capa de proxy segura para evitar exponer los Webhooks privados de n8n en el cliente web:

```text
Usuario (Navegador)
       ↓
  Interfaz Chat
       ↓
API /api/chat (Next.js / Express Proxy)
       ↓ (POST con timeout de 60s & AbortController)
Webhook de n8n
       ↓
Workflow n8n (Agente AI / LLM / Lógica)
       ↓
Respuesta JSON
       ↓
API /api/chat (Normalización de respuesta)
       ↓
  Interfaz Chat
       ↓
Mensaje del Asistente
```

### Ventajas clave:
* **Seguridad:** `N8N_WEBHOOK_URL` se mantiene 100% oculta en el servidor backend.
* **CORS Evitado:** Al realizar la petición servidor a servidor (`Next.js / Express → n8n`), no existen bloqueos por políticas de CORS en el navegador.
* **Resiliencia:** Normalización inteligente de respuestas (`reply`, `response`, `message`, `output`, `text`, `answer`, o cadenas puras) y manejo estricto de timeouts de 60s.

---

## 🚀 Instalación y Configuración

### 1. Clona e instala las dependencias

```bash
npm install
```

### 2. Configura las variables de entorno

Copia el archivo de ejemplo:

```bash
cp .env.example .env.local
```

Edita `.env.local` e ingresa la URL de tu Webhook activo en n8n:

```env
N8N_WEBHOOK_URL=https://tu-instancia-n8n.com/webhook/chat
```

> **Nota:** La variable se lee únicamente desde el servidor, por lo que NO requiere el prefijo `NEXT_PUBLIC_`.

---

## 🖥️ Comandos de Desarrollo y Producción

### Modo Desarrollo
Ejecuta el servidor con soporte para TypeScript (`tsx`) y Vite middleware:

```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

### Verificación de Linter y Tipos TypeScript
```bash
npm run lint
```

### Compilación para Producción
Empaqueta el frontend con Vite y empaqueta el servidor con esbuild:

```bash
npm run build
```

### Iniciar en Producción
```bash
npm start
```

---

## 🧪 Prueba Rápida mediante cURL

Puedes probar la API interna `/api/chat` directamente desde la terminal con `curl`:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hola, ¿puedes ayudarme?",
    "sessionId": "session-demo-123",
    "history": []
  }'
```

### Payload enviado por Next.js / Express hacia n8n:
```json
{
  "message": "Hola, ¿puedes ayudarme?",
  "sessionId": "session-demo-123",
  "history": [],
  "metadata": {
    "source": "web-chat",
    "timestamp": "2026-08-13T12:00:00.000Z"
  }
}
```

---

## ⚙️ Guía de Configuración en n8n

### Opción A: Workflow Básico de Prueba

Ideal para verificar la conexión inicial (`Chat → Next.js → n8n → Next.js → Chat`).

1. En n8n, crea un nuevo Workflow con los siguientes nodos:
   ```text
   Webhook ──> Set / Edit Fields ──> Respond to Webhook
   ```
2. Configura el nodo **Webhook**:
   * **HTTP Method:** `POST`
   * **Path:** `chat`
   * **Respond:** `Using 'Respond to Webhook' Node`
3. Configura el nodo **Edit Fields (Set)**:
   * Añade un campo llamado `reply`.
   * Valor: `Recibí tu mensaje: {{$json.body.message}} (Session: {{$json.body.sessionId}})`
4. Configura el nodo **Respond to Webhook**:
   * **Respond With:** `First Incoming Item`
5. Activa el workflow (**Active = ON**).

---

### Opción B: Workflow Avanzado con Agente AI y Memoria

Para evolucionar a un asistente inteligente conversacional:

```text
Webhook ──> AI Agent ──> Respond to Webhook
              ├── OpenAI Chat Model
              └── Window Buffer Memory
```

1. **AI Agent Node:**
   * **Prompt / Input:** `{{$json.body.message}}`
2. **Window Buffer Memory Node:**
   * **Session Key:** `{{$json.body.sessionId}}`
   *(Esto permite que n8n mantenga memoria de conversación independiente para cada usuario según su `sessionId`)*.
3. **Respond to Webhook Node:**
   * Devuelve un JSON estructurado como:
     ```json
     {
       "reply": "Respuesta generada por el modelo de IA"
     }
     ```

---

## ⚠️ Webhook Test vs. Webhook Production en n8n

* **URL de prueba (`/webhook-test/...`):** Solo funciona mientras presionas *"Test step"* o *"Execute workflow"* dentro del editor de n8n. Desaparece al cerrar la interfaz.
* **URL de producción (`/webhook/...`):** Funciona de manera continua cuando el Workflow está en estado **Active (ON)**.

Para la aplicación en producción, utiliza siempre la URL de producción:
```env
N8N_WEBHOOK_URL=https://n8n.midominio.com/webhook/chat
```

---

## 🌐 Consideraciones para Despliegue en Vercel / Cloud Run

1. **Variables de Entorno:**
   Agrega `N8N_WEBHOOK_URL` en las configuraciones de variables de entorno de Vercel o Cloud Run.
2. **IPs y Firewall en n8n Self-Hosted:**
   Si tu n8n está alojado en una red privada o servidor propio (Docker, Hetzner, AWS), asegúrate de que el puerto de n8n sea accesible desde las IPs del proveedor donde despliegues Next.js / Express.
3. **Timeouts:**
   La aplicación utiliza un timeout interno de 60 segundos. Asegúrate de que tu hosting no interrumpa las peticiones HTTP largas antes de dicho tiempo (por ejemplo, Vercel Serverless Hobby tiene un límite por defecto de 10-15s, mientras que Vercel Pro o Cloud Run permiten hasta 60s+).
