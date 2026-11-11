import React from 'react';
import {
  Download,
  Settings,
  Tv,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Shield,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

interface StremioTutorialProps {
  language: 'pt' | 'en';
}

export const StremioTutorial: React.FC<StremioTutorialProps> = ({ language }) => {
  const isPt = language === 'pt';

  const steps = [
    {
      num: '01',
      title: isPt ? 'Instalar o APK no Android' : 'Install APK on Android',
      badge: isPt ? 'Dispositivos Móveis & TV' : 'Mobile & TV Devices',
      desc: isPt
        ? 'Baixe o arquivo MagnetBridge.apk para seu celular, tablet, TV Box ou Firestick. Abra o arquivo pelo gerenciador de arquivos e autorize a instalação de fontes desconhecidas se solicitado.'
        : 'Download the MagnetBridge.apk file to your phone, tablet, TV Box, or Fire TV stick. Open the file in your file manager and allow unknown sources if prompted.',
      icon: <Download className="w-5 h-5 text-purple-400" />,
      tips: isPt
        ? 'O app requer apenas a permissão básica de INTERNET e é 100% livre de rastreadores.'
        : 'The app only requests basic INTERNET permission with zero background telemetry.',
    },
    {
      num: '02',
      title: isPt ? 'Configurar Player Externo no Stremio' : 'Configure Stremio External Player',
      badge: isPt ? 'No App do Stremio' : 'Inside Stremio App',
      desc: isPt
        ? 'Abra o Stremio > acesse Configurações (Settings) > Reprodução (Playback) > ative a opção "Sempre iniciar com player externo". Alternativamente, ao dar play em qualquer filme ou episódio, toque nos três pontinhos (⋮) do player e toque em "Player Externo".'
        : 'Open Stremio > go to Settings > Playback > enable "Always start with external player". Alternatively, while watching any title, tap the player options (⋮) and select "Play in external player".',
      icon: <Settings className="w-5 h-5 text-indigo-400" />,
      tips: isPt
        ? 'Isso faz o Stremio enviar a stream para o seletor de aplicativos do Android.'
        : 'This prompts Stremio to dispatch the video stream Intent to the Android OS.',
    },
    {
      num: '03',
      title: isPt ? 'Selecionar o Magnet Bridge' : 'Select Magnet Bridge',
      badge: isPt ? 'Seletor do Android' : 'Android App Chooser',
      desc: isPt
        ? 'Quando o Android exibir a lista de players disponíveis (VLC, MX Player, etc.), selecione o aplicativo "Magnet Bridge". Você pode marcar "Sempre" para agilizar as próximas reproduções.'
        : 'When Android displays the available player list (VLC, MX Player, etc.), select "Magnet Bridge". You can choose "Always" to skip the dialog in future playbacks.',
      icon: <Tv className="w-5 h-5 text-blue-400" />,
      tips: isPt
        ? 'O Magnet Bridge foi registrado como receptor de MIME video/* e HTTP/HTTPS streams.'
        : 'Magnet Bridge registers specific intent-filters for video/* and HTTP/HTTPS streams.',
    },
    {
      num: '04',
      title: isPt ? 'Abrir no Cliente de Torrent ou Copiar' : 'Open in Torrent Client or Copy',
      badge: isPt ? 'Download Direto' : 'Direct Download',
      desc: isPt
        ? 'O Magnet Bridge intercepta a URL local (http://127.0.0.1:11470/<hash>/0), extrai o InfoHash v1 SHA1 de 40 dígitos e monta o magnet link. Você pode clicar em "Abrir no Torrent" para enviar ao LibreTorrent, Flud ou qBittorrent, ou copiar para a área de transferência.'
        : 'Magnet Bridge intercepts the local URL (http://127.0.0.1:11470/<hash>/0), extracts the 40-character SHA1 InfoHash, and creates the magnet link. Tap "Open in Torrent" or copy to clipboard.',
      icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
      tips: isPt
        ? 'Compatível com LibreTorrent, Flud, BiglyBT, tTorrent e qBittorrent.'
        : 'Compatible with LibreTorrent, Flud, BiglyBT, tTorrent, and qBittorrent.',
    },
  ];

  const faqs = [
    {
      q: isPt
        ? 'Por que o Stremio gera links como http://127.0.0.1:11470/<hash>/0?'
        : 'Why does Stremio generate links like http://127.0.0.1:11470/<hash>/0?',
      a: isPt
        ? 'O Stremio possui um motor interno local (streaming engine) que roda na porta 11470. Ele baixa os pedaços do torrent via DHT/BitTorrent e cria um servidor HTTP local em 127.0.0.1 para fornecer o fluxo de vídeo contínuo para o player de mídia. O caminho dessa URL sempre contém o hash SHA-1 de 40 caracteres do torrent original.'
        : 'Stremio runs a local streaming engine daemon listening on port 11470. It fetches torrent chunks and presents a local HTTP video stream at 127.0.0.1. The path segment of this URL invariably carries the 40-character SHA-1 infohash of the source torrent.',
    },
    {
      q: isPt
        ? 'Funciona no Android TV, Chromecast com Google TV e Fire TV Stick?'
        : 'Does it work on Android TV, Chromecast with Google TV, and Fire TV Stick?',
      a: isPt
        ? 'Sim! O APK foi compilado com suporte a partir do Android 5.0 (API 21) até o Android 15 (API 35). Você pode transferir o APK via aplicativo como Send Files to TV, Downloader, adb install ou pendrive USB.'
        : 'Yes! The APK is built targeting modern Android SDKs down to Android 5.0 (API 21). You can sideload it via Downloader, Send Files to TV, or ADB.',
    },
    {
      q: isPt
        ? 'Quais clientes de Torrent são recomendados no Android?'
        : 'Which Torrent clients are recommended on Android?',
      a: isPt
        ? 'Recomendamos o LibreTorrent (software livre, sem anúncios, disponível no F-Droid e Play Store), Flud ou BiglyBT. Todos eles detectam automaticamente o protocolo magnet:?xt=urn:btih: disparado pelo Magnet Bridge.'
        : 'We recommend LibreTorrent (open-source, zero ads, available on F-Droid and Play Store), Flud, or BiglyBT. All cleanly handle magnet: intent dispatches.',
    },
    {
      q: isPt
        ? 'Por que o botão "Save .torrent File" está desativado na versão atual?'
        : 'Why is "Save .torrent File" marked as pending in the current build?',
      a: isPt
        ? 'Um link magnet contém apenas o InfoHash e os trackers. Para criar um arquivo .torrent binário real no formato Bencode com a lista completa de arquivos e peças, o app precisa conectar ao DHT e baixar os metadados (BEP 9 / libtorrent4j). Essa funcionalidade está planejada para a próxima release.'
        : 'A magnet link only contains the hash and trackers. Creating a true binary .torrent bencoded file requires querying the DHT swarm for BEP 9 metadata. This is in development with libtorrent4j.',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Steps Section */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
            {isPt ? 'Passo a Passo de Instalação e Uso' : 'Step-by-Step Installation & Usage'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-3">
            {isPt ? 'Como Integrar o Stremio ao Magnet Bridge' : 'How to Integrate Stremio with Magnet Bridge'}
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            {isPt
              ? 'Em menos de 2 minutos você terá o Stremio configurado para transferir qualquer torrent para seu gerenciador de downloads favorito.'
              : 'Configure Stremio in under 2 minutes to hand off any torrent directly to your preferred downloader.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative flex flex-col justify-between hover:border-purple-500/30 transition-colors shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700/80">
                    {step.icon}
                  </div>
                  <span className="font-mono text-2xl font-black text-slate-700">{step.num}</span>
                </div>

                <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider block mb-1">
                  {step.badge}
                </span>
                <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{step.desc}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/80">
                <div className="flex items-start gap-1.5 text-[11px] text-slate-500">
                  <HelpCircle className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <span>{step.tips}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Diagram / Architecture Explanation Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 lg:p-8">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-purple-400" />
          <span>{isPt ? 'Fluxo de Dados: Do Stremio ao Torrent Client' : 'Data Flow: From Stremio to Torrent Client'}</span>
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          {isPt
            ? 'Entenda exatamente como a mágica acontece por debaixo dos panos através das Intents do Android:'
            : 'Understand exactly how the intent dispatch architecture operates behind the scenes:'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 font-bold mx-auto flex items-center justify-center text-xs mb-2">1</div>
            <div className="font-semibold text-white text-xs">Stremio Video Player</div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">http://127.0.0.1:11470/&lt;hash&gt;/0</div>
          </div>

          <div className="flex items-center justify-center text-purple-400">
            <ArrowRight className="w-6 h-6 rotate-90 md:rotate-0" />
          </div>

          <div className="p-4 bg-purple-950/30 border border-purple-800/50 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-purple-500/30 text-purple-300 font-bold mx-auto flex items-center justify-center text-xs mb-2">2</div>
            <div className="font-semibold text-purple-200 text-xs">Magnet Bridge APK</div>
            <div className="text-[11px] text-purple-300/80 mt-1">{isPt ? 'Regex extrai 40 hex' : 'Regex extracts 40 hex'}</div>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 font-bold mx-auto flex items-center justify-center text-xs mb-2">3</div>
            <div className="font-semibold text-emerald-300 text-xs">Torrent Client (LibreTorrent)</div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">magnet:?xt=urn:btih:...</div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">
          {isPt ? 'Perguntas Frequentes (FAQ)' : 'Frequently Asked Questions (FAQ)'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h4 className="font-semibold text-slate-200 text-sm mb-2 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
