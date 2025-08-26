'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileIcon, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { FileType, FILE_SIZE_LIMITS } from '@cotiza/shared';
import { apiClient } from '@/lib/api-client';

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  fileId?: string;
}

interface FileUploadProps {
  onFilesUploaded: (fileIds: string[]) => void;
  maxFiles?: number;
  acceptedFileTypes?: FileType[];
}

const FILE_EXTENSIONS: Record<FileType, string[]> = {
  stl: ['.stl'],
  step: ['.step', '.stp'],
  iges: ['.iges', '.igs'],
  dxf: ['.dxf'],
  dwg: ['.dwg'],
  pdf: ['.pdf'],
};

export function FileUpload({
  onFilesUploaded,
  maxFiles = FILE_SIZE_LIMITS.maxFilesPerQuote,
  acceptedFileTypes = ['stl', 'step', 'iges', 'dxf', 'dwg', 'pdf'],
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const acceptedExtensions = acceptedFileTypes.flatMap((type) => FILE_EXTENSIONS[type]);
  const accept = acceptedExtensions.reduce(
    (acc, ext) => {
      acc[`application/${ext.substring(1)}`] = [ext];
      return acc;
    },
    {} as Record<string, string[]>,
  );

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0,
      status: 'pending' as const,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
    setIsUploading(true);

    // Upload files sequentially
    for (const uploadFile of newFiles) {
      await uploadSingleFile(uploadFile);
    }

    setIsUploading(false);
  }, []);

  const uploadSingleFile = async (uploadFile: UploadedFile) => {
    try {
      // Update status to uploading
      updateFileStatus(uploadFile.id, 'uploading', 0);

      // Get presigned URL from API
      const presignData = await apiClient.post<{
        uploadUrl: string;
        uploadFields: Record<string, string>;
        fileId: string;
      }>('/files/presign', {
        filename: uploadFile.file.name,
        type: getFileType(uploadFile.file.name),
        size: uploadFile.file.size,
      });

      const { uploadUrl, uploadFields, fileId } = presignData;

      // Create form data for S3 upload
      const formData = new FormData();
      Object.entries(uploadFields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('file', uploadFile.file);

      // Upload to S3
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          updateFileStatus(uploadFile.id, 'uploading', progress);
        }
      });

      await new Promise<void>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status === 204 || xhr.status === 201) {
            resolve();
          } else {
            reject(new Error('Upload failed'));
          }
        });
        xhr.addEventListener('error', () => reject(new Error('Upload failed')));
        xhr.open('POST', uploadUrl);
        xhr.send(formData);
      });

      // Confirm upload with API
      await apiClient.post(`/files/${fileId}/confirm`);

      updateFileStatus(uploadFile.id, 'success', 100, undefined, fileId);
    } catch (error) {
      updateFileStatus(
        uploadFile.id,
        'error',
        0,
        error instanceof Error ? error.message : 'Upload failed',
      );
    }
  };

  const updateFileStatus = (
    id: string,
    status: UploadedFile['status'],
    progress: number,
    error?: string,
    fileId?: string,
  ) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status, progress, error, fileId } : f)),
    );
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const getFileType = (filename: string): FileType => {
    const extension = filename.split('.').pop()?.toLowerCase();
    for (const [type, extensions] of Object.entries(FILE_EXTENSIONS)) {
      if (extensions.some((ext) => ext.substring(1) === extension)) {
        return type as FileType;
      }
    }
    return 'stl'; // Default
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: maxFiles - files.length,
    maxSize: FILE_SIZE_LIMITS.maxFileSizeMB * 1024 * 1024,
    disabled: isUploading || files.length >= maxFiles,
  });

  const successfulFiles = files.filter((f) => f.status === 'success' && f.fileId);

  return (
    <div className="space-y-4">
      <Card
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed p-8 text-center cursor-pointer transition-colors',
          isDragActive && 'border-primary bg-primary/5',
          (isUploading || files.length >= maxFiles) && 'cursor-not-allowed opacity-50',
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg mb-2">
          {isDragActive
            ? 'Suelta los archivos aquí'
            : 'Arrastra archivos aquí o haz clic para seleccionar'}
        </p>
        <p className="text-sm text-muted-foreground">
          Formatos aceptados: {acceptedExtensions.join(', ')}
        </p>
        <p className="text-sm text-muted-foreground">
          Tamaño máximo: {FILE_SIZE_LIMITS.maxFileSizeMB}MB por archivo
        </p>
      </Card>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <Card key={file.id} className="p-4">
              <div className="flex items-center gap-4">
                <FileIcon className="w-8 h-8 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {file.status === 'uploading' && (
                    <Progress value={file.progress} className="mt-2" />
                  )}
                  {file.status === 'error' && (
                    <div className="flex items-center gap-2 mt-2 text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">{file.error}</p>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(file.id)}
                  disabled={file.status === 'uploading'}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {successfulFiles.length > 0 && (
        <Button
          onClick={() => onFilesUploaded(successfulFiles.map((f) => f.fileId || ''))}
          className="w-full"
        >
          Continuar con {successfulFiles.length} archivo{successfulFiles.length !== 1 && 's'}
        </Button>
      )}
    </div>
  );
}
