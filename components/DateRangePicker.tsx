'use client';

import React from 'react';
import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
    startDate: Date;
    endDate: Date;
    onChange: (start: Date, end: Date) => void;
}

export const DateRangePicker = ({ startDate, endDate, onChange }: DateRangePickerProps) => {

    const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStart = new Date(e.target.value);
        if (!isNaN(newStart.getTime())) {
            onChange(newStart, endDate);
        }
    };

    const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEnd = new Date(e.target.value);
        if (!isNaN(newEnd.getTime())) {
            // Ensure end date is set to end of day if needed, or just day
            onChange(startDate, newEnd);
        }
    };

    // Format for input value: YYYY-MM-DD
    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    return (
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-500 ml-2" />
            <div className="flex items-center gap-2">
                <input
                    type="date"
                    value={formatDate(startDate)}
                    onChange={handleStartChange}
                    className="text-sm border-none focus:ring-0 text-slate-700 font-medium bg-transparent outline-none cursor-pointer"
                />
                <span className="text-slate-400 text-xs">hasta</span>
                <input
                    type="date"
                    value={formatDate(endDate)}
                    onChange={handleEndChange}
                    min={formatDate(startDate)}
                    className="text-sm border-none focus:ring-0 text-slate-700 font-medium bg-transparent outline-none cursor-pointer"
                />
            </div>
        </div>
    );
};
