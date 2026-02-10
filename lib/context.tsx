'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DashboardData, Endpoint, VulnerabilityIncident, Mitigation, EndpointTask, EndpointGroup } from './types';
import { parseCSV, identifyFileType, FileType } from './csvUtils';

interface DashboardContextType {
    data: DashboardData;
    isLoading: boolean;
    error: string | null;
    letterhead: string | null;
    setLetterhead: (url: string | null) => void;
    dateRange: { start: Date; end: Date };
    setDateRange: (range: { start: Date; end: Date }) => void;
    loadFiles: (files: File[]) => Promise<void>;
    resetData: () => void;
}

const initialData: DashboardData = {
    endpoints: [],
    vulnerabilities: [],
    mitigations: [],
    tasks: [],
    groups: [],
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
    const [data, setData] = useState<DashboardData>(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [letterhead, setLetterhead] = useState<string | null>(null);

    // Default to current year or a reasonable range
    const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
        const end = new Date();
        const start = new Date(new Date().getFullYear(), 0, 1); // Jan 1st of current year
        return { start, end };
    });

    const loadFiles = async (files: File[]) => {
        setIsLoading(true);
        setError(null);
        let newData = { ...data };

        try {
            for (const file of files) {
                const type = identifyFileType(file.name);

                if (type === FileType.UNKNOWN) {
                    console.warn(`Unknown file type: ${file.name}`);
                    continue;
                }

                const result = await parseCSV<any>(file);

                switch (type) {
                    case FileType.ENDPOINTS:
                        newData.endpoints = result.data as Endpoint[];
                        break;
                    case FileType.VULNERABILITIES:
                        newData.vulnerabilities = result.data as VulnerabilityIncident[];
                        break;
                    case FileType.MITIGATIONS:
                        newData.mitigations = result.data as Mitigation[];
                        break;
                    case FileType.TASKS:
                        newData.tasks = result.data as EndpointTask[];
                        break;
                    case FileType.GROUPS:
                        newData.groups = result.data as EndpointGroup[];
                        break;
                }
            }
            setData(newData);
        } catch (err: any) {
            setError(err.message || 'Error parsing files');
        } finally {
            setIsLoading(false);
        }
    };

    const resetData = () => {
        setData(initialData);
        setError(null);
        setLetterhead(null);
    };

    return (
        <DashboardContext.Provider value={{
            data,
            isLoading,
            error,
            letterhead,
            setLetterhead,
            dateRange,
            setDateRange,
            loadFiles,
            resetData
        }}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};
