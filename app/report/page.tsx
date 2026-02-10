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
import { MonthlyTrendsChart, DistributionChart } from '@/components/Charts';
import { Printer, Upload, ArrowLeft, Trash2, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';
import { DateRangePicker } from '@/components/DateRangePicker';

export default function ReportPage() {
    const { data, letterhead, setLetterhead, dateRange, setDateRange } = useDashboard();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Analytics Calculation (Scoped to Report Range)
    const kpis = useMemo(() => calculateKPIs(data, dateRange), [data, dateRange]);
    const monthlyTrends = useMemo(() => getMonthlyTrends(data, dateRange), [data, dateRange]);
    const osDistribution = useMemo(() => getOSDistribution(data), [data]);
    const assetStatus = useMemo(() => getAssetStatus(data), [data]);
    const topMitigated = useMemo(() => getTop50Mitigated(data, dateRange), [data, dateRange]);
    const topVulnerable = useMemo(() => getTop50Vulnerable(data), [data]);
    const severityData = useMemo(() => getSeverityDistribution(data), [data]);

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
                    <div className="text-center mb-12 mt-4">
                        <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Informe Automatizado de Seguridad</h1>
                        <p className="text-slate-500 text-lg uppercase tracking-wide font-medium">Vicarius - Análisis y Gestión de Vulnerabilidades</p>
                        <div className="flex items-center justify-center gap-2 mt-4 text-slate-400 bg-slate-50 inline-flex px-4 py-1.5 rounded-full text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(dateRange.start)} - {formatDate(dateRange.end)}</span>
                        </div>
                    </div>

                    <div className="bg-slate-50 border-l-4 border-indigo-500 p-6 mb-10 rounded-r-lg">
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Resumen Ejecutivo</h2>
                        <p className="text-slate-600 leading-relaxed text-justify">
                            Este informe proporciona un análisis exhaustivo de la postura de ciberseguridad de la organización para el período seleccionado.
                            Actualmente estamos monitoreando un total de <strong className="text-slate-900">{kpis.totalAssets} activos</strong>.
                            Durante este período, nuestros esfuerzos de remediación han abordado con éxito <strong className="text-green-600">{kpis.mitigatedVulns} vulnerabilidades</strong>.

                            El análisis actual muestra un Puntaje de Riesgo Promedio de <strong className="text-slate-900">{kpis.avgRiskScore}</strong> en todo el entorno.
                            Las estrategias de remediación activa han mantenido un Tiempo Medio de Remediación (MTTR) promedio de <strong className="text-indigo-600">{kpis.avgMTTR} días</strong>.
                            Es crucial priorizar las {kpis.criticalVulns} vulnerabilidades Críticas/Altas identificadas en el backlog activo para reducir aún más la superficie de ataque.
                        </p>
                    </div>

                    <div className="mb-8 break-inside-avoid">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 border-slate-200">Análisis de Tendencias de Vulnerabilidad</h3>
                        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                            El siguiente gráfico ilustra el volumen mensual de vulnerabilidades detectadas frente a las mitigaciones ejecutadas.
                            Una actividad de mitigación consistente en relación con las tasas de detección indica un proceso de gestión de vulnerabilidades saludable.
                        </p>
                        <div className="bg-white p-4 border border-slate-100 rounded-lg">
                            <MonthlyTrendsChart data={monthlyTrends} />
                        </div>
                    </div>

                </ReportPageLayout>

                {/* --- PAGE 2: Distribution Charts (Stacked) --- */}
                <ReportPageLayout letterhead={letterhead}>
                    <div className="flex flex-col gap-12 h-full justify-center">
                        <div className="break-inside-avoid">
                            <h3 className="text-xl font-bold text-slate-800 mb-3 border-b pb-2 border-slate-200">Distribución por Severidad</h3>
                            <p className="text-sm text-slate-500 mb-6">
                                Desglose de las vulnerabilidades activas actuales por nivel de severidad. Se debe poner énfasis en estandarizar los problemas de severidad Crítica y Alta.
                            </p>
                            <div className="h-64 w-full">
                                <DistributionChart data={severityData} colors={SEVERITY_COLORS} />
                            </div>
                            <div className="flex flex-wrap justify-center gap-4 mt-4">
                                {severityData.map((d, i) => (
                                    <div key={i} className="text-sm flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[i] }}></span>
                                        <span className="font-bold text-slate-700">{d.value}</span> <span className="text-slate-600">{d.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="break-inside-avoid">
                            <h3 className="text-xl font-bold text-slate-800 mb-3 border-b pb-2 border-slate-200">Sistemas Operativos</h3>
                            <p className="text-sm text-slate-500 mb-6">
                                Distribución de sistemas operativos a través de la flota monitoreada. La diversidad en SO impacta las estrategias de gestión de parches.
                            </p>
                            <div className="h-64 w-full">
                                <DistributionChart data={osDistribution} colors={OS_COLORS} />
                            </div>
                            <div className="flex flex-wrap justify-center gap-4 mt-4">
                                {osDistribution.slice(0, 8).map((d, i) => (
                                    <div key={i} className="text-sm flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: OS_COLORS[i] }}></span>
                                        <span className="font-bold text-slate-700">{d.value}</span> <span className="text-slate-600">{d.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ReportPageLayout>

                {/* --- PAGE 3+: Detailed Listings (Top 50 - Paginated) --- */}
                {chunkArray(topMitigated, 14).map((chunk, pageIndex) => (
                    <ReportPageLayout key={`mitigated-${pageIndex}`} letterhead={letterhead}>
                        <div className="mb-10">
                            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2 border-slate-200 flex items-center gap-2">
                                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                Top 50 Activos Más Mitigados {pageIndex > 0 && <span className="text-sm font-normal text-slate-500">(Cont. {pageIndex + 1})</span>}
                            </h2>
                            {pageIndex === 0 && (
                                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                                    Los siguientes activos han experimentado la actividad de remediación más significativa durante este período.
                                    Altos recuentos de mitigación a menudo indican entornos volátiles o ciclos de mantenimiento activo.
                                    Estos endpoints representan el foco principal de las operaciones de seguridad recientes.
                                </p>
                            )}

                            <SimpleTable
                                headers={['Ranking', 'Nombre del Activo', 'Cantidad de Mitigaciones']}
                                data={chunk.map((item, i) => [(pageIndex * 14) + i + 1, item.asset, item.count])}
                                colorClass="text-green-700 font-medium"
                            />
                        </div>
                    </ReportPageLayout>
                ))}


                {/* --- PAGE 4+: Vulnerable Assets (Top 50 - Paginated) --- */}
                {chunkArray(topVulnerable, 14).map((chunk, pageIndex) => (
                    <ReportPageLayout key={`vulnerable-${pageIndex}`} letterhead={letterhead}>
                        <div className="mb-10">
                            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2 border-slate-200 flex items-center gap-2">
                                <AlertIcon className="w-5 h-5 text-red-600" />
                                Top 50 Activos Más Vulnerables {pageIndex > 0 && <span className="text-sm font-normal text-slate-500">(Cont. {pageIndex + 1})</span>}
                            </h2>
                            {pageIndex === 0 && (
                                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                                    Estos activos actualmente presentan el mayor número de vulnerabilidades activas.
                                    Representan el mayor riesgo para la postura de seguridad de la organización y deben ser priorizados para análisis y remediación inmediata.
                                    Los factores que contribuyen a altos recuentos pueden incluir software heredado, problemas de conectividad o implementaciones de parches fallidas.
                                </p>
                            )}

                            <SimpleTable
                                headers={['Ranking', 'Nombre del Activo', 'Cantidad de Vulnerabilidades']}
                                data={chunk.map((item, i) => [(pageIndex * 14) + i + 1, item.asset, item.count])}
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
                        size: A4;
                    }
                    body {
                        background: white;
                        -webkit-print-color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    );
}

// --- Helper Components for Report ---

const ReportPageLayout = ({ children, letterhead }: { children: React.ReactNode, letterhead: string | null }) => (
    <div
        className="bg-white shadow-xl print:shadow-none w-[210mm] h-[297mm] relative mb-8 last:mb-0 print:mb-0 print:break-after-page overflow-hidden"
    >
        {/* Letterhead Background */}
        {letterhead && (
            <div className="absolute inset-0 z-0 pointer-events-none print:fixed print:inset-0">
                <img
                    src={letterhead}
                    alt="Letterhead"
                    className="w-[210mm] h-[297mm] object-fill opacity-100"
                />
            </div>
        )}

        {/* Content Area with Margins adjusted for Letterhead */}
        {/* Top Padding: ~40mm, Bottom Padding: ~30mm, Side: 20mm */}
        <div className="relative z-10 pt-[40mm] pb-[30mm] px-[20mm] h-full flex flex-col">
            {children}

            {/* Footer Text if needed (not overlapping letterhead footer) */}
            <div className="mt-auto text-center text-[10px] text-slate-300 pt-4">
                Generado por el Agente de Reportes Vicarius
            </div>
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

const CheckCircleIcon = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
);

const AlertIcon = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
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
