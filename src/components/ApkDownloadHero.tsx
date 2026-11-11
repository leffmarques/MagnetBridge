import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  ShieldCheck,
  Cpu,
  FileCode2,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  Layers,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { downloadApkFile } from '../utils/apkDownloader';

interface ApkDownloadHeroProps {
  language: 'pt' | 'en';
  onOpenRecompiler: () => void;
  apkSize: string;
  sha256Hash: string;
}

export const ApkDownloadHero: React.FC<ApkDownloadHeroProps> = ({
  language,
  onOpenRecompiler,
  apkSize,
  sha256Hash,
}) => {
  const isPt = language === 'pt';
  const [copiedHash, setCopiedHash] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(sha256Hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDownloadClick = async () => {
    setIsDownloading(true);
    setDownloadStatus(isPt ? 'Gerando arquivo binário .APK...' : 'Generating binary .APK...');
    const res = await downloadApkFile((status) => setDownloadStatus(status));
    setTimeout(() => {
      setIsDownloading(false);
      setDownloadStatus(null);
    }, 2500);
  };

  return (
    <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-6 md:p-10 shadow-2xl overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Col: Main App Info & Direct Download */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono">APK v0.8.0 COM GERADOR DE .TORRENT</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Magnet Bridge{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-400">
                para Stremio
              </span>
            </h1>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed">
              {isPt
                ? 'Aplicativo Android para converter o stream de reprodução externa do Stremio em magnet links BitTorrent diretos para o seu player ou cliente de torrent favorito.'
                : 'Lightweight Android handoff app that converts Stremio external player streaming URLs into direct BitTorrent magnet links.'}
            </p>
          </div>

          {/* Quick Features Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{isPt ? 'Filtro automático de Player Externo' : 'Native External Player Intent Filter'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{isPt ? 'Extração pura do InfoHash (v1 SHA1)' : 'Direct InfoHash Extraction (v1 SHA1)'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{isPt ? 'Compatível com Android 5.0 até 15' : 'Supports Android 5.0 up to Android 15'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{isPt ? 'Zero anúncios · Código aberto limpo' : 'Zero telemetry · 100% clean open source'}</span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={handleDownloadClick}
                disabled={isDownloading}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 text-white font-bold rounded-2xl text-base shadow-xl shadow-purple-600/30 hover:shadow-purple-600/40 hover:-translate-y-0.5 transition-all text-center cursor-pointer disabled:opacity-70"
              >
                {isDownloading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                <span>
                  {isDownloading
                    ? downloadStatus || (isPt ? 'Baixando...' : 'Downloading...')
                    : isPt
                    ? 'Baixar MagnetBridge.apk'
                    : 'Download MagnetBridge.apk'}
                </span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-mono">{apkSize}</span>
              </button>

              <a
                href="/MagnetBridge-source.zip"
                download="MagnetBridge-source.zip"
                className="flex items-center justify-center gap-2 px-5 py-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold rounded-2xl text-sm transition text-center hover:border-slate-600"
              >
                <FileCode2 className="w-4 h-4 text-purple-400" />
                <span>{isPt ? 'Código Fonte (.ZIP)' : 'Source Code (.ZIP)'}</span>
              </a>
            </div>

            {/* Alternative Direct Download link fallback */}
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-slate-400 px-1">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                {isPt
                  ? 'Gera arquivo binário real .apk sem extensão .html'
                  : 'Forces binary .apk MIME without .html'}
              </span>
              <a
                href="/api/download-apk"
                className="text-purple-400 hover:text-purple-300 underline font-mono text-[11px]"
              >
                {isPt ? 'Link Direto Alternativo (HTTP Stream)' : 'Direct HTTP Stream Link'}
              </a>
            </div>
          </div>

          {/* SHA-256 Checksum Card */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-400 truncate">
              <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="font-semibold text-slate-300">SHA-256:</span>
              <span className="font-mono text-slate-400 truncate text-[11px]">{sha256Hash}</span>
            </div>
            <button
              onClick={handleCopyHash}
              className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 text-xs font-medium px-2 py-1 rounded bg-purple-950/40 hover:bg-purple-900/40 transition shrink-0 cursor-pointer"
            >
              {copiedHash ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{isPt ? 'Copiado!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isPt ? 'Copiar Hash' : 'Copy Hash'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Col: APK Technical Card & Recompiler trigger */}
        <div className="lg:col-span-5">
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative backdrop-blur-md space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">MagnetBridge.apk</h3>
                  <p className="text-xs text-slate-400 font-mono">com.stremiomagnetbridge.app</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                v0.8.0 (Build 8)
              </span>
            </div>

            {/* Spec grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-0.5">{isPt ? 'Tamanho do APK' : 'APK File Size'}</span>
                <span className="font-bold text-slate-100 font-mono text-sm">{apkSize}</span>
              </div>
              <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-0.5">{isPt ? 'Versão Mínima' : 'Min Android SDK'}</span>
                <span className="font-bold text-slate-100 font-mono text-sm">Android 5.0 (API 21)</span>
              </div>
              <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-0.5">{isPt ? 'Versão Alvo' : 'Target Android SDK'}</span>
                <span className="font-bold text-slate-100 font-mono text-sm">Android 14 (API 34)</span>
              </div>
              <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-0.5">{isPt ? 'Assinatura APK' : 'APK Signatures'}</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">v1 + v2 + v3 Válidas</span>
              </div>
            </div>

            {/* Intent filters badge */}
            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>{isPt ? 'Filtros de Intent Ativos no Android' : 'Active Android Intent Filters'}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1 font-mono text-[11px]">
                <span className="px-2 py-0.5 bg-slate-800 text-purple-300 rounded">ACTION_VIEW</span>
                <span className="px-2 py-0.5 bg-slate-800 text-blue-300 rounded">video/*</span>
                <span className="px-2 py-0.5 bg-slate-800 text-emerald-300 rounded">octet-stream</span>
                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded">ACTION_SEND</span>
              </div>
            </div>

            {/* Recompile CTA */}
            <button
              onClick={onOpenRecompiler}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-purple-500/50 text-slate-200 font-medium rounded-xl text-xs transition group cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-180 transition-transform duration-500" />
              <span>{isPt ? 'Recompilar APK no Servidor (Build Terminal)' : 'Recompile APK on Server (Live Terminal)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
