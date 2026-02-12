# Nano Banana Invitation Generator

A versatile web application designed to generate professional, blank invitation templates for any occasion using Google's **Imagen 3 (Nano Banana)** AI model.

## Features

*   **Universal Event Support**: Generate templates for Weddings, Birthdays, Corporate Events, Baby Showers, Galas, and over 30 other event types.
*   **Batch Generation**: Generate 1 to 20 images in a sequence.
*   **Local File Saving**: Automatically save generated PNGs and JSON metadata to a specific folder on your computer (Supported in Chrome/Edge/Opera).
*   **Zero-Text Guarantee**: Prompts are tuned to produce blank, decorative templates ready for text overlay.

## Prerequisites

1.  **Google Cloud/Gemini API Key**: You need an API Key that has access to the `gemini-2.5-flash-image` model.
2.  **Modern Browser**: Google Chrome, Microsoft Edge, or Opera are recommended for "Save to Folder" functionality (File System Access API).

## Setup & Run

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Set Environment Variable**:
    Ensure your API key is available as `process.env.API_KEY` in the build environment.
3.  **Run the app**:
    ```bash
    npm start
    ```

## How to Use

1.  **Select Output Folder**:
    *   Click "Select Desktop Folder".
    *   Grant the browser permission to "View and Save changes" to the selected folder.
    *   *Note: If you skip this, images will just appear in the gallery for manual download.*
2.  **Configure Invitation**:
    *   **Event Type**: Choose from Wedding, Birthday, Corporate, etc.
    *   **Category**: Choose an aesthetic (e.g., "Modern & Minimalist").
    *   **Style**: Choose an artistic style (e.g., "Watercolor").
    *   **Color Scheme**: Select your palette.
3.  **Set Quantity**:
    *   Use the slider to select how many templates you want (e.g., 10).
4.  **Generate**:
    *   Click "Generate Batch".
    *   The app will process them one by one to ensure high quality and avoid API rate limits.
    *   Watch the gallery populate in real-time.
    *   If a folder was selected, files are automatically saved to your disk.
