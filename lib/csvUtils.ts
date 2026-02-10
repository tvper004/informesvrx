import Papa from 'papaparse';
import { Endpoint, VulnerabilityIncident, Mitigation, EndpointTask, EndpointGroup } from './types';

export enum FileType {
    ENDPOINTS = 'Endpoints',
    VULNERABILITIES = 'EndpointIncidentesVulnerabilities',
    MITIGATIONS = 'MitigationTime',
    TASKS = 'EndpointsEventTask',
    GROUPS = 'EndpointsGroup',
    UNKNOWN = 'unknown'
}

type ParsedData<T> = { data: T[], errors: any[] };

export const parseCSV = <T>(file: File): Promise<ParsedData<T>> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: (results) => {
                resolve({ data: results.data as T[], errors: results.errors });
            },
            error: (error) => {
                reject(error);
            },
        });
    });
};

export const identifyFileType = (filename: string): FileType => {
    if (filename.includes('Endpoints.csv')) return FileType.ENDPOINTS;
    if (filename.includes('EndpointIncidentesVulnerabilities.csv')) return FileType.VULNERABILITIES;
    if (filename.includes('MitigationTime.csv')) return FileType.MITIGATIONS;
    if (filename.includes('EndpointsEventTask.csv')) return FileType.TASKS;
    if (filename.includes('EndpointsGroup.csv')) return FileType.GROUPS;
    return FileType.UNKNOWN;
};
