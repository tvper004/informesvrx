'use client';

import React, { useRef, useMemo } from 'react';
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
import { MonthlyTrendsChart, DistributionChart, DistributionLegend } from '@/components/Charts';
import { Printer, Upload, ArrowLeft, Trash2, Calendar, FileText, Monitor, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { DateRangePicker } from '@/components/DateRangePicker';

export default function ReportPage() {
    const { data, letterhead, setLetterhead, dateRange, setDateRange, totalLicenses } = useDashboard();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Analytics Calculation (Scoped to Report Range)
    const kpis = useMemo(() => calculateKPIs(data, dateRange), [data, dateRange]);
    const monthlyTrends = useMemo(() => getMonthlyTrends(data, dateRange), [data, dateRange]);
    const osDistribution = useMemo(() => getOSDistribution(data), [data]);
    const assetStatus = useMemo(() => getAssetStatus(data), [data]);
    const topMitigated = useMemo(() => getTop50Mitigated(data, dateRange), [data, dateRange]);
    const topVulnerable = useMemo(() => getTop50Vulnerable(data), [data]);

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

    const handlePrint = () => {
        window.print();
    };

    const handleLetterheadUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setLetterhead(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const formatDate = (date: Date) => date.toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' });

    const SEVERITY_COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6'];
    const OS_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];
    const STATUS_COLORS = ['#22c55e', '#94a3b8'];

    return (
        <div className="min-h-screen bg-slate-100 print:bg-white print:p-0 font-serif text-slate-800">

            {/* Toolbar - Hidden when printing */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 print:hidden shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800">Generador de Informes</h1>
                        <p className="text-xs text-slate-500">Configurar diseño e imprimir</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <DateRangePicker
                        startDate={dateRange.start}
                        endDate={dateRange.end}
                        onChange={(s, e) => setDateRange({ start: s, end: e })}
                    />

                    <div className="h-6 w-px bg-slate-200 mx-2"></div>

                    <div className="hidden sm:flex items-center gap-2">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleLetterheadUpload}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                        >
                            <Upload className="w-4 h-4" />
                            {letterhead ? 'Cambiar Membrete' : 'Subir Membrete'}
                        </button>
                        {letterhead && (
                            <button
                                onClick={() => setLetterhead(null)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                title="Quitar Membrete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-md transition-all hover:scale-105 active:scale-95"
                    >
                        <Printer className="w-4 h-4" />
                        Imprimir Informe
                    </button>
                </div>
            </div>

            {/* A4 Preview Container */}
            <div className="flex flex-col items-center p-8 print:p-0 print:block">

                {/* --- PAGE 1: Executive Summary --- */}
                <ReportPageLayout letterhead={letterhead}>
                    <div className="text-center mb-6 mt-2">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Informe Automatizado de Seguridad</h1>
                        <hr className="border-t-2 border-slate-900 w-full mb-4" />
                        <div className="flex items-center justify-center gap-2 text-slate-400 bg-slate-50 inline-flex px-3 py-1 rounded-full text-xs">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDate(dateRange.start)} - {formatDate(dateRange.end)}</span>
                        </div>
                    </div>

                    <div className="bg-slate-50 border-l-4 border-indigo-500 p-5 mb-6 rounded-r-lg">
                        <h2 className="text-lg font-bold text-slate-800 mb-2 font-serif uppercase tracking-tight">Resumen Ejecutivo</h2>
                        <p className="text-slate-600 text-[13px] leading-relaxed text-justify">
                            Este informe proporciona un análisis exhaustivo de la postura de ciberseguridad de la organización para el período seleccionado.
                            Actualmente estamos monitoreando un total de <strong className="text-slate-900">{kpis.totalAssets} activos</strong>.
                            En términos de gestión de recursos, disponemos de un total de <strong className="text-slate-900">{totalLicenses} licencias contratadas</strong>, de las cuales <strong className="text-slate-900">{kpis.totalAssets} están consumidas</strong>, dejando un margen de <strong className="text-green-600">{Math.max(0, totalLicenses - kpis.totalAssets)} licencias libres</strong>.
                        </p>
                        <p className="text-slate-600 text-[13px] leading-relaxed text-justify mt-3">
                            Durante este período, nuestros esfuerzos de remediación han abordado con éxito <strong className="text-green-600">{kpis.mitigatedVulns} vulnerabilidades</strong>.
                            El análisis actual muestra un Puntaje de Riesgo Promedio de <strong className="text-slate-900">{kpis.avgRiskScore}</strong>.
                            Las estrategias de remediación activa han mantenido un Tiempo Medio de Remediación (MTTR) de <strong className="text-indigo-600">{kpis.avgMTTR} días</strong>.
                            Es crucial priorizar las {kpis.criticalVulns} vulnerabilidades Críticas/Altas identificadas en el backlog activo.
                        </p>
                    </div>

                    <div className="break-inside-avoid">
                        <div className="flex items-center gap-2 mb-1 border-b pb-1 border-slate-200">
                            <TrendingUp className="w-5 h-5 text-indigo-600" />
                            <h3 className="text-xl font-bold text-slate-800">Análisis de Tendencias de Vulnerabilidad</h3>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                            Volumen mensual de vulnerabilidades detectadas frente a mitigaciones ejecutadas.
                        </p>
                        <div className="w-full mb-4">
                            <MonthlyTrendsChart data={monthlyTrends} height={200} />
                        </div>

                        {/* Monthly Trends Table */}
                        <div className="overflow-x-auto border border-slate-100 rounded-lg">
                            <table className="w-full text-[10px] text-left">
                                <thead className="bg-slate-50 text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-3 py-1.5 font-semibold border-b">Métrica</th>
                                        {monthlyTrends.map(m => (
                                            <th key={m.date} className="px-3 py-1.5 font-semibold border-b text-center">{m.date}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-slate-50">
                                        <td className="px-3 py-1.5 font-medium text-slate-700 bg-slate-50/30">Detectadas</td>
                                        {monthlyTrends.map(m => (
                                            <td key={m.date} className="px-3 py-1.5 text-center text-slate-600 font-mono">{m.detected.toLocaleString()}</td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-1.5 font-medium text-slate-700 bg-slate-50/30">Mitigadas</td>
                                        {monthlyTrends.map(m => (
                                            <td key={m.date} className="px-3 py-1.5 text-center text-slate-600 font-mono">{m.mitigated.toLocaleString()}</td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </ReportPageLayout>

                {/* --- PAGE 2: Distribution Charts (Stacked) --- */}
                <ReportPageLayout letterhead={letterhead}>
                    <div className="space-y-4">
                        <div className="break-inside-avoid">
                            <div className="flex items-center gap-2 mb-1 border-b pb-1 border-slate-200">
                                <FileText className="w-5 h-5 text-indigo-600" />
                                <h3 className="text-xl font-bold text-slate-800">Severidad de Vulnerabilidades Detectadas</h3>
                            </div>
                            <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                                Desglose de vulnerabilidades identificadas durante este período, clasificadas por su nivel de impacto crítico.
                            </p>
                            <div className="flex items-center justify-center gap-4">
                                <div className="w-1/2">
                                    <DistributionChart data={severityDataDetected} colors={SEVERITY_COLORS} height={180} />
                                </div>
                                <div className="w-1/2">
                                    <DistributionLegend data={severityDataDetected} colors={SEVERITY_COLORS} columns={1} />
                                </div>
                            </div>
                        </div>

                        <div className="break-inside-avoid">
                            <div className="flex items-center gap-2 mb-1 border-b pb-1 border-slate-200">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <h3 className="text-xl font-bold text-slate-800">Severidad de Vulnerabilidades Mitigadas</h3>
                            </div>
                            <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                                Representación de la efectividad en la resolución de problemas según su nivel de severidad original.
                            </p>
                            <div className="flex items-center justify-center gap-4">
                                <div className="w-1/2">
                                    <DistributionChart data={severityDataMitigated} colors={SEVERITY_COLORS} height={180} />
                                </div>
                                <div className="w-1/2">
                                    <DistributionLegend data={severityDataMitigated} colors={SEVERITY_COLORS} columns={1} />
                                </div>
                            </div>
                        </div>

                        <div className="break-inside-avoid">
                            <div className="flex items-center gap-2 mb-1 border-b pb-1 border-slate-200">
                                <Monitor className="w-5 h-5 text-slate-600" />
                                <h3 className="text-xl font-bold text-slate-800">Distribución por Sistemas Operativos</h3>
                            </div>
                            <div className="flex items-center justify-center gap-4">
                                <div className="w-1/2">
                                    <DistributionChart data={osDistribution} colors={OS_COLORS} height={180} />
                                </div>
                                <div className="w-1/2">
                                    <DistributionLegend data={osDistribution.slice(0, 5)} colors={OS_COLORS} columns={1} />
                                </div>
                            </div>
                        </div>
                    </div>
                </ReportPageLayout>

                {/* --- PAGE 3+: Detailed Listings (Top 50 - Paginated) --- */}
                {chunkArray(topMitigated, 18).map((chunk, pageIndex) => (
                    <ReportPageLayout key={`mitigated-${pageIndex}`} letterhead={letterhead}>
                        <div className="w-full">
                            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2 border-slate-200 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                Top 50 Activos Más Mitigados {pageIndex > 0 && <span className="text-sm font-normal text-slate-500">(Cont. {pageIndex + 1})</span>}
                            </h2>
                            {pageIndex === 0 && (
                                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                                    Los siguientes activos han experimentado la actividad de remediación más significativa durante este período.
                                    Altos recuentos de mitigación a menudo indican entornos volátiles o ciclos de mantenimiento activo.
                                </p>
                            )}

                            <SimpleTable
                                headers={['Ranking', 'Nombre del Activo', 'Mitigaciones']}
                                data={chunk.map((item, i) => [(pageIndex * 18) + i + 1, item.asset, item.count])}
                                colorClass="text-green-700 font-medium"
                            />
                        </div>
                    </ReportPageLayout>
                ))}


                {/* --- PAGE 4+: Vulnerable Assets (Top 50 - Paginated) --- */}
                {chunkArray(topVulnerable, 18).map((chunk, pageIndex) => (
                    <ReportPageLayout key={`vulnerable-${pageIndex}`} letterhead={letterhead}>
                        <div className="w-full">
                            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2 border-slate-200 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                Top 50 Activos Más Vulnerables {pageIndex > 0 && <span className="text-sm font-normal text-slate-500">(Cont. {pageIndex + 1})</span>}
                            </h2>
                            {pageIndex === 0 && (
                                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                                    Estos activos presentan el mayor número de vulnerabilidades activas y deben ser priorizados para análisis y remediación inmediata.
                                </p>
                            )}

                            <SimpleTable
                                headers={['Ranking', 'Nombre del Activo', 'Vulnerabilidades']}
                                data={chunk.map((item, i) => [(pageIndex * 18) + i + 1, item.asset, item.count])}
                                colorClass="text-red-700 font-medium"
                            />
                        </div>
                    </ReportPageLayout>
                ))}

            </div>

            {/* Style Override for Print */}
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0;
                        size: A4 portrait;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        background: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .print-page {
                        width: 210mm !important;
                        height: 297mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        page-break-after: always !important;
                        break-after: page !important;
                        position: relative !important;
                        overflow: hidden !important;
                    }
                }
            `}</style>
        </div>
    );
}

// --- Helper Components for Report ---

const ReportPageLayout = ({ children, letterhead }: { children: React.ReactNode, letterhead: string | null }) => (
    <div
        className="bg-white shadow-xl print:shadow-none w-[210mm] h-[297mm] relative mb-8 last:mb-0 print:mb-0 print-page overflow-hidden"
    >
        {/* Letterhead Background */}
        {letterhead && (
            <div className="absolute inset-0 z-0 pointer-events-none">
                <img
                    src={letterhead}
                    alt="Letterhead"
                    className="w-[210mm] h-[297mm] object-fill opacity-100 block"
                />
            </div>
        )}

        {/* Content Area with Margins adjusted for Letterhead */}
        {/* Top Padding: ~40mm, Bottom Padding: ~30mm, Side: 20mm */}
        <div className="relative z-10 pt-[40mm] pb-[30mm] px-[20mm] h-full flex flex-col">
            {children}
        </div>
    </div>
);

const SimpleTable = ({ headers, data, colorClass }: { headers: string[], data: any[][], colorClass?: string }) => (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                <tr>
                    {headers.map((h, i) => <th key={i} className="px-4 py-3">{h}</th>)}
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {data.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/50">
                        {row.map((cell, cIdx) => (
                            <td key={cIdx} className={`px-4 py-2 text-slate-600 ${cIdx === row.length - 1 ? `text-right font-mono ${colorClass}` : ''} ${cIdx === 0 ? 'text-slate-400 w-12 text-center' : ''}`}>
                                {cell}
                            </td>
                        ))}
                    </tr>
                ))}
                {data.length === 0 && (
                    <tr><td colSpan={headers.length} className="px-4 py-8 text-center text-slate-400">No hay datos disponibles</td></tr>
                )}
            </tbody>
        </table>
    </div>
);



function chunkArray<T>(array: T[], size: number): T[][] {
    const chunked_arr = [];
    let index = 0;
    while (index < array.length) {
        chunked_arr.push(array.slice(index, size + index));
        index += size;
    }
    return chunked_arr;
}
