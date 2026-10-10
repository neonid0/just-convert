# Just Convert

A local-first desktop file manager and file converter for Windows 10 and 11 x64, macOS 11+, and Linux.

Licensed under your choice of the [MIT or Apache 2.0 license](LICENSE).

## Features

### File Conversion

- **Audio** — Convert between MP3, WAV, FLAC, AAC, M4A, and OGG (single file or folder batch)
- **Images to PDF** — Combine JPG, PNG, WebP, and TIFF images into a single PDF or one PDF per image
- **PDF to Images** — Render PDF pages to PNG or JPEG at normal (150 DPI) or high (300 DPI) quality
- **PDF Tools** — Merge, split, reorder, and rotate PDF pages
- **Office to PDF** — Convert DOCX, XLSX, and PPTX files via detected LibreOffice (single file or folder batch)
- **PDF to Word** — Best-effort DOCX conversion for digitally generated PDFs via detected Python + PyMuPDF (single file or folder batch)

### File Management

- Browse local folders with list view, sorting, and filtering
- Copy, move, rename, create folders, and move files to trash
- Permanent deletion with explicit confirmation

### Privacy & Safety

- Fully local — no uploads, no network requests, no telemetry
- Originals are never modified; all outputs are staged and validated before saving
- Output filename collisions resolved automatically with incrementing suffixes

### Job Queue

- Persistent single-worker queue with cancellation support
- Active, Failed & Cancelled, and Completed sections with collapsible history
- Failure entries show the reason (missing dependency, unsupported file, etc.)

### Dependencies & Settings

- Every engine is bundled (FFmpeg, qpdf, PDFium, LibreOffice, and the PDF-to-Word worker), so nothing else needs to be installed
- Engines can be overridden manually in Settings
- English and Turkish interface
- Light, dark, and system themes

## Screenshots

![Convert Dashboard](docs/screenshots/dashboard.png)
![Job History](docs/screenshots/jobs.png)
![Settings & Dependencies](docs/screenshots/settings.png)

## Dependencies

Nothing. Every converter works right after installation, offline, on Windows, macOS, and Linux. FFmpeg, qpdf, PDFium, LibreOffice, and a self-contained PDF-to-Word worker (Python, PyMuPDF, and pdf2docx) ship inside the app. A different LibreOffice or Python can still be selected in Settings.

## macOS and Linux

macOS builds are `.app`/`.dmg` and Linux builds are `.deb`/AppImage, roughly 450–600 MB because LibreOffice is included. These builds are unsigned too, so macOS Gatekeeper warns on first launch. See [ADR-013](docs/architecture/ADR-013-macos-and-linux.md).

## Windows v1 Distribution

Windows v1 is distributed only as an NSIS installer. MSI/WiX packaging is deferred to a later release.

The v1 executable and installer are unsigned. Windows SmartScreen may therefore display an "unrecognized app" or "unknown publisher" warning, especially on newly published downloads without an established reputation. Download releases only from the project's official repository and verify the published SHA-256 checksum before running the installer. Code signing is intentionally deferred for v1 because trusted certificates and signing infrastructure add recurring cost and release-process complexity.

## Third-Party Components

This application bundles FFmpeg under GPL v3, qpdf, PDFium, and other third-party components for selected conversion features. Each component remains subject to its own license and redistribution terms; see [Third-Party Licenses](docs/licenses/THIRD_PARTY_LICENSES.md) for versions, sources, checksums, attribution, and full license references.

PDF-to-Word uses a separately installed Python runtime with PyMuPDF (AGPL v3 or commercial) and pdf2docx; none of these dependencies is included in the installer, distributed by the project, or linked into the Rust core. The project treats these as optional external subprocess dependencies, like LibreOffice, as detailed in the third-party license record.

## Development

Built with Tauri 2, Rust, React, TypeScript, and pnpm.

- Install dependencies: `pnpm install`
- Fetch the engines for your platform (needs [uv](https://docs.astral.sh/uv/) to build the PDF-to-Word worker): `pnpm fetch:engines`. On Linux, also install the [Tauri system dependencies](https://tauri.app/start/prerequisites/#linux).
- Build installers: `pnpm tauri build` on Windows, `pnpm bundle:macos` on macOS, `pnpm bundle:linux` on Linux
- Run the browser UI: `pnpm dev`
- Run the desktop application: `pnpm tauri dev`
- Run the complete quality gate: `pnpm check`

## Continuous Integration and Releases

- **Quality** (`quality.yml`): `pnpm check` on Windows, macOS, and Ubuntu for every push and pull request.
- **Engines** (`engines.yml`): checks that every pinned engine download is still available, then fetches the engines and runs the full engine test suite on all three platforms. Runs weekly and on pull requests that touch engines.
- **Release** (`release.yml`): pushing a `v<version>` tag that matches the app version builds the Windows, macOS (Apple silicon and Intel), and Linux (x64 and arm64) installers, tests every bundled engine on each platform, and publishes them with `SHA256SUMS` as a draft GitHub release. Running it manually builds the installers as workflow artifacts without publishing.

## Post-v1 Roadmap

Optional Tesseract OCR for scanned PDFs and parallel queue execution are deferred until after the Windows v1 release.

Architectural decisions are recorded in [`docs/architecture/`](docs/architecture/README.md). Conversion engines must remain behind typed Rust adapters and may not be launched directly by frontend code.
