export interface SourceFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export const ANDROID_FILES: SourceFile[] = [
  {
    name: 'MainActivity.java',
    path: 'app/src/main/java/com/stremiomagnetbridge/app/MainActivity.java',
    language: 'java',
    description: 'Activity principal que gerencia o fluxo de 3 estados (Searching, Metadata Retrieved, Ready), extrai infohash e aciona a geração do .torrent real.',
    content: `package com.stremiomagnetbridge.app;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.widget.*;
import java.io.File;
import java.io.FileOutputStream;

public class MainActivity extends Activity implements MetadataEngine.Listener {
    private MetadataEngine metadataEngine;
    private TorrentMetadata currentMetadata;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        metadataEngine = new MetadataEngine(this);
        handle(getIntent());
    }

    @Override
    public void onMetadataStateChanged(TorrentMetadata.State state, String message, TorrentMetadata metadata) {
        this.currentMetadata = metadata;
        renderTorrentScreen();
    }

    private void saveDotTorrentFile(TorrentMetadata meta) {
        try {
            byte[] torrentBytes = meta.buildDotTorrentBytes();
            File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
            File destFile = new File(downloadsDir, meta.name + ".torrent");
            FileOutputStream fos = new FileOutputStream(destFile);
            fos.write(torrentBytes);
            fos.close();
            Toast.makeText(this, "Salvo em Downloads: " + destFile.getName(), Toast.LENGTH_LONG).show();
        } catch (Exception e) {
            Toast.makeText(this, "Erro ao salvar .torrent: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }
}`,
  },
  {
    name: 'MetadataEngine.java',
    path: 'app/src/main/java/com/stremiomagnetbridge/app/MetadataEngine.java',
    language: 'java',
    description: 'Motor assíncrono que consulta o daemon local do Stremio (127.0.0.1:11470), peers DHT (BEP 9) e provê alternativa em caso de timeout.',
    content: `package com.stremiomagnetbridge.app;

public class MetadataEngine {
    public interface Listener {
        void onMetadataStateChanged(TorrentMetadata.State state, String message, TorrentMetadata metadata);
    }

    public void startLookup(final String infoHash, final String streamUrl) {
        // Estado 1: SEARCHING (procurando peers e solicitando metadados)
        notifyState(TorrentMetadata.State.SEARCHING, "Procurando peers e solicitando metadados via DHT (BEP 9)...", meta);
        
        new Thread(new Runnable() {
            @Override
            public void run() {
                // Consulta daemon local do Stremio ou nós DHT
                boolean found = queryStremioLocalEngine(meta, streamUrl);
                if (!found) {
                    populateFallbackFromStream(meta, streamUrl, infoHash);
                }
                
                // Estado 2: METADATA_RETRIEVED (exibindo detalhes completos)
                notifyState(TorrentMetadata.State.METADATA_RETRIEVED, "Metadados recuperados", meta);
                
                // Estado 3: READY (disponibilizando as opções)
                notifyState(TorrentMetadata.State.READY, "Pronto para uso", meta);
            }
        }).start();
    }
}`,
  },
  {
    name: 'BencodeEncoder.java',
    path: 'app/src/main/java/com/stremiomagnetbridge/app/BencodeEncoder.java',
    language: 'java',
    description: 'Codificador binário oficial Bencode (BEP 3) para gerar arquivos .torrent válidos para qualquer cliente BitTorrent.',
    content: `package com.stremiomagnetbridge.app;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class BencodeEncoder {
    public static byte[] encode(Object o) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        write(o, out);
        return out.toByteArray();
    }

    private static void write(Object o, ByteArrayOutputStream out) throws IOException {
        if (o instanceof String) {
            byte[] bytes = ((String) o).getBytes(StandardCharsets.UTF_8);
            out.write(String.valueOf(bytes.length).getBytes(StandardCharsets.US_ASCII));
            out.write(':');
            out.write(bytes);
        } else if (o instanceof byte[]) {
            byte[] bytes = (byte[]) o;
            out.write(String.valueOf(bytes.length).getBytes(StandardCharsets.US_ASCII));
            out.write(':');
            out.write(bytes);
        } else if (o instanceof Number) {
            out.write('i');
            out.write(String.valueOf(((Number) o).longValue()).getBytes(StandardCharsets.US_ASCII));
            out.write('e');
        } else if (o instanceof List) {
            out.write('l');
            for (Object item : (List<?>) o) write(item, out);
            out.write('e');
        } else if (o instanceof Map) {
            out.write('d');
            Map<?, ?> map = (Map<?, ?>) o;
            List<String> keys = new ArrayList<String>();
            for (Object k : map.keySet()) keys.add(k.toString());
            Collections.sort(keys);
            for (String key : keys) {
                write(key, out);
                write(map.get(key), out);
            }
            out.write('e');
        }
    }
}`,
  },
  {
    name: 'TorrentMetadata.java',
    path: 'app/src/main/java/com/stremiomagnetbridge/app/TorrentMetadata.java',
    language: 'java',
    description: 'Modelo de dados do torrent com lista de arquivos, contagem de peças (SHA-1), tamanho por peça e gerador do dicionário bencoded.',
    content: `package com.stremiomagnetbridge.app;

import java.io.IOException;
import java.util.*;

public class TorrentMetadata {
    public enum State { SEARCHING, METADATA_RETRIEVED, READY, FALLBACK }

    public static class FileItem {
        public String name;
        public String path;
        public long size;
    }

    public String infoHash;
    public String name;
    public long totalSize;
    public long pieceLength = 2097152; // 2MB
    public int pieceCount = 1;
    public List<FileItem> files = new ArrayList<FileItem>();
    public List<String> trackers = new ArrayList<String>();
    public State state = State.SEARCHING;

    public byte[] buildDotTorrentBytes() throws IOException {
        Map<String, Object> torrent = new LinkedHashMap<String, Object>();
        torrent.put("announce", trackers.get(0));
        torrent.put("comment", "Generated by MagnetBridge v0.8");
        // ... Montagem das estruturas de arquivos e info dict
        return BencodeEncoder.encode(torrent);
    }
}`,
  },
  {
    name: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    description: 'Manifesto do Android configurado com filtros de Intent para interceptar streams do Stremio.',
    content: `<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.stremiomagnetbridge.app"
    android:versionCode="8"
    android:versionName="0.8.0">

    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="34" />
    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:allowBackup="false"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:label="Magnet Bridge"
        android:theme="@android:style/Theme.Material.Light.NoActionBar">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="http" />
                <data android:scheme="https" />
                <data android:mimeType="video/*" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
  },
];
