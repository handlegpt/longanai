'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

interface FileUploadProps {
  translations: {
    title: string;
    dragText: string;
    dragActiveText: string;
    formatText: string;
    uploadedFiles: string;
    generateFromFiles: string;
    uploadSuccess: string;
    uploadError: string;
    fileTooLarge: string;
    unsupportedFormat: string;
    noFilesUploaded: string;
    generatingFromFiles: string;
  };
}

// 安全的文件类型配置
const ALLOWED_FILE_TYPES = {
  'text/plain': ['.txt'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/markdown': ['.md']
};

// 危险文件扩展名黑名单
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
  '.php', '.asp', '.aspx', '.jsp', '.py', '.pl', '.rb', '.sh', '.cgi',
  '.dll', '.so', '.dylib', '.sys', '.drv', '.bin', '.msi', '.app'
];

// 文件大小限制（10MB）
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function FileUpload({ translations }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // 验证文件扩展名
  const validateFileExtension = (filename: string): boolean => {
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    
    // 检查是否在黑名单中
    if (DANGEROUS_EXTENSIONS.includes(extension)) {
      return false;
    }
    
    // 检查是否在允许列表中
    const allowedExtensions = Object.values(ALLOWED_FILE_TYPES).flat();
    return allowedExtensions.includes(extension);
  };

  // 验证文件大小
  const validateFileSize = (size: number): boolean => {
    return size <= MAX_FILE_SIZE;
  };

  // 验证文件类型
  const validateFileType = (file: File): boolean => {
    // 检查 MIME 类型
    if (Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
      return true;
    }
    
    // 如果 MIME 类型不匹配，检查文件扩展名
    return validateFileExtension(file.name);
  };

  // 获取文件类型描述
  const getFileTypeDescription = (filename: string): string => {
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    const typeDescriptions: { [key: string]: string } = {
      '.txt': '纯文本文件',
      '.pdf': 'PDF文档',
      '.doc': 'Word 97-2003文档',
      '.docx': 'Word 2007+文档',
      '.md': 'Markdown文档'
    };
    return typeDescriptions[extension] || '未知格式';
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // 处理被拒绝的文件
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach((error: any) => {
        if (error.code === 'file-too-large') {
          toast.error(`${file.name} ${translations.fileTooLarge}`);
        } else if (error.code === 'file-invalid-type') {
          toast.error(`${file.name} ${translations.unsupportedFormat}`);
        } else {
          toast.error(`${file.name}: ${error.message}`);
        }
      });
    });

    // 额外的安全检查
    const validFiles = acceptedFiles.filter(file => {
      // 检查文件扩展名
      if (!validateFileExtension(file.name)) {
        toast.error(`${file.name} 包含不安全的文件扩展名`);
        return false;
      }
      
      // 检查文件大小
      if (!validateFileSize(file.size)) {
        toast.error(`${file.name} ${translations.fileTooLarge}`);
        return false;
      }
      
      // 检查文件类型
      if (!validateFileType(file)) {
        toast.error(`${file.name} ${translations.unsupportedFormat}`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      toast.success(translations.uploadSuccess.replace('{count}', validFiles.length.toString()));
    }
  }, [translations]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    validator: (file) => {
      // 额外的验证器
      if (!validateFileExtension(file.name)) {
        return {
          code: 'file-invalid-type',
          message: '不安全的文件扩展名'
        };
      }
      return null;
    }
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const generateFromFiles = async () => {
    if (uploadedFiles.length === 0) {
      toast.error(translations.noFilesUploaded);
      return;
    }

    setUploading(true);
    try {
      // TODO: 实现从文件生成播客的逻辑
      toast.success(translations.generatingFromFiles);
    } catch (error) {
      toast.error(translations.uploadError);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{translations.title}</h3>
      
      {/* 安全提示 */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-700">
            安全提示：仅支持安全的文档格式，最大文件大小 10MB
          </span>
        </div>
      </div>
      
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">
          {isDragActive ? translations.dragActiveText : translations.dragText}
        </p>
        <p className="text-sm text-gray-500">
          {translations.formatText}
        </p>
        
        {/* 支持格式列表 */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {Object.entries(ALLOWED_FILE_TYPES).map(([mimeType, extensions]) => (
            <span
              key={mimeType}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
            >
              {extensions.join(', ')}
            </span>
          ))}
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <h4 className="font-medium text-gray-900 mb-3">{translations.uploadedFiles}</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {getFileTypeDescription(file.name)} • {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                  title="删除文件"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
          
          <button
            onClick={generateFromFiles}
            disabled={uploading}
            className="w-full btn-primary mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>处理中...</span>
              </div>
            ) : (
              translations.generateFromFiles
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
} 