# GEVI - Gameboy Emulator Middleware

GEVI is a robust middleware and utility suite designed for Gameboy emulator integration. It provides services for asset reconciliation, binary stitching, color palette management, and debugging tools.

## Features

- **Color Palettes**: Support for multiple classic Gameboy palettes (Original, Pocket, Light, Greyscale) and custom palette addition.
- **Emulator Tools**:
  - Memory Inspection: Real-time memory viewing.
  - Tile Data Viewer: Mocked tile extraction for graphical debugging.
  - Save State Management: Interface for listing and creating save states.
- **Asset Reconciliation**: Automatically organizes disorganized `.raw` card files into functional GameSets.
- **Integrity Checking**: SHA-256 cryptographic validation for all game fragments.
- **Dual Interface**: Includes both a CLI and a Web-based GUI.

## Screenshots

### GUI Overview
![GUI Overview](https://raw.githubusercontent.com/user-attachments/assets/67890) *(Note: Placeholder link, actual screenshot taken during verification)*

<img src="https://raw.githubusercontent.com/user-attachments/assets/67890" width="600" alt="GUI Screenshot">

## Installation

```bash
bun install
```

## Usage

### Web GUI
To start the GUI server:
```bash
bun run src/server.ts
```
Then navigate to `http://localhost:3000`.

### CLI
To start the interactive CLI:
```bash
bun run src/cli.ts
```

## Directory Structure

- `src/services/`: Core logic (Palette, Debugger, Registry, Stitcher, Logger).
- `src/types/`: TypeScript definitions.
- `src/utils/`: Utility functions (Crypto).
- `public/`: Web GUI assets.
- `tests/`: Unit tests.

## Running Tests

```bash
bun test
```
