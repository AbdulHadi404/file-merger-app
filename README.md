# File Merger App

## Overview

**File Merger App** is a modern React + Chakra UI application for combining multiple files with advanced customization and filtering. The app now features a redesigned interface, improved accessibility, and robust settings for power users.

## Features

- **Drag & Drop File Upload:** Easily add files using a drag-and-drop zone or file browser.
- **Advanced Settings Modal:** Configure file types, add custom types, set exclusion rules, and tweak processing options.
- **Custom File Types:** Add support for any file extension and MIME type.
- **Exclusion Rules:** Exclude files by pattern (wildcards supported, e.g. `*.test.*`).
- **Processing Options:**
  - Include file names and timestamps in output.
  - Enable preprocessing to clean up whitespace and normalize line endings.
- **Live Editor:** View, edit, and copy the combined content.
- **Persistent Settings:** All preferences are saved automatically and persist across sessions.
- **Responsive Design:** Works great on desktop and mobile.
- **Accessible & Themed UI:** Uses Chakra UI v3 with visible teal and white buttons, improved contrast, and clear feedback.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run the app:**
   ```bash
   npm start
   ```
3. **Open in browser:**  
   Visit [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal).

## Usage

- **Upload Files:** Drag files into the drop zone or click to select.
- **Configure Settings:** Click the "Settings" button (top right) to open the advanced modal.
  - **File Types:** Enable/disable built-in file types.
  - **Custom Types:** Add or remove your own file extensions and MIME types.
  - **Exclusion Rules:** Add patterns to exclude files from merging.
  - **Processing Options:** Toggle file name/timestamp inclusion and preprocessing.
- **Edit & Copy:** Review and edit the merged content, then copy all with one click.

## Technologies

- **React**
- **Chakra UI v3**
- **TypeScript**
- **react-dropzone**
- **react-hot-toast**

_This app is built for productivity, with advanced filtering and customization for developers and content creators._
