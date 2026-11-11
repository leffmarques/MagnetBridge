import React from 'react';
import { Magnet, Download, Globe, Terminal, HelpCircle, Code2 } from 'lucide-react';
import { downloadApkFile } from '../utils/apkDownloader';

interface NavbarProps {
  language: 'pt' | 'en';
  onToggleLanguage: () => void;
  activeTab: 'converter' | 'tutorial' | 'source';
  onSelectTab: (tab: 'converter' | 'tutorial' | 'source') => void;
  onOpenRecompiler: () => void;
  apkSize: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onToggleLanguage,
  activeTab,
  onSelectTab,
  onOpenRecompiler,
  apkSize,
}) => {
  const isPt = language === 'pt';

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-400 p-0.5 shadow-lg shadow-purple-600/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Magnet className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-lg tracking-tight">MagnetBridge</span>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                v0.8.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {isPt ? 'Stremio Stream para Magnet & APK Hub' : 'Stremio Stream to Magnet & APK Hub'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => onSelectTab('converter')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'converter'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            {isPt ? 'Conversor de Stream' : 'Stream Converter'}
          </button>
          <button
            onClick={() => onSelectTab('tutorial')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'tutorial'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            {isPt ? 'Como Usar no Stremio' : 'Stremio Guide'}
          </button>
          <button
            onClick={() => onSelectTab('source')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'source'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            {isPt ? 'Código-Fonte' : 'Source Code'}
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Recompile Button */}
          <button
            onClick={onOpenRecompiler}
            title={isPt ? 'Abrir Terminal de Compilação' : 'Open Build Terminal'}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
          >
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span>{isPt ? 'Terminal APK' : 'Build APK'}</span>
          </button>

          {/* Direct Download Button */}
          <button
            onClick={() => downloadApkFile()}
            className="flex items-center gap-2 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/25 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isPt ? 'Baixar APK' : 'Download APK'}</span>
            <span className="hidden lg:inline text-[10px] bg-purple-800/60 px-1.5 py-0.5 rounded font-mono">{apkSize}</span>
          </button>

          {/* Language Switch */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
            title="Alternar idioma / Toggle language"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{isPt ? 'EN' : 'PT'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden border-t border-slate-800/80 px-3 py-2 bg-slate-950/95 gap-1.5 overflow-x-auto">
        <button
          onClick={() => onSelectTab('converter')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-center whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'converter'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
          }`}
        >
          {isPt ? 'Conversor' : 'Converter'}
        </button>
        <button
          onClick={() => onSelectTab('tutorial')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-center whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'tutorial'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
          }`}
        >
          {isPt ? 'Guia Stremio' : 'Guide'}
        </button>
        <button
          onClick={() => onSelectTab('source')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-center whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'source'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
          }`}
        >
          {isPt ? 'Código' : 'Source'}
        </button>
      </div>
    </header>
  );
};
