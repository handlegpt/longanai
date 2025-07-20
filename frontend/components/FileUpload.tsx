'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, X } from 'lucide-react';
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

export default function FileUpload({ translations }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.filter(file => {
      const isValidType = ['text/plain', 'application/pdf', '.doc', '.docx'].some(type => 
        file.name.toLowerCase().includes(type) || file.type.includes(type)
      );
      
      if (!isValidType) {
        toast.error(`${file.name} ${translations.unsupportedFormat}`);
        return false;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast.error(`${file.name} ${translations.fileTooLarge}`);
        return false;
      }
      
      return true;
    });

    setUploadedFiles(prev => [...prev, ...newFiles]);
    toast.success(translations.uploadSuccess.replace('{count}', newFiles.length.toString()));
  }, [translations]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const generateFromFiles = async () => {
    if (uploadedFiles.length === 0) {
      toast.error(translations.noFilesUploaded);
      return;
    }

    // TODO: 实现从文件生成播客的逻辑
    toast.success(translations.generatingFromFiles);
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{translations.title}</h3>
      
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
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 rounded-full hover:bg-gray-200"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
          
          <button
            onClick={generateFromFiles}
            className="w-full btn-primary mt-4"
          >
            {translations.generateFromFiles}
          </button>
        </motion.div>
      )}
    </div>
  );
} 