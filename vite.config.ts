import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { exec } from 'child_process';
import fs from 'fs';
import crypto from 'crypto';

function apkBuilderPlugin(): Plugin {
  return {
    name: 'apk-builder-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];

        // 1. Direct APK download with explicit Android MIME & Content-Disposition
        if (
          url === '/MagnetBridge.apk' ||
          url === '/api/download-apk' ||
          url === '/downloads/MagnetBridge.apk' ||
          url === '/downloads/MagnetBridge-v0.7.1.apk'
        ) {
          try {
            const apkPath = '/app/applet/public/MagnetBridge.apk';
            if (fs.existsSync(apkPath)) {
              const stats = fs.statSync(apkPath);
              res.setHeader('Content-Type', 'application/vnd.android.package-archive');
              res.setHeader('Content-Disposition', 'attachment; filename="MagnetBridge.apk"');
              res.setHeader('Content-Length', stats.size);
              res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
              res.setHeader('Pragma', 'no-cache');
              res.setHeader('Expires', '0');
              const stream = fs.createReadStream(apkPath);
              stream.pipe(res);
              return;
            } else {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'text/plain');
              res.end('APK not found on server. Please recompile.');
              return;
            }
          } catch (err: any) {
            res.statusCode = 500;
            res.end('Error serving APK: ' + err.message);
            return;
          }
        }

        // 2. Base64 endpoint for guaranteed browser client-side Blob generation
        if (url === '/api/apk-base64') {
          try {
            const apkPath = '/app/applet/public/MagnetBridge.apk';
            if (fs.existsSync(apkPath)) {
              const buffer = fs.readFileSync(apkPath);
              const base64 = buffer.toString('base64');
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  filename: 'MagnetBridge.apk',
                  mimeType: 'application/vnd.android.package-archive',
                  sizeBytes: buffer.length,
                  base64,
                })
              );
              return;
            }
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'APK not found' }));
            return;
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message }));
            return;
          }
        }

        // 3. Source ZIP download with explicit zip MIME
        if (
          url === '/MagnetBridge-source.zip' ||
          url === '/downloads/MagnetBridge-source.zip' ||
          url === '/downloads/MagnetBridge-source-v0.7.1.zip'
        ) {
          try {
            const zipPath = '/app/applet/public/MagnetBridge-source.zip';
            if (fs.existsSync(zipPath)) {
              const stats = fs.statSync(zipPath);
              res.setHeader('Content-Type', 'application/zip');
              res.setHeader('Content-Disposition', 'attachment; filename="MagnetBridge-source.zip"');
              res.setHeader('Content-Length', stats.size);
              const stream = fs.createReadStream(zipPath);
              stream.pipe(res);
              return;
            }
          } catch {
            // fallback to next
          }
        }

        // 4. API to trigger APK recompilation
        if (url === '/api/build-apk' && req.method === 'POST') {
          try {
            exec('/app/applet/scripts/build_apk.sh', (error, stdout, stderr) => {
              res.setHeader('Content-Type', 'application/json');
              if (error) {
                res.statusCode = 500;
                res.end(
                  JSON.stringify({
                    success: false,
                    error: error.message,
                    log: stdout + '\n' + stderr,
                  })
                );
              } else {
                res.end(
                  JSON.stringify({
                    success: true,
                    log: stdout,
                    downloadUrl: '/api/download-apk',
                    timestamp: new Date().toISOString(),
                  })
                );
              }
            });
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
          return;
        }

        // 5. APK metadata info
        if (url === '/api/apk-info' && req.method === 'GET') {
          try {
            const apkPath = '/app/applet/public/MagnetBridge.apk';
            if (fs.existsSync(apkPath)) {
              const stats = fs.statSync(apkPath);
              const buffer = fs.readFileSync(apkPath);
              const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  exists: true,
                  sizeBytes: stats.size,
                  sizeFormatted: (stats.size / 1024).toFixed(1) + ' KB',
                  modifiedAt: stats.mtime,
                  sha256,
                  version: '0.8.0',
                  package: 'com.stremiomagnetbridge.app',
                  minSdk: 21,
                  targetSdk: 34,
                })
              );
              return;
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ exists: false }));
          } catch (e: any) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e.message }));
          }
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apkBuilderPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
