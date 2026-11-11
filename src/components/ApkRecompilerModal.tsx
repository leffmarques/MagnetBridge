import React, { useState } from 'react';
import {
  RefreshCw,
  Terminal,
  CheckCircle,
  AlertCircle,
  Download,
  X,
  Play,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { downloadApkFile } from '../utils/apkDownloader';

interface ApkRecompilerModalProps {
  language: 'pt' | 'en';
  isOpen: boolean;
  onClose: () => void;
  onBuildSuccess: () => void;
}

export const ApkRecompilerModal: React.FC<ApkRecompilerModalProps> = ({
  language,
  isOpen,
  onClose,
  onBuildSuccess,
}) => {
  const isPt = language === 'pt';
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const [logs, setLogs] = useState<string>('');
  const [buildResult, setBuildResult] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartBuild = async () => {
    setIsBuilding(true);
    setBuildResult('idle');
    setErrorMessage(null);
    setLogs('Iniciando pipeline de compilação nativo do Android no servidor...\nExecutando scripts/build_apk.sh...\n\n');

    try {
      const response = await fetch('/api/build-apk', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        setLogs((prev) => prev + data.log + '\n\n✔ Compilação concluída com sucesso! APK pronto para instalação.');
        setBuildResult('success');
        onBuildSuccess();
      } else {
        setLogs((prev) => prev + (data.log || '') + '\n\n❌ Erro durante a compilação: ' + data.error);
        setBuildResult('error');
        setErrorMessage(data.error);
      }
    } catch (err: any) {
      setBuildResult('error');
      setErrorMessage(err.message || 'Falha de comunicação com o servidor');
      setLogs((prev) => prev + '\n❌ Falha na requisição: ' + (err.message || 'Erro de rede'));
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {isPt ? 'Terminal de Compilação do APK' : 'APK Build Pipeline Terminal'}
              </h3>
              <p className="text-xs text-slate-400">
                {isPt
                  ? 'Compilação nativa em Linux usando AAPT, Javac, Dalvik DEX, Zipalign e Apksigner'
                  : 'Native Linux toolchain using AAPT, Javac, Dalvik DEX, Zipalign, and Apksigner'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Pipeline Steps summary */}
        <div className="p-5 bg-slate-900/60 border-b border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-[11px] font-mono">
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">1. AAPT</span>
              <span className="text-purple-300 font-semibold">Res & R.java</span>
            </div>
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">2. Javac</span>
              <span className="text-blue-300 font-semibold">Bytecode 8</span>
            </div>
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">3. DX</span>
              <span className="text-amber-300 font-semibold">classes.dex</span>
            </div>
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">4. Package</span>
              <span className="text-cyan-300 font-semibold">unaligned.apk</span>
            </div>
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">5. Zipalign</span>
              <span className="text-emerald-300 font-semibold">4-byte align</span>
            </div>
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">6. Apksigner</span>
              <span className="text-emerald-400 font-semibold">v1+v2+v3</span>
            </div>
          </div>
        </div>

        {/* Terminal Output */}
        <div className="flex-1 p-4 bg-slate-950 overflow-y-auto font-mono text-xs text-slate-300 min-h-[260px] max-h-[380px] space-y-1">
          <div className="text-slate-500 pb-2 flex items-center gap-1.5 border-b border-slate-800/80">
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span>bash /app/applet/scripts/build_apk.sh</span>
          </div>
          {logs ? (
            <pre className="whitespace-pre-wrap leading-relaxed selection:bg-purple-500 selection:text-white">
              {logs}
            </pre>
          ) : (
            <div className="text-slate-500 italic py-10 text-center">
              {isPt
                ? 'Clique no botão "Iniciar Compilação" para disparar o processo no servidor.'
                : 'Click "Start Compilation" to execute the build script on the server.'}
            </div>
          )}
        </div>

        {/* Footer / Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            {buildResult === 'success' && (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle className="w-4 h-4" />
                {isPt ? 'APK Compilado e Assinado com Sucesso!' : 'APK Successfully Compiled & Signed!'}
              </span>
            )}
            {buildResult === 'error' && (
              <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                <AlertCircle className="w-4 h-4" />
                {isPt ? 'Falha na compilação' : 'Build failed'}
              </span>
            )}
            {isBuilding && (
              <span className="flex items-center gap-2 text-purple-400 font-semibold">
                <RefreshCw className="w-4 h-4 animate-spin" />
                {isPt ? 'Compilando arquivos Android...' : 'Building Android packages...'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleStartBuild}
              disabled={isBuilding}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/30 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBuilding ? 'animate-spin' : ''}`} />
              <span>
                {isBuilding
                  ? isPt
                    ? 'Compilando...'
                    : 'Compiling...'
                  : isPt
                  ? 'Compilar APK Agora'
                  : 'Start Compilation'}
              </span>
            </button>

            {buildResult === 'success' && (
              <button
                onClick={() => downloadApkFile()}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/30 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isPt ? 'Baixar Novo APK' : 'Download New APK'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
            >
              {isPt ? 'Fechar' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
