# Forensic Analysis Platform

React Native and Expo mobile application for secure, role-based forensic signature analysis.

## Overview

The platform lets investigators and forensic experts manage cases, upload reference and suspected signatures, monitor analysis processing, and review results. It also includes user authentication, notifications, and an administration area for managing users and system activity.

## Requirements

- Node.js LTS
- npm or Yarn
- Android Studio and an Android emulator or device for native Android development
- An Expo account and the EAS CLI for cloud builds

The project currently uses Expo SDK 54, React Native 0.81, and TypeScript 5.9.

## Setup

Install dependencies:

```bash
npm install
```

Create a local `.env` file in the project root with the API configuration used by the app:

```env
EXPO_PUBLIC_AVERA_API_BASE_URL=https://your-api.example.com
EXPO_PUBLIC_AVERA_API_KEY=your-api-key
```

Do not commit `.env` or real credentials. Expo public variables are bundled into the client, so the API key must only be used for values that are safe to expose to the mobile application.

## Development

Start the Expo development server:

```bash
npm start
```

Run the native Android app:

```bash
npm run android
```

Run the web version or iOS version when the platform tooling is available:

```bash
npm run web
npm run ios
```

Run lint checks:

```bash
npm run lint
```

## EAS Builds

Authenticate with Expo and select the project before creating a build:

```bash
npx eas login
npx eas build:configure
```

Available build profiles are defined in `eas.json`:

```bash
# Development client
npx eas build --profile development --platform android

# Internal preview APK
npx eas build --profile preview --platform android

# Production build
npx eas build --profile production

# Internal ARM64 APK
npx eas build --profile apk-arm64 --platform android
```

## Technology Stack

- React Native, Expo, and TypeScript
- Expo Router for navigation
- Zustand for client-side state
- REST API services and SignalR notifications
- React Native Reanimated and Lucide icons for the interface

## Project Structure

- `src/app/` - Expo Router screens and layouts
- `src/_components/` - shared UI components
- `src/constants/` - API configuration, colors, roles, and typography
- `src/hooks/` - reusable React hooks
- `src/services/` - authentication, cases, analysis, and notifications
- `src/store/` - application state stores
- `assets/` and `images/` - static assets
- `android/` - generated and native Android project files

## Main Workflows

- Registration, login, email verification, and password recovery
- Role-based user and administrator dashboards
- Case creation, search, review, status updates, and history
- Signature upload, forensic processing, and result review
- In-app notifications through the backend notification hub
- Administrative user and system management

## Contributing

1. Create a feature branch.
2. Install dependencies and configure the local API environment.
3. Run `npm run lint` before opening a pull request.
4. Describe behavior changes and validation steps in the pull request.

Follow the existing TypeScript, Expo, and ESLint conventions. There is currently no `LICENSE` file in this repository.
