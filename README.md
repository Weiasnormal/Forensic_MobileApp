# Forensic

Expo Router mobile app for a forensic verification workflow. The current UI includes a secure login screen, an admin dashboard, and an investigator flow for selecting a subject and reviewing verification logs.

## Tech Stack

- Expo 54
- React Native 0.81
- Expo Router 6
- TypeScript

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm run start
```

3. Run on a target platform:

```bash
npm run android
npm run ios
npm run web
```

## Available Scripts

- `npm run start` - start the Expo development server
- `npm run android` - launch on Android
- `npm run ios` - launch on iOS
- `npm run web` - launch in a web browser
- `npm run lint` - run Expo linting

## Project Structure

- `src/app/_layout.tsx` - root stack layout
- `src/app/index.tsx` - app entry point
- `src/app/LogInPage.tsx` - landing login screen
- `src/app/Admin/admin_dashboard.tsx` - admin dashboard
- `src/app/User/user_dashboard.tsx` - investigator dashboard
- `src/app/User/target_user.tsx` - subject selection screen

## Screens

- Login flow with admin and investigator entry points
- Admin console with recent profiles and storage usage
- Investigator portal for document verification
- Subject search and baseline selection

## Notes

- The app uses route-based navigation through Expo Router.
- Some touch targets currently act as UI placeholders and can be wired to real navigation or backend logic later.
