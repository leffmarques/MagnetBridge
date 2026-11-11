# Magnet Bridge 0.7

A lightweight Android handoff app for Stremio.

## What's new in 0.7
- Added a dedicated in-app screen after receiving a Stremio stream URL.
- Displays the extracted BitTorrent v1 infohash.
- Added the action label **Open Magnet Link with Torrent Client**.
- Added the planned **Save .torrent File** action.
- Retained external-player intent filters and the custom launcher icon.

## Current functionality
The magnet handoff is functional: the app extracts the 40-character v1 infohash and opens the Android chooser for installed torrent clients.

The metadata lookup and .torrent export engine are not implemented in this build yet. The Save .torrent File action is intentionally marked as unavailable rather than generating an invalid file from an infohash alone.

## Metadata engine plan
The selected implementation direction is libtorrent4j/libtorrent, which supports DHT (BEP 5), metadata exchange (BEP 9), and writing a .torrent file after metadata has been retrieved. Android native binaries and the asynchronous metadata retrieval lifecycle still need to be integrated and tested.

Reference: https://github.com/aldenml/libtorrent4j

## Build
Open the project in Android Studio and select **Build > Build APK(s)**, or use the configured GitHub Actions workflow.

## Compatibility
The app receives HTTP/HTTPS Stremio external-player intents and currently recognizes local Stremio URLs on 127.0.0.1:11470 containing a 40-character BitTorrent v1 infohash.
