# Forensic Analysis Platform

React Native + Expo mobile app for  signature forensic analysis.

## Overview

Forensic Analysis Platform enables investigators and forensic experts to upload, process, and review  signature analyses within a secure, role-based mobile app. The app includes case management, an admin dashboard, and workflows for both  signature authentication.

## Quick Start

Prerequisites:
- Node.js (LTS) or newer
- Yarn or npm
- Expo CLI (`npm install -g expo-cli`) or use `npx expo`

Install dependencies:

```
yarn install
# or
npm install
```

Run the app (development):

```
yarn start
# or
npm start
```

Run on Android emulator or device:

```
yarn android
# or with expo
npx expo run:android
```

Build for distribution (EAS):

```

# see `eas.json` for build profiles
```

## Technology Stack

- Frontend: React Native + Expo + TypeScript
- Navigation: Expo Router with tabbed navigation
- State: local stores (see `store/`)
- Backend: REST API clients in `constants/` and `services/`

## Project Structure (high level)

- `app/` — Expo Router screens and layout
- `src/_components/` — shared UI components (buttons, cards, headers)
- `src/constants/` — API clients, colors, roles, typography
- `src/hooks/` — custom hooks
- `src/services/` — backend interaction and analysis services
- `src/store/` — application stores (user, cases, analysis flow)
- `assets/` — images and static assets

For details, see the `src` tree in the repository.

## Features

- User registration, login, password recovery
- Role-based dashboard (user and admin)
- Handwriting analysis workflow: upload → process → results
- Signature authentication workflow with processing stages
- Case management and case detail history
- Admin tools for user and system management

## Contributing

1. Fork the repo and create a feature branch
2. Implement changes and add tests where appropriate
3. Open a pull request describing your changes

Please follow existing TypeScript and linting conventions.

## Notes for Developers

- App config: `app.config.js` and `app.json`
- Android-specific files: `android/` (native build)
- EAS build profiles are in `eas.json`

If you want, I can also add a short development checklist or example env variables.

## License & Contact

This project does not include a license file. Add a `LICENSE` file if you plan to open-source the repository.

For questions or help, open an issue in this repository.
3. Monitor system activity and usage statistics
