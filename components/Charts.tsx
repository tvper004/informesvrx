'use client';

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

// --- Monthly Trends Chart ---
interface MonthlyTrendsProps {
    data: { date: string; detected: number; mitigated: number }[];
    onClick?: (data: any) => void;
    height?: number;
}

export const MonthlyTrendsChart = ({ data, onClick, height = 300 }: MonthlyTrendsProps) => {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                onClick={(state: any) => {
                    if (onClick && state && state.activePayload && state.activePayload.length > 0) {
                        onClick(state.activePayload[0].payload);
                    }
                }}
                className="cursor-pointer"
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px' }}
                    cursor={{ fill: 'rgba(226, 232, 240, 0.5)' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="detected" name="Detectadas" fill="#facc15" radius={[4, 4, 0, 0]} />
                <Bar dataKey="mitigated" name="Mitigadas" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

// --- Distribution Charts (OS / Status) ---
interface DistributionChartProps {
    data: { name: string; value: number }[];
    colors?: string[];
    onClick?: (data: any) => void;
    hideLegend?: boolean;
    height?: number;
}

const DEFAULT_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];

export const DistributionChart = ({ data, colors = DEFAULT_COLORS, onClick, hideLegend = true, height = 300 }: DistributionChartProps) => {
    const total = React.useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data]);

    return (
        <div className="relative w-full" style={{ height: `${height}px` }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={height * 0.23}
                        outerRadius={height * 0.3}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        onClick={(data) => onClick && onClick(data)}
                        className="cursor-pointer focus:outline-none"
                        nameKey="name"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    {!hideLegend && <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />}
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ height: `${height}px` }}>
                <span className="font-bold text-slate-800 tabular-nums" style={{ fontSize: `${height * 0.1}px` }}>{total.toLocaleString()}</span>
                <span className="text-slate-500 font-medium uppercase tracking-wider" style={{ fontSize: `${height * 0.04}px` }}>Total</span>
            </div>
        </div>
    );
};

export const DistributionLegend = ({ data, colors = DEFAULT_COLORS, columns = 2 }: { data: { name: string; value: number }[], colors?: string[], columns?: number }) => {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-x-6 gap-y-2 mt-4`}>
            {data.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between text-xs text-slate-600 group hover:bg-slate-50 p-1 rounded transition-colors">
                    <div className="flex items-center gap-2 truncate">
                        <span className="w-2.5 h-2.5 rounded-full block flex-shrink-0" style={{ backgroundColor: colors[index % colors.length] }}></span>
                        <span className="truncate" title={entry.name}>{entry.name}</span>
                    </div>
                    <span className="font-bold text-slate-800 tabular-nums">({entry.value.toLocaleString()})</span>
                </div>
            ))}
        </div>
    );
};

// --- Top 50 List Table ---
interface TopListProps {
    data: { asset: string; count: number }[];
    title: string;
    icon?: React.ReactNode;
    colorClass?: string;
    onRowClick?: (assetName: string) => void;
}

export const TopListTable = ({ data, title, icon, colorClass = "bg-gray-50 text-gray-600", onRowClick }: TopListProps) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-96 transition-all hover:shadow-md">
            <div className={`p-4 border-b border-slate-100 flex items-center gap-2 font-semibold ${colorClass}`}>
                {icon}
                {title}
            </div>
            <div className="overflow-y-auto flex-1 p-0 scrollbar-thin scrollbar-thumb-slate-200">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 shadow-sm z-10">
                        <tr>
                            <th className="px-4 py-2 bg-slate-50">Ranking</th>
                            <th className="px-4 py-2 bg-slate-50">Nombre del Activo</th>
                            <th className="px-4 py-2 text-right bg-slate-50">Cantidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr
                                key={index}
                                className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group"
                                onClick={() => onRowClick && onRowClick(item.asset)}
                            >
                                <td className="px-4 py-2 text-slate-400 w-12 text-center">{index + 1}</td>
                                <td className="px-4 py-2 font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">{item.asset}</td>
                                <td className="px-4 py-2 text-right text-slate-600 font-mono">{item.count}</td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                                    No hay datos para el periodo seleccionado
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
