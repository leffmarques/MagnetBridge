package com.stremiomagnetbridge.app;

import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MainActivity extends Activity implements MetadataEngine.Listener {
    private static final Pattern HASH_PATTERN = Pattern.compile("(?i)(?:^|/|urn:btih:|=)([a-f0-9]{40})(?:/|\\?|&|$)");
    private static final String DEFAULT_TRACKERS = 
        "&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce" +
        "&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce" +
        "&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce" +
        "&tr=udp%3A%2F%2Fexplodie.org%3A6969%2Fannounce";

    private String magnetUri;
    private String infoHash;
    private String rawReceivedUrl;
    private MetadataEngine metadataEngine;
    private TorrentMetadata currentMetadata;
    private LinearLayout rootContainer;

    private int dp(float value) {
        return (int) (value * getResources().getDisplayMetrics().density + 0.5f);
    }

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        metadataEngine = new MetadataEngine(this);
        handle(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handle(intent);
    }

    private void handle(Intent intent) {
        String urlString = null;
        if (intent != null) {
            Uri data = intent.getData();
            if (data != null) {
                urlString = data.toString();
            } else if (Intent.ACTION_SEND.equals(intent.getAction())) {
                String shared = intent.getStringExtra(Intent.EXTRA_TEXT);
                if (shared != null) urlString = shared.trim();
            }
        }

        if (urlString != null && !urlString.isEmpty()) {
            processUrl(urlString, false);
        } else {
            showDashboard(null);
        }
    }

    private boolean processUrl(String input, boolean fromManualInput) {
        if (input == null || input.trim().isEmpty()) {
            if (fromManualInput) {
                Toast.makeText(this, "Insira um link de streaming válido do Stremio.", Toast.LENGTH_SHORT).show();
            } else {
                showDashboard(null);
            }
            return false;
        }

        input = input.trim();
        rawReceivedUrl = input;

        Matcher matcher = HASH_PATTERN.matcher(input);
        if (matcher.find()) {
            infoHash = matcher.group(1).toLowerCase();
            magnetUri = "magnet:?xt=urn:btih:" + infoHash + DEFAULT_TRACKERS;
            
            // Start the 3-state metadata engine
            metadataEngine.startLookup(infoHash, rawReceivedUrl);
            return true;
        } else {
            String errorMsg = "Não foi possível encontrar um InfoHash de 40 dígitos no link fornecido.";
            if (fromManualInput) {
                Toast.makeText(this, errorMsg, Toast.LENGTH_LONG).show();
            } else {
                showDashboard(errorMsg);
            }
            return false;
        }
    }

    @Override
    public void onMetadataStateChanged(TorrentMetadata.State state, String message, TorrentMetadata metadata) {
        this.currentMetadata = metadata;
        renderTorrentScreen();
    }

    private GradientDrawable createCardBg(int color, int radiusDp, int strokeColor) {
        GradientDrawable gd = new GradientDrawable();
        gd.setColor(color);
        gd.setCornerRadius(dp(radiusDp));
        if (strokeColor != 0) {
            gd.setStroke(dp(1), strokeColor);
        }
        return gd;
    }

    private void renderTorrentScreen() {
        if (currentMetadata == null) return;

        int bg = Color.rgb(10, 13, 30);
        int cardBg = Color.rgb(20, 25, 50);
        int white = Color.rgb(245, 246, 255);
        int muted = Color.rgb(166, 174, 207);
        int accent = Color.rgb(147, 51, 234);
        int emerald = Color.rgb(34, 197, 94);
        int amber = Color.rgb(245, 158, 11);

        LinearLayout page = new LinearLayout(this);
        page.setOrientation(LinearLayout.VERTICAL);
        page.setPadding(dp(20), dp(24), dp(20), dp(28));
        page.setBackgroundColor(bg);

        // Header / Brand
        TextView brand = new TextView(this);
        brand.setText("MAGNET BRIDGE 0.8 · TORRENT GENERATOR");
        brand.setTextColor(Color.rgb(192, 132, 252));
        brand.setTextSize(11);
        brand.setLetterSpacing(0.12f);
        brand.setTypeface(null, Typeface.BOLD);
        page.addView(brand);

        // Title
        TextView title = new TextView(this);
        title.setText(currentMetadata.name != null ? currentMetadata.name : "Torrent Detectado");
        title.setTextColor(white);
        title.setTextSize(20);
        title.setTypeface(null, Typeface.BOLD);
        LinearLayout.LayoutParams titleLp = new LinearLayout.LayoutParams(-1, -2);
        titleLp.topMargin = dp(6);
        page.addView(title, titleLp);

        // State Badge
        LinearLayout statusRow = new LinearLayout(this);
        statusRow.setOrientation(LinearLayout.HORIZONTAL);
        statusRow.setGravity(Gravity.CENTER_VERTICAL);
        LinearLayout.LayoutParams statusRowLp = new LinearLayout.LayoutParams(-1, -2);
        statusRowLp.topMargin = dp(6);
        page.addView(statusRow, statusRowLp);

        TextView stateBadge = new TextView(this);
        int badgeColor = emerald;
        String badgeText = "READY · DISPONÍVEL";

        if (currentMetadata.state == TorrentMetadata.State.SEARCHING) {
            badgeColor = amber;
            badgeText = "SEARCHING (PROCURANDO PEERS / BEP 9)...";
        } else if (currentMetadata.state == TorrentMetadata.State.METADATA_RETRIEVED) {
            badgeColor = Color.rgb(56, 189, 248);
            badgeText = "METADATA RETRIEVED";
        } else if (currentMetadata.state == TorrentMetadata.State.FALLBACK) {
            badgeColor = amber;
            badgeText = "ALTERNATIVA (FLUXO STREMIO)";
        }

        stateBadge.setText(badgeText);
        stateBadge.setTextColor(badgeColor);
        stateBadge.setTextSize(11);
        stateBadge.setTypeface(null, Typeface.BOLD);
        stateBadge.setBackground(createCardBg(Color.argb(40, Color.red(badgeColor), Color.green(badgeColor), Color.blue(badgeColor)), 6, badgeColor));
        stateBadge.setPadding(dp(8), dp(3), dp(8), dp(3));
        statusRow.addView(stateBadge);

        if (currentMetadata.state == TorrentMetadata.State.SEARCHING) {
            ProgressBar pBar = new ProgressBar(this, null, android.R.attr.progressBarStyleSmall);
            LinearLayout.LayoutParams pLp = new LinearLayout.LayoutParams(dp(18), dp(18));
            pLp.leftMargin = dp(8);
            statusRow.addView(pBar, pLp);
        }

        // Fallback message if applicable
        if (currentMetadata.state == TorrentMetadata.State.FALLBACK) {
            TextView fallbackBox = new TextView(this);
            fallbackBox.setText("⚠️ A busca via DHT demorou. Ativamos a alternativa gerando metadados do fluxo local do Stremio para que você possa salvar o .torrent sem travamentos.");
            fallbackBox.setTextColor(Color.rgb(253, 230, 138));
            fallbackBox.setTextSize(11);
            fallbackBox.setPadding(dp(12), dp(10), dp(12), dp(10));
            fallbackBox.setBackground(createCardBg(Color.rgb(60, 45, 15), 8, Color.rgb(180, 120, 20)));
            LinearLayout.LayoutParams fbLp = new LinearLayout.LayoutParams(-1, -2);
            fbLp.topMargin = dp(12);
            page.addView(fallbackBox, fbLp);
        }

        // Torrent Details Card (Metadata Retrieved)
        LinearLayout metaCard = new LinearLayout(this);
        metaCard.setOrientation(LinearLayout.VERTICAL);
        metaCard.setPadding(dp(14), dp(14), dp(14), dp(14));
        metaCard.setBackground(createCardBg(cardBg, 12, Color.rgb(45, 55, 95)));
        LinearLayout.LayoutParams metaCardLp = new LinearLayout.LayoutParams(-1, -2);
        metaCardLp.topMargin = dp(14);
        page.addView(metaCard, metaCardLp);

        // InfoHash
        TextView hashLabel = new TextView(this);
        hashLabel.setText("INFOHASH (SHA-1 v1):");
        hashLabel.setTextColor(muted);
        hashLabel.setTextSize(10);
        hashLabel.setTypeface(null, Typeface.BOLD);
        metaCard.addView(hashLabel);

        TextView hashVal = new TextView(this);
        hashVal.setText(currentMetadata.infoHash);
        hashVal.setTextColor(Color.rgb(216, 180, 254));
        hashVal.setTextSize(12);
        hashVal.setTypeface(Typeface.MONOSPACE, Typeface.BOLD);
        hashVal.setTextIsSelectable(true);
        metaCard.addView(hashVal);

        // Grid for Size, Pieces, Source
        LinearLayout grid = new LinearLayout(this);
        grid.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams gridLp = new LinearLayout.LayoutParams(-1, -2);
        gridLp.topMargin = dp(10);
        metaCard.addView(grid, gridLp);

        // Size Col
        LinearLayout col1 = new LinearLayout(this);
        col1.setOrientation(LinearLayout.VERTICAL);
        col1.setLayoutParams(new LinearLayout.LayoutParams(0, -2, 1.0f));
        TextView sLbl = new TextView(this);
        sLbl.setText("TAMANHO TOTAL:");
        sLbl.setTextColor(muted);
        sLbl.setTextSize(10);
        col1.addView(sLbl);
        TextView sVal = new TextView(this);
        sVal.setText(currentMetadata.getFormattedTotalSize());
        sVal.setTextColor(white);
        sVal.setTextSize(12);
        sVal.setTypeface(null, Typeface.BOLD);
        col1.addView(sVal);
        grid.addView(col1);

        // Pieces Col
        LinearLayout col2 = new LinearLayout(this);
        col2.setOrientation(LinearLayout.VERTICAL);
        col2.setLayoutParams(new LinearLayout.LayoutParams(0, -2, 1.0f));
        TextView pLbl = new TextView(this);
        pLbl.setText("PEÇAS:");
        pLbl.setTextColor(muted);
        pLbl.setTextSize(10);
        col2.addView(pLbl);
        TextView pVal = new TextView(this);
        pVal.setText(currentMetadata.pieceCount + " × " + currentMetadata.getFormattedPieceLength());
        pVal.setTextColor(white);
        pVal.setTextSize(12);
        pVal.setTypeface(null, Typeface.BOLD);
        col2.addView(pVal);
        grid.addView(col2);

        // File List Section
        TextView filesTitle = new TextView(this);
        filesTitle.setText("LISTA DE ARQUIVOS NO TORRENT (" + currentMetadata.files.size() + "):");
        filesTitle.setTextColor(muted);
        filesTitle.setTextSize(10);
        filesTitle.setTypeface(null, Typeface.BOLD);
        LinearLayout.LayoutParams fTLp = new LinearLayout.LayoutParams(-1, -2);
        fTLp.topMargin = dp(12);
        metaCard.addView(filesTitle, fTLp);

        for (int i = 0; i < currentMetadata.files.size(); i++) {
            TorrentMetadata.FileItem item = currentMetadata.files.get(i);
            LinearLayout fileRow = new LinearLayout(this);
            fileRow.setOrientation(LinearLayout.HORIZONTAL);
            fileRow.setPadding(dp(8), dp(6), dp(8), dp(6));
            fileRow.setBackground(createCardBg(Color.rgb(15, 20, 42), 6, Color.rgb(35, 45, 80)));
            LinearLayout.LayoutParams fRowLp = new LinearLayout.LayoutParams(-1, -2);
            fRowLp.topMargin = dp(4);
            metaCard.addView(fileRow, fRowLp);

            TextView fName = new TextView(this);
            fName.setText((i + 1) + ". " + item.name);
            fName.setTextColor(Color.rgb(220, 228, 250));
            fName.setTextSize(11);
            fName.setLayoutParams(new LinearLayout.LayoutParams(0, -2, 1.0f));
            fileRow.addView(fName);

            TextView fSize = new TextView(this);
            fSize.setText(item.getFormattedSize());
            fSize.setTextColor(Color.rgb(147, 197, 253));
            fSize.setTextSize(11);
            fSize.setTypeface(Typeface.MONOSPACE);
            fileRow.addView(fSize);
        }

        // Trackers Preview
        TextView trTitle = new TextView(this);
        trTitle.setText("TRACKERS IDENTIFICADOS (" + currentMetadata.trackers.size() + "):");
        trTitle.setTextColor(muted);
        trTitle.setTextSize(10);
        trTitle.setTypeface(null, Typeface.BOLD);
        LinearLayout.LayoutParams trTLp = new LinearLayout.LayoutParams(-1, -2);
        trTLp.topMargin = dp(12);
        metaCard.addView(trTitle, trTLp);

        TextView trList = new TextView(this);
        StringBuilder sb = new StringBuilder();
        for (String tr : currentMetadata.trackers) {
            sb.append("• ").append(tr).append("\n");
        }
        trList.setText(sb.toString().trim());
        trList.setTextColor(Color.rgb(180, 190, 220));
        trList.setTextSize(10);
        trList.setTypeface(Typeface.MONOSPACE);
        metaCard.addView(trList);

        // ACTION BUTTONS (Ready state with both options)
        Button saveTorrentBtn = new Button(this);
        saveTorrentBtn.setText("💾 SALVAR ARQUIVO .TORRENT REAL");
        saveTorrentBtn.setAllCaps(false);
        saveTorrentBtn.setTextColor(Color.WHITE);
        saveTorrentBtn.setTextSize(14);
        saveTorrentBtn.setTypeface(null, Typeface.BOLD);
        saveTorrentBtn.setBackground(createCardBg(Color.rgb(16, 185, 129), 10, 0));
        LinearLayout.LayoutParams saveLp = new LinearLayout.LayoutParams(-1, dp(48));
        saveLp.topMargin = dp(18);
        page.addView(saveTorrentBtn, saveLp);
        saveTorrentBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                saveDotTorrentFile(currentMetadata);
            }
        });

        Button openMagnetBtn = new Button(this);
        openMagnetBtn.setText("🧲 ABRIR NO CLIENTE DE TORRENT (MAGNET)");
        openMagnetBtn.setAllCaps(false);
        openMagnetBtn.setTextColor(Color.WHITE);
        openMagnetBtn.setTextSize(14);
        openMagnetBtn.setTypeface(null, Typeface.BOLD);
        openMagnetBtn.setBackground(createCardBg(accent, 10, 0));
        LinearLayout.LayoutParams openLp = new LinearLayout.LayoutParams(-1, dp(46));
        openLp.topMargin = dp(10);
        page.addView(openMagnetBtn, openLp);
        openMagnetBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                openMagnetInClient();
            }
        });

        // Copy Magnet Button
        Button copyMagnetBtn = new Button(this);
        copyMagnetBtn.setText("COPIAR MAGNET LINK");
        copyMagnetBtn.setAllCaps(false);
        copyMagnetBtn.setTextColor(white);
        copyMagnetBtn.setTextSize(13);
        copyMagnetBtn.setBackground(createCardBg(Color.rgb(35, 42, 75), 10, Color.rgb(60, 70, 110)));
        LinearLayout.LayoutParams copyLp = new LinearLayout.LayoutParams(-1, dp(42));
        copyLp.topMargin = dp(8);
        page.addView(copyMagnetBtn, copyLp);
        copyMagnetBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                copyMagnetToClipboard();
            }
        });

        // Retry / Back Button
        Button backBtn = new Button(this);
        backBtn.setText("Testar Outro Link do Stremio");
        backBtn.setAllCaps(false);
        backBtn.setTextColor(muted);
        backBtn.setTextSize(12);
        backBtn.setBackgroundColor(Color.TRANSPARENT);
        LinearLayout.LayoutParams backLp = new LinearLayout.LayoutParams(-1, -2);
        backLp.topMargin = dp(10);
        page.addView(backBtn, backLp);
        backBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                showDashboard(null);
            }
        });

        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.addView(page);
        setContentView(scroll);
    }

    private void saveDotTorrentFile(TorrentMetadata meta) {
        try {
            byte[] torrentBytes = meta.buildDotTorrentBytes();
            String cleanName = meta.name.replaceAll("[^a-zA-Z0-9._-]", "_");
            if (!cleanName.endsWith(".torrent")) {
                cleanName += ".torrent";
            }

            File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
            if (!downloadsDir.exists()) {
                downloadsDir.mkdirs();
            }

            File destFile = new File(downloadsDir, cleanName);
            FileOutputStream fos = new FileOutputStream(destFile);
            fos.write(torrentBytes);
            fos.flush();
            fos.close();

            Toast.makeText(this, "Arquivo salvo em Downloads: " + cleanName, Toast.LENGTH_LONG).show();

            // Also trigger share / open chooser for the generated .torrent
            Intent share = new Intent(Intent.ACTION_SEND);
            share.setType("application/x-bittorrent");
            share.putExtra(Intent.EXTRA_SUBJECT, cleanName);
            share.putExtra(Intent.EXTRA_TEXT, "Torrent gerado por Magnet Bridge: " + meta.infoHash);
            startActivity(Intent.createChooser(share, "Compartilhar ou Abrir .torrent gerado"));
        } catch (Exception e) {
            Toast.makeText(this, "Erro ao gerar arquivo .torrent: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    private void showDashboard(String errorMessage) {
        int bg = Color.rgb(10, 13, 30);
        int cardBg = Color.rgb(20, 25, 50);
        int white = Color.rgb(245, 246, 255);
        int muted = Color.rgb(166, 174, 207);
        int accent = Color.rgb(147, 51, 234);

        LinearLayout page = new LinearLayout(this);
        page.setOrientation(LinearLayout.VERTICAL);
        page.setPadding(dp(22), dp(28), dp(22), dp(28));
        page.setBackgroundColor(bg);

        TextView brand = new TextView(this);
        brand.setText("MAGNET BRIDGE 0.8 · TORRENT GENERATOR");
        brand.setTextColor(Color.rgb(192, 132, 252));
        brand.setTextSize(12);
        brand.setLetterSpacing(0.12f);
        brand.setTypeface(null, Typeface.BOLD);
        page.addView(brand);

        TextView title = new TextView(this);
        title.setText("Stremio External Player Bridge");
        title.setTextColor(white);
        title.setTextSize(22);
        title.setTypeface(null, Typeface.BOLD);
        LinearLayout.LayoutParams titleLp = new LinearLayout.LayoutParams(-1, -2);
        titleLp.topMargin = dp(8);
        page.addView(title, titleLp);

        TextView subtitle = new TextView(this);
        subtitle.setText("Extraia InfoHash, recupere metadados (BEP 9) e gere arquivos .torrent reais.");
        subtitle.setTextColor(muted);
        subtitle.setTextSize(13);
        LinearLayout.LayoutParams subLp = new LinearLayout.LayoutParams(-1, -2);
        subLp.topMargin = dp(4);
        page.addView(subtitle, subLp);

        if (errorMessage != null) {
            TextView errBox = new TextView(this);
            errBox.setText(errorMessage);
            errBox.setTextColor(Color.rgb(248, 113, 113));
            errBox.setTextSize(12);
            errBox.setPadding(dp(12), dp(12), dp(12), dp(12));
            errBox.setBackground(createCardBg(Color.rgb(45, 20, 25), 8, Color.rgb(120, 30, 40)));
            LinearLayout.LayoutParams errLp = new LinearLayout.LayoutParams(-1, -2);
            errLp.topMargin = dp(16);
            page.addView(errBox, errLp);
        }

        // Instructions Card
        LinearLayout instructionsCard = new LinearLayout(this);
        instructionsCard.setOrientation(LinearLayout.VERTICAL);
        instructionsCard.setPadding(dp(16), dp(16), dp(16), dp(16));
        instructionsCard.setBackground(createCardBg(cardBg, 12, Color.rgb(45, 55, 95)));
        LinearLayout.LayoutParams instLp = new LinearLayout.LayoutParams(-1, -2);
        instLp.topMargin = dp(20);
        page.addView(instructionsCard, instLp);

        TextView instTitle = new TextView(this);
        instTitle.setText("COMO FUNCIONA NO STREMIO:");
        instTitle.setTextColor(Color.rgb(180, 150, 255));
        instTitle.setTextSize(12);
        instTitle.setTypeface(null, Typeface.BOLD);
        instructionsCard.addView(instTitle);

        TextView steps = new TextView(this);
        steps.setText(
            "1. No Stremio, clique em 'Player Externo' em qualquer filme\n" +
            "2. Selecione 'Magnet Bridge'\n" +
            "3. O app entra no estado SEARCHING buscando metadados via DHT\n" +
            "4. Em METADATA RETRIEVED exibe a lista de arquivos e peças\n" +
            "5. Em READY você pode abrir o Magnet ou Salvar o arquivo .torrent!"
        );
        steps.setTextColor(Color.rgb(215, 222, 245));
        steps.setTextSize(13);
        steps.setLineSpacing(dp(4), 1.0f);
        LinearLayout.LayoutParams stepLp = new LinearLayout.LayoutParams(-1, -2);
        stepLp.topMargin = dp(10);
        instructionsCard.addView(steps, stepLp);

        // Manual Input Area
        TextView manualLabel = new TextView(this);
        manualLabel.setText("TESTAR OU COLAR UM LINK DE STREAMING:");
        manualLabel.setTextColor(muted);
        manualLabel.setTextSize(11);
        manualLabel.setTypeface(null, Typeface.BOLD);
        LinearLayout.LayoutParams mLblLp = new LinearLayout.LayoutParams(-1, -2);
        mLblLp.topMargin = dp(24);
        page.addView(manualLabel, mLblLp);

        final EditText urlInput = new EditText(this);
        urlInput.setHint("http://127.0.0.1:11470/4f50.../0");
        urlInput.setHintTextColor(Color.rgb(100, 110, 140));
        urlInput.setTextColor(white);
        urlInput.setTextSize(13);
        urlInput.setTypeface(Typeface.MONOSPACE);
        urlInput.setPadding(dp(14), dp(14), dp(14), dp(14));
        urlInput.setBackground(createCardBg(cardBg, 8, Color.rgb(60, 70, 110)));
        LinearLayout.LayoutParams inpLp = new LinearLayout.LayoutParams(-1, -2);
        inpLp.topMargin = dp(8);
        page.addView(urlInput, inpLp);

        Button convertBtn = new Button(this);
        convertBtn.setText("PESQUISAR METADADOS E GERAR .TORRENT");
        convertBtn.setAllCaps(false);
        convertBtn.setTextColor(Color.WHITE);
        convertBtn.setTextSize(14);
        convertBtn.setTypeface(null, Typeface.BOLD);
        convertBtn.setBackground(createCardBg(accent, 8, 0));
        LinearLayout.LayoutParams convLp = new LinearLayout.LayoutParams(-1, dp(46));
        convLp.topMargin = dp(12);
        page.addView(convertBtn, convLp);
        convertBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                processUrl(urlInput.getText().toString(), true);
            }
        });

        // Sample Test button
        Button sampleBtn = new Button(this);
        sampleBtn.setText("Colar Exemplo de Stream do Stremio");
        sampleBtn.setAllCaps(false);
        sampleBtn.setTextColor(Color.rgb(180, 190, 225));
        sampleBtn.setTextSize(12);
        sampleBtn.setBackgroundColor(Color.TRANSPARENT);
        page.addView(sampleBtn);
        sampleBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                urlInput.setText("http://127.0.0.1:11470/b8e018d963ca612e4d0d0f04c63673510e82cbf3/Cosmos_Laundromat_1080p.mkv");
            }
        });

        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.addView(page);
        setContentView(scroll);
    }

    private void openMagnetInClient() {
        if (magnetUri == null) return;
        try {
            Intent open = new Intent(Intent.ACTION_VIEW, Uri.parse(magnetUri));
            open.addCategory(Intent.CATEGORY_BROWSABLE);
            open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            Intent chooser = Intent.createChooser(open, "Abrir magnet link com cliente de torrent");
            chooser.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(chooser);
        } catch (Exception e) {
            Toast.makeText(this, "Nenhum cliente de torrent compatível encontrado (instale LibreTorrent ou Flud).", Toast.LENGTH_LONG).show();
        }
    }

    private void copyMagnetToClipboard() {
        if (magnetUri == null) return;
        ClipboardManager clipboard = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
        ClipData clip = ClipData.newPlainText("BitTorrent Magnet Link", magnetUri);
        if (clipboard != null) {
            clipboard.setPrimaryClip(clip);
            Toast.makeText(this, "Magnet link copiado para a área de transferência!", Toast.LENGTH_SHORT).show();
        }
    }
}
