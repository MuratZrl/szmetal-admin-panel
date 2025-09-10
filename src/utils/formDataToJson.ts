// src/utils/formDataToJson.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

function coerce(val: string): Json {
  const t = val.trim();
  if (t === '') return null;
  if (t === 'true') return true;
  if (t === 'false') return false;
  if (t === 'null') return null;

  // sayısal
  if (/^-?\d+(\.\d+)?$/.test(t)) {
    const num = Number(t);
    if (!Number.isNaN(num)) return num;
  }

  // JSON dizi/obje
  if ((t.startsWith('{') && t.endsWith('}')) || (t.startsWith('[') && t.endsWith(']'))) {
    try {
      const parsed = JSON.parse(t) as unknown;
      // parsed zaten string/number/boolean/null/obj/array olacak
      return parsed as Json;
    } catch {
      /* yut, string olarak bırak */
    }
  }

  return t;
}

/** Aynı anahtar birden fazla kez geldiyse array'e çevirir. File görürse null yazar. */
export function formDataToJson(fd: FormData): { [key: string]: Json | undefined } {
  const obj: { [key: string]: Json | undefined } = {};
  fd.forEach((value, key) => {
    const jsonValue: Json =
      value instanceof File
        ? (value.size > 0 ? { name: value.name, type: value.type, size: value.size } : null)
        : coerce(value);

    const current = obj[key];
    if (typeof current === 'undefined') {
      obj[key] = jsonValue;
    } else if (Array.isArray(current)) {
      obj[key] = [...current, jsonValue];
    } else {
      obj[key] = [current, jsonValue];
    }
  });
  return obj;
}
