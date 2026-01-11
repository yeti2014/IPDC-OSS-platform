// src/components/common/FileUpload.tsx
import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  LinearProgress,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert,
  Paper
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  AttachFile as FileIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { fileUploadService, UploadProgress, UploadResult } from '../../services/fileUploadService';

interface FileUploadProps {
  onFilesUploaded: (results: UploadResult[]) => void;
  maxFiles?: number;
  storagePath: string;
  existingFiles?: UploadResult[];
  onFileRemoved?: (file: UploadResult) => void;
}

interface FileWithProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  result?: UploadResult;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesUploaded,
  maxFiles = 5,
  storagePath,
  existingFiles = [],
  onFileRemoved
}) => {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length === 0) return;

    // Check max files limit
    const totalFiles = files.length + existingFiles.length + selectedFiles.length;
    if (totalFiles > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setError('');

    // Add files to state
    const newFiles: FileWithProgress[] = selectedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Start uploading
    uploadFiles(newFiles);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFiles = async (filesToUpload: FileWithProgress[]) => {
    const uploadResults: UploadResult[] = [];

    for (const fileWithProgress of filesToUpload) {
      try {
        // Update status to uploading
        updateFileStatus(fileWithProgress.file.name, 'uploading');

        const result = await fileUploadService.uploadFile(
          fileWithProgress.file,
          storagePath,
          (progress: UploadProgress) => {
            updateFileProgress(fileWithProgress.file.name, progress.progress);
          }
        );

        // Update status to success
        updateFileResult(fileWithProgress.file.name, 'success', result);
        uploadResults.push(result);
      } catch (error: any) {
        console.error('Upload error:', error);
        updateFileResult(fileWithProgress.file.name, 'error', undefined, error.message);
      }
    }

    // Notify parent of successful uploads
    if (uploadResults.length > 0) {
      onFilesUploaded(uploadResults);
    }
  };

  const updateFileProgress = (fileName: string, progress: number) => {
    setFiles(prev =>
      prev.map(f =>
        f.file.name === fileName ? { ...f, progress } : f
      )
    );
  };

  const updateFileStatus = (
    fileName: string,
    status: 'pending' | 'uploading' | 'success' | 'error'
  ) => {
    setFiles(prev =>
      prev.map(f =>
        f.file.name === fileName ? { ...f, status } : f
      )
    );
  };

  const updateFileResult = (
    fileName: string,
    status: 'success' | 'error',
    result?: UploadResult,
    error?: string
  ) => {
    setFiles(prev =>
      prev.map(f =>
        f.file.name === fileName ? { ...f, status, result, error } : f
      )
    );
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingFile = async (file: UploadResult) => {
    if (onFileRemoved) {
      try {
        await fileUploadService.deleteFile(file.path);
        onFileRemoved(file);
      } catch (error) {
        console.error('Error removing file:', error);
        setError('Failed to remove file');
      }
    }
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'error' => {
    switch (status) {
      case 'uploading': return 'primary';
      case 'success': return 'success';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const totalFiles = files.length + existingFiles.length;

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Upload Button */}
      <Paper variant="outlined" sx={{ p: 3, mb: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept={fileUploadService.getAllowedExtensions()}
        />
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => fileInputRef.current?.click()}
          disabled={totalFiles >= maxFiles}
        >
          Upload Files
        </Button>
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
          {totalFiles}/{maxFiles} files • Max 10MB per file
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          Allowed: {fileUploadService.getAllowedExtensions()}
        </Typography>
      </Paper>

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Existing Files ({existingFiles.length})
          </Typography>
          <List dense>
            {existingFiles.map((file, index) => (
              <ListItem key={index}>
                <FileIcon sx={{ mr: 2, color: 'primary.main' }} />
                <ListItemText
                  primary={file.fileName}
                  secondary={fileUploadService.formatFileSize(file.size)}
                />
                <ListItemSecondaryAction>
                  <Chip label="Uploaded" color="success" size="small" sx={{ mr: 1 }} />
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => handleRemoveExistingFile(file)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Uploading/Uploaded Files */}
      {files.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Upload Queue ({files.length})
          </Typography>
          <List dense>
            {files.map((fileWithProgress, index) => (
              <ListItem key={index}>
                <FileIcon sx={{ mr: 2, color: 'primary.main' }} />
                <ListItemText
                  primary={fileWithProgress.file.name}
                  secondaryTypographyProps={{ component: 'div' }}
                  secondary={
                    <Box>
                      <Typography variant="caption" display="block">
                        {fileUploadService.formatFileSize(fileWithProgress.file.size)}
                      </Typography>
                      {fileWithProgress.status === 'uploading' && (
                        <LinearProgress
                          variant="determinate"
                          value={fileWithProgress.progress}
                          sx={{ mt: 1 }}
                        />
                      )}
                      {fileWithProgress.error && (
                        <Typography variant="caption" color="error" display="block">
                          {fileWithProgress.error}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Chip
                    label={fileWithProgress.status}
                    color={getStatusColor(fileWithProgress.status)}
                    size="small"
                    icon={fileWithProgress.status === 'success' ? <CheckIcon /> : undefined}
                    sx={{ mr: 1 }}
                  />
                  {fileWithProgress.status !== 'uploading' && (
                    <IconButton edge="end" size="small" onClick={() => handleRemoveFile(index)}>
                      <DeleteIcon />
                    </IconButton>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;
