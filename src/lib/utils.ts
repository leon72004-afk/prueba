import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extracts a text reply from varying n8n webhook response structures.
 * Supports: { reply }, { response }, { message }, { output }, { text }, { answer },
 * raw strings, or nested objects.
 */
export function extractReply(data: unknown): string {
  if (data === null || data === undefined) {
    return 'El servicio respondió con un contenido vacío.';
  }

  if (typeof data === 'string') {
    const trimmed = data.trim();
    return trimmed.length > 0 ? trimmed : 'El servicio respondió con una cadena vacía.';
  }

  if (typeof data === 'object') {
    // If n8n returns an array like [{ reply: "..." }]
    if (Array.isArray(data) && data.length > 0) {
      return extractReply(data[0]);
    }

    const obj = data as Record<string, unknown>;

    // Common response key priority
    const candidateKeys = ['reply', 'response', 'message', 'output', 'text', 'answer', 'result', 'content'];

    for (const key of candidateKeys) {
      if (key in obj && obj[key] !== undefined && obj[key] !== null) {
        const val = obj[key];
        if (typeof val === 'string' && val.trim().length > 0) {
          return val.trim();
        }
        if (typeof val === 'number' || typeof val === 'boolean') {
          return String(val);
        }
        if (typeof val === 'object') {
          return JSON.stringify(val, null, 2);
        }
      }
    }

    // Fallback if single property object or stringify
    const keys = Object.keys(obj);
    if (keys.length === 1 && typeof obj[keys[0]] === 'string') {
      return (obj[keys[0]] as string).trim();
    }

    if (keys.length > 0) {
      try {
        return JSON.stringify(obj, null, 2);
      } catch {
        // ignore
      }
    }
  }

  return 'El servicio respondió, pero no se pudo interpretar el contenido.';
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export function formatFullDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}
