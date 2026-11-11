import React, { useState } from 'react';
import { ANDROID_FILES, SourceFile } from '../data/sourceCode';
import { FileCode, Copy, Check, Download, Layers, Terminal } from 'lucide-react';

interface SourceCodeViewerProps {
  language: 'pt' | 'en';
}

export const SourceCodeViewer: React.FC<SourceCodeViewerProps> = ({ language }) => {
  const isPt = language === 'pt';
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const currentFile: SourceFile = ANDROID_FILES[activeFileIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([currentFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header & Tabs */}
      <div className="bg-slate-950 border-b border-slate-800 p-4 lg:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400 mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>{isPt ? 'Código-Fonte Oficial' : 'Official Source Code'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isPt ? 'Explorador dos Arquivos do Projeto Android' : 'Android Project Source Code Explorer'}
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            {isPt
              ? 'Todos os arquivos usados para compilar o MagnetBridge.apk.'
              : 'Directly inspect the source files used to compile MagnetBridge.apk.'}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">{isPt ? 'Copiado!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>{isPt ? 'Copiar Código' : 'Copy Code'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadFile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-medium border border-purple-500/30 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isPt ? 'Baixar Arquivo' : 'Download File'}</span>
          </button>
        </div>
      </div>

      {/* File Selector Tabs */}
      <div className="flex items-center overflow-x-auto bg-slate-950/80 px-4 pt-2 border-b border-slate-800 gap-1 scrollbar-none">
        {ANDROID_FILES.map((file, idx) => (
          <button
            key={idx}
            onClick={() => setActiveFileIndex(idx)}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-mono rounded-t-lg transition-colors whitespace-nowrap border-t border-x ${
              activeFileIndex === idx
                ? 'bg-slate-900 border-slate-700 text-purple-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-purple-400" />
            <span>{file.name}</span>
          </button>
        ))}
      </div>

      {/* File Description */}
      <div className="bg-slate-900/90 px-6 py-3 border-b border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <span className="font-mono text-slate-500">{currentFile.path}</span>
        <span className="text-[11px] text-slate-400 hidden sm:inline">{currentFile.description}</span>
      </div>

      {/* Code Display */}
      <div className="relative bg-slate-950 p-4 lg:p-6 overflow-x-auto max-h-[550px] font-mono text-xs text-slate-300 leading-relaxed selection:bg-purple-500 selection:text-white">
        <pre className="overflow-visible whitespace-pre">
          <code>
            {currentFile.content.split('\n').map((line, idx) => (
              <div key={idx} className="table-row hover:bg-slate-900/60 transition-colors">
                <span className="table-cell select-none pr-4 text-right text-slate-600 w-10">
                  {idx + 1}
                </span>
                <span className="table-cell">{line}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};
