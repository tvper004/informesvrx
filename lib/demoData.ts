import { DashboardData, Endpoint, VulnerabilityIncident, Mitigation } from './types';

export const demoData: DashboardData = {
    endpoints: Array.from({ length: 45 }, (_, i) => ({
        ID: `DEMO-ASSET-${i + 1}`,
        HOSTNAME: `SRV-PROD-0${i + 1}`,
        HASH: `hash-${Math.random().toString(36).substring(7)}`,
        SO: i % 3 === 0 ? 'Windows Server 2022' : i % 3 === 1 ? 'Ubuntu 22.04 LTS' : 'Windows 10 Pro',
        VERSION: i % 3 === 0 ? '10.0.20348' : i % 3 === 1 ? '22.04.3' : '22H2',
        endpointUpdatedAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).getTime().toString(),
    })),
    vulnerabilities: Array.from({ length: 180 }, (_, i) => {
        const severity = ['Critical', 'High', 'Medium', 'Low'][i % 4];
        const assetId = `DEMO-ASSET-${(i % 45) + 1}`;
        const asset = `SRV-PROD-0${(i % 45) + 1}`;
        return {
            assetid: assetId,
            asset: asset,
            cve: `CVE-2024-${1000 + i}`,
            severity,
            eventType: 'Vulnerability Detected',
            publisher: i % 2 === 0 ? 'Microsoft' : 'Canonical',
            apporso: i % 2 === 0 ? 'Windows System' : 'Kernel',
            threatLevelId: 4 - (i % 4),
            vulV3exploitlevel: Math.floor(Math.random() * 10),
            vulv3basescore: 7.0 + Math.random() * 3,
            patchId: `KB500${2000 + i}`,
            vulsummary: `Sample vulnerability description for demo purposes.`,
            eventcreatedat: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
            eventupdatedat: new Date().toISOString(),
            MitigatedEventDetectionDate: i % 3 === 0 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).getTime() : 0,
        };
    }),
    mitigations: Array.from({ length: 120 }, (_, i) => {
        const assetId = `DEMO-ASSET-${(i % 45) + 1}`;
        const asset = `SRV-PROD-0${(i % 45) + 1}`;
        const detectDate = new Date(Date.now() - (40 + Math.random() * 50) * 24 * 60 * 60 * 1000);
        const mitigateDate = new Date(detectDate.getTime() + (Math.random() * 15) * 24 * 60 * 60 * 1000);
        return {
            assetid: assetId,
            asset: asset,
            cve: `CVE-2023-${5000 + i}`,
            severity: ['Critical', 'High', 'Medium'][i % 3],
            eventType: 'Vulnerability Mitigated',
            mitigation_date: mitigateDate.toISOString(),
            detection_date: detectDate.toISOString(),
            mitigation_time: Math.floor((mitigateDate.getTime() - detectDate.getTime()) / (1000 * 60 * 60 * 24)),
        };
    }),
    tasks: [],
    groups: [
        { groupname: 'Producción', assets: 'SRV-PROD-01|SRV-PROD-02|SRV-PROD-03|SRV-PROD-04|SRV-PROD-05|' },
        { groupname: 'Desarrollo', assets: 'SRV-PROD-06|SRV-PROD-07|SRV-PROD-08|' }
    ],
};
