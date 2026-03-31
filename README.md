<div align="center">

<img src="https://img.shields.io/badge/Platform-Android%20%7C%20iOS-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
<img src="https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge" />
<img src="https://img.shields.io/badge/Version-1.0.0-orange?style=for-the-badge" />

# 📦 ZipDrop

**Compress. Save. Share.**

ZipDrop is a fast, lightweight mobile application that lets you compress files into ZIP archives directly on your device — freeing up storage space, making files easier to share, and keeping your device clutter-free.

[Download on Android](#) · [Download on iOS](#) · [Report a Bug](../../issues) · [Request a Feature](../../issues)

---

</div>

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the App](#running-the-app)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Reference](#-api-reference)
- [Testing](#-testing)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)
- [Acknowledgements](#-acknowledgements)

---

## 🔍 About the Project

Mobile devices have become the primary storage medium for photos, videos, documents, and more — yet they come with limited internal storage. ZipDrop solves this by enabling users to compress one or more files into ZIP archives without ever leaving their phone.

Whether you're trying to free up space, bundle files for easy sharing, or organize your downloads, ZipDrop is built to be fast, intuitive, and reliable.

**Why ZipDrop?**
- Most ZIP tools require a desktop or are locked behind paywalls
- Sharing multiple files over messaging apps or email is cumbersome
- On-device compression reduces dependence on cloud storage
- Built mobile-first for a smooth, native-feeling experience

---

## ✨ Features

| Feature | Description |
|---|---|
| 📁 **Multi-file Selection** | Select one or multiple files at once from your device storage |
| 🗜️ **ZIP Compression** | Compress selected files into a single `.zip` archive |
| 💾 **Storage Savings** | Reduce file sizes and reclaim storage space on your device |
| 📤 **One-tap Sharing** | Share ZIP files instantly via WhatsApp, Gmail, Drive, and more |
| 🔒 **Password Protection** | Optionally lock ZIP archives with a password |
| 📂 **Custom Output Path** | Choose where your ZIP file is saved |
| 🌙 **Dark Mode Support** | Clean dark and light UI themes |
| 🌍 **Offline-first** | No internet connection required — everything runs on-device |
| 🔔 **Compression Progress** | Real-time progress bar during compression |
| 🗂️ **ZIP Preview** | Browse contents of a ZIP before extracting |
| 📦 **Batch Operations** | Queue multiple compression jobs |
| 🔄 **Unzip Support** | Extract contents from existing ZIP archives |

---

## 📱 Screenshots

> Screenshots will be added as the UI is finalized.

| Home Screen | File Selection | Compression | Share Sheet |
|---|---|---|---|
| _(coming soon)_ | _(coming soon)_ | _(coming soon)_ | _(coming soon)_ |

---

## 🛠️ Tech Stack

### Core

| Layer | Technology |
|---|---|
| **Framework** | [React Native](https://reactnative.dev/) / [Expo](https://expo.dev/) |
| **Language** | TypeScript |
| **Compression** | [JSZip](https://stuk.github.io/jszip/) / `react-native-zip-archive` |
| **File Access** | `expo-file-system`, `expo-document-picker` |
| **Sharing** | `expo-sharing` |
| **State Management** | Zustand |
| **Navigation** | React Navigation v6 |

### Development & Tooling

| Tool | Purpose |
|---|---|
| ESLint + Prettier | Code formatting & linting |
| Jest | Unit testing |
| Detox | End-to-end testing |
| GitHub Actions | CI/CD pipeline |
| Fastlane | Automated app store deployment |

---

## 🚀 Getting Started

### Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** >= 18.x — [Download](https://nodejs.org)
- **npm** >= 9.x or **yarn** >= 1.22.x
- **Expo CLI** — Install globally:
  ```bash
  npm install -g expo-cli
  ```
- **Android Studio** (for Android development) — [Download](https://developer.android.com/studio)
- **Xcode** >= 14 (for iOS development, macOS only) — [App Store](https://apps.apple.com/us/app/xcode/id497799835)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ZipDrop.git
   cd ZipDrop
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Copy environment variables**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with any required keys (see [Configuration](#-configuration)).

### Running the App

**Start the Expo development server:**
```bash
npx expo start
```

**Run on Android:**
```bash
npx expo run:android
```

**Run on iOS (macOS only):**
```bash
npx expo run:ios
```

**Run in browser (limited features):**
```bash
npx expo start --web
```

---

## 📂 Project Structure

```
ZipDrop/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml               # GitHub Actions CI pipeline
│   │   └── release.yml          # Release automation
│   └── ISSUE_TEMPLATE/
├── android/                     # Android native files
├── ios/                         # iOS native files
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── FileCard.tsx
│   │   ├── ProgressBar.tsx
│   │   └── ZipPreview.tsx
│   ├── screens/                 # App screens
│   │   ├── HomeScreen.tsx
│   │   ├── SelectFilesScreen.tsx
│   │   ├── CompressionScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/                # Business logic
│   │   ├── compression.ts       # Core ZIP logic
│   │   ├── fileSystem.ts        # File system operations
│   │   └── sharing.ts           # Share sheet integration
│   ├── store/                   # Zustand state management
│   │   └── useAppStore.ts
│   ├── utils/                   # Helper functions
│   │   ├── formatBytes.ts
│   │   └── generateFilename.ts
│   ├── hooks/                   # Custom React hooks
│   ├── types/                   # TypeScript type definitions
│   ├── constants/               # App-wide constants
│   └── theme/                   # Colors, fonts, spacing
├── tests/
│   ├── unit/
│   └── e2e/
├── docs/
│   └── architecture.md
├── assets/
│   ├── icons/
│   └── images/
├── app.json                     # Expo config
├── babel.config.js
├── tsconfig.json
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

---

## ⚙️ Configuration

Create a `.env` file at the root of the project based on `.env.example`:

```env
# App
APP_ENV=development                  # development | staging | production
APP_VERSION=1.0.0

# Feature Flags
ENABLE_PASSWORD_ZIP=true             # Enable password-protected ZIP
ENABLE_BATCH_COMPRESSION=true        # Enable queuing multiple jobs
MAX_FILE_SIZE_MB=500                 # Max individual file size (in MB)

# Analytics (optional)
ANALYTICS_ENABLED=false
ANALYTICS_KEY=your_key_here
```

> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.

---

## 📖 Usage

### Compressing Files

1. Open **ZipDrop** on your device
2. Tap **"Select Files"** and choose one or more files from your storage
3. (Optional) Enter a name for your output ZIP file
4. (Optional) Set a password for the archive
5. Tap **"Compress"** and wait for the progress bar to complete
6. Your ZIP file is saved to your selected output folder

### Extracting Files

1. Open **ZipDrop** and tap **"Open ZIP"**
2. Browse to your `.zip` file and select it
3. Preview the contents and tap **"Extract"**
4. Choose a destination folder

### Sharing a ZIP

After compression is complete, tap the **Share** button to send your ZIP via any installed app (WhatsApp, Gmail, Google Drive, Dropbox, etc.).

---

## 🔌 API Reference

ZipDrop's core compression service exposes the following interface:

```typescript
import { compressFiles } from '@/services/compression';

// Compress an array of file URIs into a ZIP archive
const result = await compressFiles({
  files: ['file:///storage/file1.pdf', 'file:///storage/image.png'],
  outputPath: 'file:///storage/emulated/0/Downloads/',
  outputName: 'my-archive',        // Output: my-archive.zip
  password: 'optional-password',   // Optional
  onProgress: (percent) => {
    console.log(`${percent}% complete`);
  },
});

// Result
// {
//   success: boolean,
//   zipPath: string,
//   originalSize: number,   // bytes
//   compressedSize: number, // bytes
//   savedPercent: number    // e.g. 42 (means 42% smaller)
// }
```

---

## 🧪 Testing

**Run unit tests:**
```bash
npm run test
```

**Run with coverage:**
```bash
npm run test:coverage
```

**Run end-to-end tests (Detox):**
```bash
# Build first
npx detox build --configuration android.emu.debug

# Then run
npx detox test --configuration android.emu.debug
```

---

## 🗺️ Roadmap

- [x] Core ZIP compression
- [x] File picker integration
- [x] Share sheet support
- [x] Dark mode
- [ ] Password-protected ZIPs
- [ ] Batch compression queue
- [ ] Cloud storage integration (Google Drive, Dropbox)
- [ ] Auto-compression schedules
- [ ] Widget for quick access
- [ ] ZIP file manager / browser
- [ ] Support for `.tar.gz` and `.7z` formats
- [ ] Localization (multi-language support)
- [ ] iPad / tablet layout optimization

See the [open issues](../../issues) for the full list of proposed features and known bugs.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, build, and grow. Any contributions you make are **greatly appreciated**.

### How to Contribute

1. **Fork** the repository
2. **Create** your feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
4. **Push** to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Description |
|---|---|
| `feat:` | A new feature |
| `fix:` | A bug fix |
| `docs:` | Documentation changes |
| `style:` | Formatting (no code logic change) |
| `refactor:` | Code restructuring |
| `test:` | Adding or updating tests |
| `chore:` | Build process or tooling changes |

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for full details on our code of conduct and pull request process.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

## 📬 Contact

**Project Maintainer** — [@your-username](https://github.com/your-username)

**Project Link** — [https://github.com/your-username/ZipDrop](https://github.com/your-username/ZipDrop)

**Report Issues** — [https://github.com/your-username/ZipDrop/issues](https://github.com/your-username/ZipDrop/issues)

---

## 🙏 Acknowledgements

- [JSZip](https://stuk.github.io/jszip/) — ZIP file creation in JavaScript
- [react-native-zip-archive](https://github.com/mockingbot/react-native-zip-archive) — Native ZIP support
- [Expo](https://expo.dev/) — React Native tooling and SDK
- [React Navigation](https://reactnavigation.org/) — Navigation library
- [Shields.io](https://shields.io/) — Readme badges
- [Choose a License](https://choosealicense.com/) — License guidance

---

<div align="center">

Made with ❤️ by the ZipDrop team

⭐ Star this repo if you find it useful!

</div>
