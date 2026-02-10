'use client';

import React, { useMemo, useState } from 'react';
import { useDashboard } from '@/lib/context';
import {
    calculateKPIs,
    getMonthlyTrends,
    getOSDistribution,
    getAssetStatus,
    getTop50Mitigated,
    getTop50Vulnerable,
    getSeverityDistribution
} from '@/lib/analytics';
import {
    Activity, AlertTriangle, CheckCircle, Clock, ShieldAlert, ShieldCheck,
    TrendingUp, Monitor, ListOrdered, Calendar as CalendarIcon
} from 'lucide-react';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MonthlyTrendsChart, DistributionChart, DistributionLegend, TopListTable } from './Charts';
import { DateRangePicker } from './DateRangePicker';
import { Modal } from './Modal';
import { clsx } from 'clsx';

export const ExecutiveSummary = () => {
    const { data, dateRange, setDateRange, totalLicenses, setTotalLicenses } = useDashboard();

    // Analytics Hooks
    const kpis = useMemo(() => calculateKPIs(data, dateRange), [data, dateRange]);
    const monthlyTrends = useMemo(() => getMonthlyTrends(data, dateRange), [data, dateRange]);
    const osDistribution = useMemo(() => getOSDistribution(data), [data]); // OS is snapshot
    const assetStatus = useMemo(() => getAssetStatus(data), [data]); // Status is snapshot
    const topMitigated = useMemo(() => getTop50Mitigated(data, dateRange), [data, dateRange]);
    const topVulnerable = useMemo(() => getTop50Vulnerable(data), [data]); // Vulnerable is snapshot

    // Severity Distribution Data
    const severityDataDetected = useMemo(() => {
        const dist = getSeverityDistribution(data, 'detected', dateRange);
        const translations: Record<string, string> = { 'Critical': 'Crítica', 'High': 'Alta', 'Medium': 'Media', 'Low': 'Baja' };
        return dist.map(d => ({ name: translations[d.name] || d.name, value: d.value }));
    }, [data, dateRange]);

    const severityDataMitigated = useMemo(() => {
        const dist = getSeverityDistribution(data, 'mitigated', dateRange);
        const translations: Record<string, string> = { 'Critical': 'Crítica', 'High': 'Alta', 'Medium': 'Media', 'Low': 'Baja' };
        return dist.map(d => ({ name: translations[d.name] || d.name, value: d.value }));
    }, [data, dateRange]);

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
        const assetsFiltered = data.endpoints.filter(e => e.SO === entry.name);
        openModal(`Activos: ${entry.name}`, 'list', assetsFiltered.map(a => ({ name: a.HOSTNAME, detail: a.VERSION })));
    };

    const handleStatusClick = (entry: any) => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30)).getTime();
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
                    <div className="space-y-6">
                        <MonthlyTrendsChart data={monthlyTrends} />

                        {/* Trends Table */}
                        <div className="overflow-x-auto border border-slate-100 rounded-lg">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-50 text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-4 py-2 font-semibold border-b">Métrica</th>
                                        {monthlyTrends.map(m => (
                                            <th key={m.date} className="px-4 py-2 font-semibold border-b text-center">{m.date}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-slate-50">
                                        <td className="px-4 py-2 font-medium text-slate-700 bg-slate-50/50">Detectadas</td>
                                        {monthlyTrends.map(m => (
                                            <td key={m.date} className="px-4 py-2 text-center text-slate-600 font-mono">{m.detected.toLocaleString()}</td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 font-medium text-slate-700 bg-slate-50/50">Mitigadas</td>
                                        {monthlyTrends.map(m => (
                                            <td key={m.date} className="px-4 py-2 text-center text-slate-600 font-mono">{m.mitigated.toLocaleString()}</td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Severidad Detectadas */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Severidad de Detectadas</h3>
                    <div className="h-auto">
                        <DistributionChart data={severityDataDetected} colors={SEVERITY_COLORS} />
                        <DistributionLegend data={severityDataDetected} colors={SEVERITY_COLORS} />
                    </div>
                </div>
            </div>

            {/* Severity Mitigated Row & License Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Severidad de Mitigadas</h3>
                    <div className="h-auto">
                        <DistributionChart data={severityDataMitigated} colors={SEVERITY_COLORS} />
                        <DistributionLegend data={severityDataMitigated} colors={SEVERITY_COLORS} />
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <ShieldCheck className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-semibold text-slate-800">Uso de Licencias Vicarius</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-500 uppercase tracking-wider">Licencias Contratadas</label>
                            <input
                                type="number"
                                value={totalLicenses}
                                onChange={(e) => setTotalLicenses(parseInt(e.target.value) || 0)}
                                className="w-full text-2xl font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                            <p className="text-xs text-slate-400 font-medium italic">Campo editable para el reporte</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-500 uppercase tracking-wider">Licencias Consumidas</label>
                            <div className="text-3xl font-bold text-slate-900">{kpis.totalAssets}</div>
                            <p className="text-xs text-slate-400 font-medium italic">Basado en activos totales</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-500 uppercase tracking-wider">Disponibilidad</label>
                            <div className={clsx(
                                "text-3xl font-bold",
                                (totalLicenses - kpis.totalAssets) < 0 ? "text-red-600" : "text-green-600"
                            )}>
                                {totalLicenses - kpis.totalAssets}
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-2">
                                <div
                                    className={clsx(
                                        "h-full transition-all duration-500",
                                        (kpis.totalAssets / totalLicenses) > 0.9 ? "bg-red-500" : "bg-indigo-500"
                                    )}
                                    style={{ width: `${Math.min((kpis.totalAssets / totalLicenses) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 2: Asset Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Distribución por Sistema Operativo <span className="text-xs font-normal text-slate-400 ml-2">(Clic para detalles)</span></h3>
                    <div className="h-auto min-h-[300px] cursor-pointer">
                        <DistributionChart data={osDistribution} colors={OS_COLORS} onClick={handleOSClick} />
                        <DistributionLegend data={osDistribution.slice(0, 6)} colors={OS_COLORS} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Estado de los Activos <span className="text-xs font-normal text-slate-400 ml-2">(Clic para detalles)</span></h3>
                    <div className="h-auto min-h-[300px] cursor-pointer">
                        <DistributionChart data={translatedAssetStatus} colors={STATUS_COLORS} onClick={handleStatusClick} />
                        <DistributionLegend data={translatedAssetStatus} colors={STATUS_COLORS} />
                    </div>
                </div>
            </div>

            {/* Top 50 Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TopListTable
                    title="Top 50 Activos Más Mitigados"
                    data={monthlyTrends.length > 0 ? topMitigated : []}
                    icon={<CheckCircle className="w-5 h-5 text-green-600" />}
                    colorClass="bg-green-50 text-green-800 border-green-100"
                    onRowClick={(asset) => handleAssetClick(asset, 'mitigated')}
                />
                <TopListTable
                    title="Top 50 Activos Más Vulnerables"
                    data={monthlyTrends.length > 0 ? topVulnerable : []}
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
