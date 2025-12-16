// src/features/products/forms/fileMeta.ts
export type FileMeta = {
  path: string;
  name: string;
  ext: string;
  mime: string;
  size: number;
  bucket: string;
};

// Bu helper herhangi bir "values" objesinden file meta çıkarabilsin diye
// CreateValues/EditValues'a bağımlı tip kullanmıyoruz.
// Yeter ki aşağıdaki alanları barındırsın.
export type FileMetaSource = {
  fileBucket?: string | null;
  filePath?: string | null;
  fileName?: string | null;
  fileMime?: string | null;
  fileSize?: number | null;
};

export function getFileExt(fileName: string): string {
  const s = fileName.trim();
  const i = s.lastIndexOf('.');
  return i >= 0 ? s.slice(i + 1).toLowerCase() : '';
}

/**
 * Form values içinden FileMeta üretir.
 * Gerekli alanlardan biri eksikse null döner (DB'ye boş meta yazmamak için).
 */
export function buildFileMeta(v: FileMetaSource): FileMeta | null {
  const bucket = v.fileBucket ?? null;
  const path = v.filePath ?? null;
  const name = v.fileName ?? null;
  const mime = v.fileMime ?? null;
  const size = typeof v.fileSize === 'number' ? v.fileSize : null;

  if (!bucket || !path || !name || !mime || size == null) return null;

  return {
    bucket,
    path,
    name,
    ext: getFileExt(name),
    mime,
    size,
  };
}
