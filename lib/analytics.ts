import { DashboardData, VulnerabilityIncident } from './types';

// Helper to check if date is within range
const isWithinRange = (dateStr: string | number, range: { start: Date; end: Date }) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return date >= range.start && date <= range.end;
};

export const calculateKPIs = (data: DashboardData, range: { start: Date; end: Date }) => {
    // 1. Total Assets (Active in range - vague for endpoints, usually current snapshot)
    // For specific range, we can just count total unless we have historical asset data.
    // We'll stick to total endpoints for now as it's a snapshot.
    const totalAssets = data.endpoints.length;

    // 2. Filtered Vulnerabilities & Mitigations
    const rangeVulns = data.vulnerabilities.filter(v => {
        // Detected within range OR Active during range? 
        // Report usually focuses on what happened or what IS active.
        // Let's count vulnerabilities that were DETECTED in this range or are currently OPEN (if range includes today).
        // For annual report: "Vulnerabilities Detected in 2024".

        // However, "Active Vulnerabilities" KPI usually implies CURRENT status.
        // If we select a past range, it's tricky. 
        // Let's stick to: Active Vulnerabilities = Currently Open (snapshot). 
        // But the user wants "report restricted to date range".
        // Let's filter: Vulnerabilities that were OPEN at some point during the range? 
        // Or simply: Vulnerabilities Detected during range.

        // STANDARD: 
        // - "New Vulnerabilities": Detected in range.
        // - "Mitigated Vulnerabilities": Mitigated in range.
        // - "Active Vulnerabilities": Open at end of range. (Hard to calc without full history).

        // Simplified Logic for "Active":
        // If it's open NOW, it counts. (Snapshot based).
        // The file EndpointIncidentesVulnerabilities is a snapshot of current and recent.

        // Let's use the standard "Detected in Period" for trends, but "Current Active" for the big number, 
        // maybe just filtered by severity.
        // Actually, user said: "custom filtrado para seleccionar desde que dia... indicadores exactos"

        // Let's interpret: 
        // - Active Vulns: Count of vulns detected in range that are NOT mitigated? Or just detected?
        // Let's go with:
        // Total Active Vulns (Snapshot) -> Filtered by detection date? No, active is state.
        // Let's keep Active Vulns as "Currently Active" regardless of date (snapshot state), 
        // BUT we can filter "New Vulnerabilities" by date.

        // User asked for "Indicador de Assets en total" separately.

        // Let's refine: 
        // Risk Score & Active Vulns -> Snapshot state (maybe filter out very old unresolved if range is recent? No).
        // Let's apply range to "Detected" and "Mitigated" metrics deeply.
        // For "Active", we'll just show current state (as the CSV is a snapshot). 
        // But for "Risk Score", maybe only for assets seen in range?
        return true;
    });

    const rangeMitigations = data.mitigations.filter(m => isWithinRange(m.mitigation_date, range));

    // 2. Risk Score (Average CVSS of currently active vulns)
    // We use the snapshot state for this.
    const activeVulnerabilities = data.vulnerabilities.filter(v => !v.MitigatedEventDetectionDate || v.MitigatedEventDetectionDate === 0);
    const totalRiskScore = activeVulnerabilities.reduce((acc, curr) => acc + (curr.vulv3basescore || 0), 0);
    const avgRiskScore = activeVulnerabilities.length > 0 ? (totalRiskScore / activeVulnerabilities.length).toFixed(2) : 0;

    // 3. New Vulnerabilities (Detected in Range)
    const newVulnsInRange = data.vulnerabilities.filter(v => isWithinRange(v.eventcreatedat, range));

    // 4. Critical/High (of currently active)
    const criticalVulns = activeVulnerabilities.filter(v => {
        const sev = (v.severity || '').toLowerCase();
        return sev === 'critical' || sev === 'high';
    }).length;

    // 5. MTTR (in range)
    const totalMitigationTime = rangeMitigations.reduce((acc, curr) => acc + (curr.mitigation_time || 0), 0);
    const avgMTTR = rangeMitigations.length > 0 ? (totalMitigationTime / rangeMitigations.length).toFixed(1) : 0;

    return {
        totalAssets,
        avgRiskScore,
        totalActiveVulns: activeVulnerabilities.length, // Snapshot
        newVulns: newVulnsInRange.length, // Trend
        mitigatedVulns: rangeMitigations.length, // Trend
        criticalVulns,
        avgMTTR
    };
};

export const getSeverityDistribution = (data: DashboardData) => {
    // Current Active Vulnerabilities Snapshot
    const active = data.vulnerabilities.filter(v =>
        !v.MitigatedEventDetectionDate || v.MitigatedEventDetectionDate === 0
    );

    const dist: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };

    active.forEach(v => {
        // Normalize severity
        let sev = (v.severity || 'Low').trim();
        // Capitalize first letter
        sev = sev.charAt(0).toUpperCase() + sev.slice(1).toLowerCase();

        if (dist[sev] !== undefined) {
            dist[sev]++;
        } else {
            // Fallback for unknown severities if needed, or mapped
            if (sev === 'Ckritical') dist['Critical']++; // typo check?
        }
    });

    return Object.entries(dist).map(([name, value]) => ({ name, value }));
};

export const getMonthlyTrends = (data: DashboardData, range: { start: Date; end: Date }) => {
    const trends: Record<string, { detected: number; mitigated: number }> = {};

    // Initialize all months in range (to ensure continuity)
    const start = new Date(range.start);
    const end = new Date(range.end);
    const current = new Date(start);
    current.setDate(1); // Start at beginning of month

    while (current <= end) {
        const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        trends[key] = { detected: 0, mitigated: 0 };
        current.setMonth(current.getMonth() + 1);
    }

    // Detected Vulnerabilities
    data.vulnerabilities.forEach(v => {
        if (!v.eventcreatedat) return;
        if (isWithinRange(v.eventcreatedat, range)) {
            const date = new Date(v.eventcreatedat);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (trends[key]) trends[key].detected++;
        }
    });

    // Mitigated Vulnerabilities
    data.mitigations.forEach(m => {
        if (!m.mitigation_date) return;
        if (isWithinRange(m.mitigation_date, range)) {
            const date = new Date(m.mitigation_date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (trends[key]) trends[key].mitigated++;
        }
    });

    // Sort by date key
    return Object.entries(trends)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, counts]) => ({
            date,
            detected: counts.detected,
            mitigated: counts.mitigated
        }));
};

export const getOSDistribution = (data: DashboardData) => {
    const distribution: Record<string, number> = {};

    data.endpoints.forEach(e => {
        const os = e.SO || 'Unknown';
        distribution[os] = (distribution[os] || 0) + 1;
    });

    return Object.entries(distribution)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
};

export const getAssetStatus = (data: DashboardData) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30)).getTime();

    let active = 0;
    let inactive = 0;

    data.endpoints.forEach(e => {
        const lastSeen = Number(e.endpointUpdatedAt);
        if (!isNaN(lastSeen) && lastSeen > thirtyDaysAgo) {
            active++;
        } else {
            inactive++;
        }
    });

    return [
        { name: 'Active (<30 days)', value: active },
        { name: 'Inactive (>30 days)', value: inactive }
    ];
};

export const getTop50Mitigated = (data: DashboardData, range: { start: Date; end: Date }) => {
    const counts: Record<string, number> = {};

    data.mitigations.forEach(m => {
        if (isWithinRange(m.mitigation_date, range)) {
            const assetName = m.asset || 'Unknown';
            counts[assetName] = (counts[assetName] || 0) + 1;
        }
    });

    return Object.entries(counts)
        .map(([asset, count]) => ({ asset, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 50);
};

export const getTop50Vulnerable = (data: DashboardData) => {
    // Snapshot of current active, so no date range usually (unless "New vulnerabilities in range")
    // Usually "Top Vulnerable" implies "Who is most at risk RIGHT NOW". 
    // We'll keep it snapshot based.
    const counts: Record<string, number> = {};
    const activeData = data.vulnerabilities.filter(v => !v.MitigatedEventDetectionDate || v.MitigatedEventDetectionDate === 0);

    activeData.forEach(v => {
        const assetName = v.asset || 'Unknown';
        counts[assetName] = (counts[assetName] || 0) + 1;
    });

    return Object.entries(counts)
        .map(([asset, count]) => ({ asset, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 50);
};
