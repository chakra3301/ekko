// Portfolio upload component with preview
'use client';

import { useState, useRef } from 'react';
import { uploadPortfolioFile, validatePortfolioFile, type MediaType } from '@/lib/portfolio-upload';
import type { UploadedMedia } from '@/lib/portfolio-upload';
import { cn } from '@/lib/utils';

interface PortfolioUploadProps {
  onUpload: (media: UploadedMedia[]) => void;
  maxFiles?: number;
  required?: boolean;
  className?: string;
}

/**
 * PortfolioUpload component
 * Handles file uploads with preview and validation
 */
export function PortfolioUpload({
  onUpload,
  maxFiles = 3,
  required = false,
  className,
}: PortfolioUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [types, setTypes] = useState<MediaType[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newErrors: string[] = [];

    if (files.length + selectedFiles.length > maxFiles) {
      newErrors.push(`Maximum ${maxFiles} files allowed`);
      setErrors(newErrors);
      return;
    }

    selectedFiles.forEach((file) => {
      // Auto-detect type
      let detectedType: MediaType = 'IMAGE';
      if (file.type.startsWith('video/')) {
        detectedType = 'VIDEO';
      } else if (file.type.startsWith('audio/')) {
        detectedType = 'AUDIO';
      }

      const validation = validatePortfolioFile(file, detectedType);
      if (!validation.valid) {
        newErrors.push(`${file.name}: ${validation.error}`);
      } else {
        setFiles((prev) => [...prev, file]);
        setTypes((prev) => [...prev, detectedType]);

        // Create preview
        if (detectedType === 'IMAGE') {
          const reader = new FileReader();
          reader.onload = (e) => {
            setPreviews((prev) => [...prev, e.target?.result as string]);
          };
          reader.readAsDataURL(file);
        } else {
          setPreviews((prev) => [...prev, '']);
        }
      }
    });

    setErrors(newErrors);
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setTypes((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setErrors([]);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      if (required) {
        setErrors(['At least one file is required']);
      }
      return;
    }

    setUploading(true);
    setErrors([]);

    try {
      const uploaded = await Promise.all(
        files.map((file, index) => uploadPortfolioFile(file, types[index]))
      );
      onUpload(uploaded);
      // Clear after successful upload
      setFiles([]);
      setTypes([]);
      setPreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Upload failed']);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Portfolio Items {required && <span className="text-red-500">*</span>}
        </label>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/mp4,video/webm,audio/mpeg,audio/mp3,audio/wav"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          disabled={uploading || files.length >= maxFiles}
        />
        <p className="mt-1 text-xs text-gray-500">
          Accepted: Images (JPEG, PNG, GIF, WebP), Videos (MP4, WebM), Audio (MP3, WAV)
          {maxFiles && ` • Max ${maxFiles} files`}
        </p>
      </div>

      {errors.length > 0 && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Errors</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {files.map((file, index) => (
              <div
                key={index}
                className="relative border rounded-lg overflow-hidden bg-gray-50"
              >
                {types[index] === 'IMAGE' && previews[index] ? (
                  <img
                    src={previews[index]}
                    alt={file.name}
                    className="w-full h-32 object-cover"
                  />
                ) : types[index] === 'VIDEO' ? (
                  <div className="w-full h-32 bg-gray-900 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gray-800 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                  </div>
                )}
                <div className="p-2">
                  <p className="text-xs text-gray-600 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • {types[index]}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  aria-label="Remove file"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : `Upload ${files.length} file(s)`}
          </button>
        </div>
      )}
    </div>
  );
}

