'use client';

import { useDashboard } from '@/lib/context';
import { FileUpload } from '@/components/FileUpload';
import { ExecutiveSummary } from '@/components/ExecutiveSummary';
import { ShieldCheck, LogOut, FileText, Activity } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { data, resetData, loadDemoData } = useDashboard();
  const hasData = data.endpoints.length > 0 || data.vulnerabilities.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              Informe Automatizado de Vicarius
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {hasData && (
              <>
                <Link
                  href="/report"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Generar Informe PDF
                </Link>
                <button
                  onClick={resetData}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Reiniciar
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
            <div className="text-center space-y-3 max-w-lg mb-12">
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                Cargue sus Reportes de Vicarius
              </h2>
              <p className="text-slate-500 text-xl leading-relaxed">
                Descubra el potencial de sus datos de seguridad con nuestro análisis inteligente.
              </p>
            </div>

            <div className="w-full max-w-xl space-y-8">
              <button
                onClick={loadDemoData}
                className="w-full flex items-center justify-center gap-3 px-8 py-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl font-bold text-xl shadow-xl hover:shadow-indigo-200/50 transition-all active:scale-[0.98] group cursor-pointer"
              >
                <Activity className="w-7 h-7 group-hover:scale-110 transition-transform" />
                VER DEMO INTERACTIVA
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 px-4"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-50 text-slate-400 font-semibold uppercase tracking-widest whitespace-nowrap">
                    O suba sus propios archivos CSV
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <FileUpload />
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            <ExecutiveSummary />
          </div>
        )}
      </main>

    </div>
  );
}
