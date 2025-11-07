import React from 'react';
import { useDropzone } from 'react-dropzone';
import type { FileWithPath } from 'react-dropzone';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

interface VariantImageDropzoneProps {
    onFileAccepted: (file: File, url: string) => void;
    previewUrl: string | null;
}

const VariantImageDropzone: React.FC<VariantImageDropzoneProps> = ({ onFileAccepted, previewUrl }) => {
    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        accept: { 'image/*': [] },
        maxFiles: 1,
        maxSize: MAX_IMAGE_SIZE,
        onDrop: (acceptedFiles: FileWithPath[]) => {
            if (acceptedFiles[0]) {
                const url = URL.createObjectURL(acceptedFiles[0]);
                onFileAccepted(acceptedFiles[0], url);
            }
        },
    });
    return (
        <div {...getRootProps()} style={{ border: '2px dashed #aaa', borderRadius: 8, padding: 16, textAlign: 'center', cursor: 'pointer', background: isDragActive ? '#f0f0f0' : '#fff' }}>
            <input {...getInputProps()} />
            <p>{isDragActive ? 'Drop it' : 'Drag and drop or click to select image'}</p>
            {fileRejections.length > 0 && (
                <p style={{ color: 'red' }}>File size must be less than 5MB!</p>
            )}
            {previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Preview" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8, margin: '0 auto' }} />
            )}
        </div>
    );
};

export default VariantImageDropzone; 