/**
 * Robust APK downloader that handles browser iframe restrictions,
 * enforces binary application/vnd.android.package-archive MIME type,
 * and prevents browsers from appending '.html'.
 */

export async function downloadApkFile(
  onProgress?: (status: string) => void
): Promise<{ success: boolean; error?: string }> {
  try {
    onProgress?.('Iniciando download do APK binário...');

    // Method 1: Fetch binary as Blob with explicit APK MIME
    const response = await fetch('/api/download-apk', {
      headers: {
        Accept: 'application/vnd.android.package-archive, application/octet-stream, */*',
      },
    });

    if (!response.ok) {
      throw new Error(`Servidor respondeu com status ${response.status}`);
    }

    onProgress?.('Processando pacote Android...');
    const blob = await response.blob();
    // Force Android APK MIME type
    const apkBlob = new Blob([blob], {
      type: 'application/vnd.android.package-archive',
    });

    const blobUrl = window.URL.createObjectURL(apkBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', 'MagnetBridge.apk');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }, 2000);

    onProgress?.('Download concluído!');
    return { success: true };
  } catch (err: any) {
    // Method 2: Fallback to Base64 data URL
    try {
      onProgress?.('Tentando método alternativo via Base64...');
      const b64Res = await fetch('/api/apk-base64');
      const b64Data = await b64Res.json();

      if (b64Data.success && b64Data.base64) {
        const byteCharacters = atob(b64Data.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: 'application/vnd.android.package-archive',
        });

        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = 'MagnetBridge.apk';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        }, 2000);

        onProgress?.('Download concluído via Base64!');
        return { success: true };
      }
    } catch {
      // Direct link fallback
      window.location.href = '/api/download-apk';
    }

    return { success: false, error: err.message };
  }
}
