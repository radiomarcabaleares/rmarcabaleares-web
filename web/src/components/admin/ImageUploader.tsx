'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  bucket: string;
  path: string;
  currentUrl?: string | null;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  recommendedSize?: string;
  /** Width/height ratio for the preview, e.g. "512/512" or "800/500" */
  previewRatio?: string;
  className?: string;
}

export default function ImageUploader({
  bucket,
  path,
  currentUrl,
  onUpload,
  onRemove,
  recommendedSize,
  previewRatio,
  className = '',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imagenes');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar 5MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const safeName = file.name
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${path}/${Date.now()}-${safeName}`;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', bucket);
      formData.append('path', filePath);

      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Error al subir');
      }

      setPreview(json.url);
      onUpload(json.url);
    } catch (err: any) {
      setError(`Error al subir: ${err.message || 'Error desconocido'}`);
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onRemove?.();
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <div className="relative group">
          <div
            className="relative w-full rounded-lg overflow-hidden bg-gray-100"
            style={{ aspectRatio: previewRatio || '16/9' }}
          >
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              sizes="400px"
            />
          </div>
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-3 hover:border-radio-blue hover:bg-radio-blue/5 transition-all cursor-pointer disabled:opacity-50"
          style={{ aspectRatio: previewRatio || '16/9' }}
        >
          {uploading ? (
            <Loader2 size={32} className="text-radio-blue animate-spin" />
          ) : (
            <Upload size={32} className="text-gray-400" />
          )}
          <p className="text-sm text-gray-500">
            {uploading ? 'Subiendo...' : 'Click para subir imagen'}
          </p>
          {recommendedSize && (
            <p className="text-xs text-gray-400">Tamano recomendado: {recommendedSize}</p>
          )}
        </button>
      )}

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
}
