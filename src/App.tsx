import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ApkDownloadHero } from './components/ApkDownloadHero';
import { StreamConverter } from './components/StreamConverter';
import { StremioTutorial } from './components/StremioTutorial';
import { SourceCodeViewer } from './components/SourceCodeViewer';
import { ApkRecompilerModal } from './components/ApkRecompilerModal';
import { Magnet, Terminal, Download, FileCode2, BookOpen, Smartphone } from 'lucide-react';
import { downloadApkFile } from './utils/apkDownloader';

interface ApkInfo {
  exists: boolean;
  sizeFormatted: string;
  sha256: string;
  version: string;
  modifiedAt?: string;
}

export default function App() {
  const [language, setLanguage] = useState<'pt' | 'en'>('pt');
  const [activeTab, setActiveTab] = useState<'converter' | 'tutorial' | 'source'>('converter');
  const [isRecompilerOpen, setIsRecompilerOpen] = useState<boolean>(false);
  const [apkInfo, setApkInfo] = useState<ApkInfo>({
    exists: true,
    sizeFormatted: '550.2 KB',
    sha256: '0427831e5ebea18a9979b4e55508bc64b7913599807d76b0563d289024123b5f',
    version: '0.8.0',
  });

  const isPt = language === 'pt';

  const fetchApkInfo = async () => {
    try {
      const res = await fetch('/api/apk-info');
      const data = await res.json();
      if (data.exists) {
        setApkInfo({
          exists: true,
          sizeFormatted: data.sizeFormatted,
          sha256: data.sha256,
          version: data.version || '0.8.0',
          modifiedAt: data.modifiedAt,
        });
      }
    } catch {
      // Fallback already preset in initial state
    }
  };

  useEffect(() => {
    fetchApkInfo();
  }, []);

  const handleSelectTab = (tab: 'converter' | 'tutorial' | 'source') => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-purple-600 selection:text-white">
      {/* Top Navbar with Single Authoritative Tab Navigation */}
      <Navbar
        language={language}
        onToggleLanguage={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenRecompiler={() => setIsRecompilerOpen(true)}
        apkSize={apkInfo.sizeFormatted}
      />

      {/* Main Content Area: Content changes directly from the top */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: CONVERTER & APK HUB */}
        {activeTab === 'converter' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <ApkDownloadHero
              language={language}
              onOpenRecompiler={() => setIsRecompilerOpen(true)}
              apkSize={apkInfo.sizeFormatted}
              sha256Hash={apkInfo.sha256}
            />

            <StreamConverter language={language} />
          </div>
        )}

        {/* TAB 2: STREMIO TUTORIAL & SETUP GUIDE */}
        {activeTab === 'tutorial' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Dedicated Header for Tutorial */}
            <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{isPt ? 'Manual de Integração' : 'Integration Manual'}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {isPt ? 'Como Usar o Magnet Bridge no Stremio' : 'How to Use Magnet Bridge with Stremio'}
                </h1>
                <p className="text-sm text-slate-300">
                  {isPt
                    ? 'Guia detalhado de configuração no Android, TV Box e Firestick para transferir fluxos de vídeo para o seu cliente de torrent favorito.'
                    : 'Detailed setup instructions for Android, Android TV, and Fire TV to redirect streaming intents into your torrent app.'}
                </p>
              </div>

              {/* Quick download button right in tutorial header */}
              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <button
                  onClick={() => downloadApkFile()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-purple-600/30 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{isPt ? 'Baixar APK v0.8.0' : 'Download APK v0.8.0'}</span>
                  <span className="font-mono bg-purple-800/80 px-1.5 py-0.5 rounded text-[10px]">
                    {apkInfo.sizeFormatted}
                  </span>
                </button>
              </div>
            </div>

            <StremioTutorial language={language} />
          </div>
        )}

        {/* TAB 3: SOURCE CODE & BUILD PIPELINE */}
        {activeTab === 'source' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Dedicated Header for Source Code */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/30 border border-slate-800 rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>{isPt ? 'Código Aberto & Toolchain' : 'Open Source & Toolchain'}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {isPt ? 'Arquivos de Código-Fonte do APK' : 'APK Source Code & Architecture'}
                </h1>
                <p className="text-sm text-slate-300">
                  {isPt
                    ? 'Inspecione a implementação em Java puro de MainActivity, BencodeEncoder, TorrentMetadata e o script de compilação Linux.'
                    : 'Inspect the pure Java implementation of MainActivity, BencodeEncoder, TorrentMetadata, and Linux compilation scripts.'}
                </p>
              </div>

              {/* Action buttons in Source Code Header */}
              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <a
                  href="/MagnetBridge-source.zip"
                  download="MagnetBridge-source.zip"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition text-center"
                >
                  <FileCode2 className="w-4 h-4 text-purple-400" />
                  <span>{isPt ? 'Download Código (.ZIP)' : 'Download Source (.ZIP)'}</span>
                </a>

                <button
                  onClick={() => setIsRecompilerOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-purple-600/25 transition cursor-pointer"
                >
                  <Terminal className="w-4 h-4" />
                  <span>{isPt ? 'Abrir Terminal de Compilação' : 'Open Build Terminal'}</span>
                </button>
              </div>
            </div>

            <SourceCodeViewer language={language} />
          </div>
        )}
      </main>

      {/* APK Recompiler Modal */}
      <ApkRecompilerModal
        language={language}
        isOpen={isRecompilerOpen}
        onClose={() => setIsRecompilerOpen(false)}
        onBuildSuccess={() => fetchApkInfo()}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800/80 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Magnet className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-slate-400">MagnetBridge v0.8.0</span>
            <span>·</span>
            <span>{isPt ? 'Conversão de stream do Stremio para magnet link & arquivo .torrent' : 'Stremio stream to magnet link & .torrent file'}</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsRecompilerOpen(true)}
              className="hover:text-purple-400 transition cursor-pointer"
            >
              {isPt ? 'Recompilar APK' : 'Recompile APK'}
            </button>
            <span>·</span>
            <button
              onClick={() => downloadApkFile()}
              className="hover:text-purple-400 transition cursor-pointer"
            >
              {isPt ? 'Baixar APK Direto' : 'Direct APK Download'}
            </button>
            <span>·</span>
            <a
              href="/MagnetBridge-source.zip"
              download="MagnetBridge-source.zip"
              className="hover:text-purple-400 transition"
            >
              {isPt ? 'Download Código (.ZIP)' : 'Download Source (.ZIP)'}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
