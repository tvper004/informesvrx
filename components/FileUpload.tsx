'use client';

import React, { useCallback, useState } from 'react';
import { useDashboard } from '@/lib/context';
import { Upload, FileCheck, X, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const FileUpload = () => {
    const { loadFiles, isLoading, error } = useDashboard();
    const [dragActive, setDragActive] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files);
            processFiles(files);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            processFiles(files);
        }
    };

    const processFiles = (files: File[]) => {
        // Filter only CSVs if needed, or rely on parsing
        setSelectedFiles(prev => [...prev, ...files]);
        loadFiles(files);
    };

    const removeFile = (index: number) => {
        // This is tricky because loadFiles is additive in context currently.
        // For now, reload functionality might be needed, or just keep adding.
        // Actually, context.loadFiles is additive.
        // To simplify, we just show what was uploaded.
        // Real implementation might need reset.
    };

    return (
        <div className="w-full max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                Upload Data Reports
            </h2>
            <p className="text-sm text-slate-500 mb-4">
                Drag and drop your standard Vicarius CSV reports here (Endpoints, Vulnerabilities, Mitigations, Tasks).
            </p>

            <div
                className={twMerge(
                    "relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                    dragActive ? "border-indigo-600 bg-indigo-50" : "border-slate-300 bg-slate-50 hover:bg-slate-100"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload-input')?.click()}
            >
                <Upload className={twMerge("w-10 h-10 mb-3", dragActive ? "text-indigo-600" : "text-slate-400")} />
                <p className="text-sm text-slate-500 font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-400 mt-1">CSV files only</p>
                <input
                    id="file-upload-input"
                    type="file"
                    className="hidden"
                    multiple
                    accept=".csv"
                    onChange={handleChange}
                />
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {selectedFiles.length > 0 && (
                <div className="mt-6 space-y-2">
                    <h3 className="text-sm font-semibold text-slate-700">Uploaded Files</h3>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                        {selectedFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200 text-sm">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <FileCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span className="truncate text-slate-700">{file.name}</span>
                                </div>
                                <span className="text-xs text-slate-400 ml-2">{(file.size / 1024).toFixed(1)} KB</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="mt-4 flex items-center justify-center text-sm text-indigo-600">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Data...
                </div>
            )}
        </div>
    );
};
