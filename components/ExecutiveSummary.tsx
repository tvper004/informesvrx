'use client';

import React, { useMemo, useState } from 'react';
import { useDashboard } from '@/lib/context';
import {
    calculateKPIs,
    getMonthlyTrends,
    getOSDistribution,
    getAssetStatus,
    getTop50Mitigated,
    getTop50Vulnerable
} from '@/lib/analytics';
import {
    Activity, AlertTriangle, CheckCircle, Clock, ShieldAlert,
    TrendingUp, Monitor, ListOrdered, Calendar as CalendarIcon
} from 'lucide-react';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MonthlyTrendsChart, DistributionChart, TopListTable } from './Charts';
import { DateRangePicker } from './DateRangePicker';
import { Modal } from './Modal';
import { clsx } from 'clsx';

export const ExecutiveSummary = () => {
    const { data, dateRange, setDateRange } = useDashboard();

    // Analytics Hooks
    const kpis = useMemo(() => calculateKPIs(data, dateRange), [data, dateRange]);
    const monthlyTrends = useMemo(() => getMonthlyTrends(data, dateRange), [data, dateRange]);
    const osDistribution = useMemo(() => getOSDistribution(data), [data]); // OS is snapshot
    const assetStatus = useMemo(() => getAssetStatus(data), [data]); // Status is snapshot
    const topMitigated = useMemo(() => getTop50Mitigated(data, dateRange), [data, dateRange]);
    const topVulnerable = useMemo(() => getTop50Vulnerable(data), [data]); // Vulnerable is snapshot

    // Severity Distribution (Filtered by snapshot or range? Usually snapshot of CURRENT active)
    const severityData = useMemo(() => {
        // Active vulnerabilities are those without mitigation date
        const active = data.vulnerabilities.filter(v =>
            !v.MitigatedEventDetectionDate || v.MitigatedEventDetectionDate === 0
        );

        const dist: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
        active.forEach(v => {
            let sev = (v.severity || 'Low').trim();
            sev = sev.charAt(0).toUpperCase() + sev.slice(1).toLowerCase();
            // Translate Severity Keys for display if needed, but usually standardized English terms are used. 
            // User requested Spanish. Let's map.
            if (dist[sev] !== undefined) dist[sev]++;
        });

        // Translate for Display
        const translations: Record<string, string> = {
            'Critical': 'Crítica',
            'High': 'Alta',
            'Medium': 'Media',
            'Low': 'Baja'
        };

        return Object.entries(dist).map(([name, value]) => ({
            name: translations[name] || name,
            value
        }));
    }, [data.vulnerabilities]);

    // --- Modal State & Logic ---
    const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; title: string; type: 'list' | 'cve'; data: any[] }>({
        isOpen: false,
        title: '',
        type: 'list',
        data: []
    });

    const openModal = (title: string, type: 'list' | 'cve', data: any[]) => {
        setModalConfig({ isOpen: true, title, type, data });
    };

    const handleOSClick = (entry: any) => {
        const assets = data.endpoints.filter(e => e.SO === entry.name); // Using original name might need care if translated? 
        // Wait, OS names come from CSV (Windows Server etc), no need to translate those usually.
        // But previously I translated severity names. Pie chart uses translated names for keys? 
        // Charts component uses `nameKey="name"`. 
        // For OS, names are raw from CSV.
        // `entry.name` comes from Recharts click payload.
        const assetsFiltered = data.endpoints.filter(e => e.SO === entry.name);
        openModal(`Activos: ${entry.name}`, 'list', assetsFiltered.map(a => ({ name: a.HOSTNAME, detail: a.VERSION })));
    };

    const handleStatusClick = (entry: any) => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30)).getTime();
        // Entry name will be translated in Chart? 
        // Wait, `getAssetStatus` returns English strings. I should update `getAssetStatus` or translate here.
        // Best implementation is to translate the logic here or in analytics.
        // Currently `getAssetStatus` returns 'Active (<30 days)' and 'Inactive...'.
        // I will translate strictly in the UI layer (here) but `getAssetStatus` stays English for logic? 
        // No, `getAssetStatus` returns data for the chart. I need to map it.
        // Actually, let's fix `getAssetStatus` in analytics OR just map it here.

        // I'll map it here for the click handler logic.
        // But the chart displays what `assetStatus` contains.
        // So I need to translate `assetStatus` array.

        const isInactive = entry.name.includes('Inactivo') || entry.name.includes('Inactive');

        const assets = data.endpoints.filter(e => {
            const lastSeen = Number(e.endpointUpdatedAt);
            if (!isInactive) return !isNaN(lastSeen) && lastSeen > thirtyDaysAgo;
            return isNaN(lastSeen) || lastSeen <= thirtyDaysAgo;
        });

        openModal(`Activos: ${entry.name}`, 'list', assets.map(a => ({ name: a.HOSTNAME, detail: new Date(a.endpointUpdatedAt).toLocaleDateString('es-ES') })));
    };

    const handleAssetClick = (assetName: string, type: 'mitigated' | 'vulnerable') => {
        if (type === 'mitigated') {
            const mitigations = data.mitigations.filter(m =>
                (m.asset === assetName) &&
                (!m.mitigation_date || (new Date(m.mitigation_date) >= dateRange.start && new Date(m.mitigation_date) <= dateRange.end))
            );
            openModal(`${assetName} - CVEs Mitigados`, 'cve', mitigations.map(m => ({ name: m.cve, detail: m.mitigation_date })));
        } else {
            const vulns = data.vulnerabilities.filter(v =>
                v.asset === assetName &&
                (!v.MitigatedEventDetectionDate || v.MitigatedEventDetectionDate === 0)
            );
            openModal(`${assetName} - Vulnerabilidades Activas`, 'cve', vulns.map(v => ({ name: v.cve, detail: v.severity })));
        }
    };

    // Translate Asset Status for Display
    const translatedAssetStatus = useMemo(() => {
        return assetStatus.map(item => ({
            name: item.name.includes('Inactive') ? 'Inactivo (>30 días)' : 'Activo (<30 días)',
            value: item.value
        }));
    }, [assetStatus]);

    const SEVERITY_COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6'];
    const OS_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];
    const STATUS_COLORS = ['#22c55e', '#94a3b8'];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header with Date Picker */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Tablero Ejecutivo</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Periodo del Reporte: {dateRange.start.toLocaleDateString('es-ES')} - {dateRange.end.toLocaleDateString('es-ES')}
                    </p>
                </div>
                <DateRangePicker
                    startDate={dateRange.start}
                    endDate={dateRange.end}
                    onChange={(s, e) => setDateRange({ start: s, end: e })}
                />
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title="Total de Activos" value={kpis.totalAssets} icon={<Monitor className="w-6 h-6 text-indigo-600" />} bg="bg-indigo-50" />
                <KpiCard title="Puntaje de Riesgo Prom." value={kpis.avgRiskScore} icon={<ShieldAlert className="w-6 h-6 text-red-600" />} bg="bg-red-50" />
                <KpiCard
                    title="Vulnerabilidades Activas"
                    value={kpis.totalActiveVulns}
                    subtext={`${kpis.criticalVulns} Críticas/Altas`}
                    icon={<AlertTriangle className="w-6 h-6 text-orange-600" />}
                    bg="bg-orange-50"
                />
                <KpiCard title="MTTR Promedio (Días)" value={Math.round(Number(kpis.avgMTTR))} icon={<Clock className="w-6 h-6 text-green-600" />} bg="bg-green-50" />
            </div>

            {/* Charts Row 1: Trends & Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Trends - Spans 2 cols */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-semibold text-slate-800">Tendencias (Detectadas vs Mitigadas)</h3>
                    </div>
                    <MonthlyTrendsChart data={monthlyTrends} />
                </div>

                {/* Severity Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Distribución por Severidad</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={severityData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {severityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[index % SEVERITY_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <LegendGrid data={severityData} colors={SEVERITY_COLORS} />
                    </div>
                </div>
            </div>

            {/* Charts Row 2: Asset Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Distribución por Sistema Operativo <span className="text-xs font-normal text-slate-400 ml-2">(Clic para detalles)</span></h3>
                    <div className="h-auto min-h-[400px] cursor-pointer">
                        <DistributionChart data={osDistribution} colors={OS_COLORS} onClick={handleOSClick} />
                        <LegendGrid data={osDistribution.slice(0, 5)} colors={OS_COLORS} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Estado de los Activos <span className="text-xs font-normal text-slate-400 ml-2">(Clic para detalles)</span></h3>
                    <div className="h-auto min-h-[400px] cursor-pointer">
                        <DistributionChart data={translatedAssetStatus} colors={STATUS_COLORS} onClick={handleStatusClick} />
                        <LegendGrid data={translatedAssetStatus} colors={STATUS_COLORS} />
                    </div>
                </div>
            </div>

            {/* Top 50 Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TopListTable
                    title="Top 50 Activos Más Mitigados"
                    data={monthlyTrends.length > 0 ? topMitigated : []} // Only show if data loaded
                    icon={<CheckCircle className="w-5 h-5 text-green-600" />}
                    colorClass="bg-green-50 text-green-800 border-green-100"
                    onRowClick={(asset) => handleAssetClick(asset, 'mitigated')}
                />
                <TopListTable
                    title="Top 50 Activos Más Vulnerables"
                    data={monthlyTrends.length > 0 ? topVulnerable : []} // Only show if data loaded
                    icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
                    colorClass="bg-red-50 text-red-800 border-red-100"
                    onRowClick={(asset) => handleAssetClick(asset, 'vulnerable')}
                />
            </div>

            {/* Drill Down Modal */}
            <Modal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                title={modalConfig.title}
            >
                <div className="overflow-hidden bg-white rounded-lg border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    {modalConfig.type === 'list' ? 'Nombre' : 'ID CVE'}
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    {modalConfig.type === 'list' ? 'Detalles' : 'Info'}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {modalConfig.data.slice(0, 100).map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                        {item.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">
                                        {item.detail}
                                    </td>
                                </tr>
                            ))}
                            {modalConfig.data.length > 100 && (
                                <tr>
                                    <td colSpan={2} className="px-6 py-4 text-center text-sm text-slate-400">
                                        ... y {modalConfig.data.length - 100} ítems más
                                    </td>
                                </tr>
                            )}
                            {modalConfig.data.length === 0 && (
                                <tr>
                                    <td colSpan={2} className="px-6 py-8 text-center text-sm text-slate-400">
                                        No se encontraron ítems.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Modal>
        </div>
    );
};

// Helper Components
const KpiCard = ({ title, value, subtext, icon, bg }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{value}</h3>
            {subtext && <p className="text-xs text-red-500 mt-1 font-medium">{subtext}</p>}
        </div>
        <div className={`p-3 ${bg} rounded-lg`}>
            {icon}
        </div>
    </div>
);

const LegendGrid = ({ data, colors }: { data: any[], colors: string[] }) => (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
        {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: colors[index % colors.length] }}></span>
                <span className="truncate max-w-[120px]">{entry.name}</span>
                <span className="font-semibold">({entry.value})</span>
            </div>
        ))}
    </div>
);
