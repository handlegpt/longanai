'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle, AlertCircle, File, Image, Music } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLanguage } from '@/context/LanguageContext';

interface FileUploadProps {
  onUploadComplete?: (files: any[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  className?: string;
}

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  result?: any;
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  multiple = false,
  accept = '*/*',
  maxSize = 10 * 1024 * 1024, // 10MB
  className = ''
}) => {
  const { language } = useLanguage();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const translations = {
    cantonese: {
      dropzone: '拖拽文件到這裡，或點擊選擇文件',
      uploading: '上傳中...',
      uploadSuccess: '上傳成功',
      uploadError: '上傳失敗',
      fileTooLarge: '文件太大',
      invalidFileType: '不支持的文件類型',
      removeFile: '移除文件',
      uploadComplete: '所有文件上傳完成',
      retry: '重試',
      cancel: '取消'
    },
    mandarin: {
      dropzone: '拖拽文件到这里，或点击选择文件',
      uploading: '上传中...',
      uploadSuccess: '上传成功',
      uploadError: '上传失败',
      fileTooLarge: '文件太大',
      invalidFileType: '不支持的文件类型',
      removeFile: '移除文件',
      uploadComplete: '所有文件上传完成',
      retry: '重试',
      cancel: '取消'
    },
    english: {
      dropzone: 'Drag files here, or click to select',
      uploading: 'Uploading...',
      uploadSuccess: 'Upload successful',
      uploadError: 'Upload failed',
      fileTooLarge: 'File too large',
      invalidFileType: 'Invalid file type',
      removeFile: 'Remove file',
      uploadComplete: 'All files uploaded successfully',
      retry: 'Retry',
      cancel: 'Cancel'
    }
  };

  const t = translations[language as keyof typeof translations];

  const uploadFile = async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('未登录');
    }

    const response = await fetch('/api/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || '上传失败');
    }

    return await response.json();
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // 上传每个文件
    for (const fileInfo of newFiles) {
      try {
        // 模拟进度
        const progressInterval = setInterval(() => {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === fileInfo.id 
                ? { ...f, progress: Math.min(f.progress + 10, 90) }
                : f
            )
          );
        }, 200);

        const result = await uploadFile(fileInfo.file);
        
        clearInterval(progressInterval);
        
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileInfo.id 
              ? { ...f, progress: 100, status: 'success', result }
              : f
          )
        );

        toast.success(`${fileInfo.file.name} ${t.uploadSuccess}`);
        
      } catch (error) {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileInfo.id 
              ? { ...f, status: 'error', error: error instanceof Error ? error.message : '上传失败' }
              : f
          )
        );

        toast.error(`${fileInfo.file.name} ${t.uploadError}: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    }

    setIsUploading(false);
    
    // 通知父组件
    const successfulFiles = newFiles.filter(f => f.status === 'success');
    if (successfulFiles.length > 0 && onUploadComplete) {
      onUploadComplete(successfulFiles.map(f => f.result));
    }
  }, [onUploadComplete, t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    accept: accept ? { [accept]: [] } : undefined,
    maxSize,
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach(error => {
          if (error.code === 'file-too-large') {
            toast.error(`${file.name}: ${t.fileTooLarge}`);
          } else if (error.code === 'file-invalid-type') {
            toast.error(`${file.name}: ${t.invalidFileType}`);
          }
        });
      });
    }
  });

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const retryUpload = async (fileInfo: UploadedFile) => {
    setUploadedFiles(prev => 
      prev.map(f => 
        f.id === fileInfo.id 
          ? { ...f, status: 'uploading', progress: 0, error: undefined }
          : f
      )
    );

    try {
      const result = await uploadFile(fileInfo.file);
      
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileInfo.id 
            ? { ...f, progress: 100, status: 'success', result }
            : f
        )
      );

      toast.success(`${fileInfo.file.name} ${t.uploadSuccess}`);
      
    } catch (error) {
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileInfo.id 
            ? { ...f, status: 'error', error: error instanceof Error ? error.message : '上传失败' }
            : f
        )
      );

      toast.error(`${fileInfo.file.name} ${t.uploadError}`);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    } else if (file.type.startsWith('audio/')) {
      return <Music className="w-4 h-4" />;
    } else {
      return <File className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600">{t.dropzone}</p>
        {isUploading && (
          <p className="text-blue-600 mt-2">{t.uploading}</p>
        )}
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">
            {t.uploading} ({uploadedFiles.length})
          </h3>
          
          {uploadedFiles.map((fileInfo) => (
            <div
              key={fileInfo.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3 flex-1">
                {getFileIcon(fileInfo.file)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileInfo.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(fileInfo.file.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Progress Bar */}
                {fileInfo.status === 'uploading' && (
                  <div className="flex-1 max-w-xs">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${fileInfo.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Status Icons */}
                {fileInfo.status === 'success' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {fileInfo.status === 'error' && (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}

                {/* Action Buttons */}
                <div className="flex space-x-1">
                  {fileInfo.status === 'error' && (
                    <button
                      onClick={() => retryUpload(fileInfo)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {t.retry}
                    </button>
                  )}
                  <button
                    onClick={() => removeFile(fileInfo.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Messages */}
      {uploadedFiles.some(f => f.status === 'error') && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">
            {uploadedFiles.filter(f => f.status === 'error').map(f => f.error).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 