# OperaVoce — Opera Singer Training App

A cross-platform mobile application built with Expo (React Native) that helps aspiring and intermediate opera singers develop their vocal technique through structured training programs, a practice calendar, and smart reminders.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- [EAS CLI](https://docs.expo.dev/build/setup/) (`npm install -g eas-cli`)
- An [Expo account](https://expo.dev/signup)
- A [Supabase](https://supabase.com/) project

## Service Setup

### 1. Supabase Project

1. Create a new project at [supabase.com](https://supabase.com/dashboard).
2. Note your **Project URL** and **Anon (public) key** from Settings → API.
3. Run the database migration to create all tables:
   - Navigate to the SQL Editor in your Supabase dashboard.
   - Paste and execute the contents of `supabase/migrations/00001_initial_schema.sql`.
4. Enable **Google** as an auth provider under Authentication → Providers (see step 3 below).
5. Create two Storage buckets:
   - `audio-files` — set to **public** (for reference recordings)
   - `user-avatars` — set to **private**
6. Deploy the Edge Functions (see step 6 below).

### 2. Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description | Where to find it |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public API key | Supabase Dashboard → Settings → API |

### 3. Google OAuth (Sign-In)

OperaVoce uses Google Sign-In via Supabase Auth.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or use an existing one).
3. Navigate to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**.
4. Create credentials for each platform:
   - **iOS**: set the bundle ID to `com.operavoce.app`
   - **Android**: set the package name to `com.operavoce.app` and provide your SHA-1 signing certificate fingerprint
   - **Web**: add `https://<your-project>.supabase.co/auth/v1/callback` as an authorized redirect URI
5. In your Supabase dashboard, go to **Authentication → Providers → Google** and enter your Google Client ID and Client Secret.

### 4. Expo Push Notifications

Push notifications are sent through the [Expo Push API](https://docs.expo.dev/push-notifications/overview/), which wraps both APNs (iOS) and FCM (Android).

**For Android (FCM):**
1. In the [Firebase Console](https://console.firebase.google.com/), create a project (or link your existing Google Cloud project).
2. Add an Android app with package name `com.operavoce.app`.
3. Download `google-services.json` and place it in the project root.
4. In EAS, upload your FCM Server Key: `eas credentials` → Android → Push Notifications.

**For iOS (APNs):**
1. In your [Apple Developer account](https://developer.apple.com/), create an APNs key (Keys → + → Apple Push Notifications service).
2. Download the `.p8` key file and note the Key ID and Team ID.
3. Upload the APNs key to Expo: `eas credentials` → iOS → Push Notifications.

### 5. EAS Build Configuration

1. Log in to EAS:
   ```bash
   eas login
   ```
2. Link your project:
   ```bash
   eas init
   ```
   This will set the `extra.eas.projectId` in `app.json` automatically.
3. Configure credentials for each platform:
   ```bash
   eas credentials
   ```

### 6. Supabase Edge Functions

Deploy all Edge Functions from the `supabase/functions/` directory:

```bash
npx supabase functions deploy on-user-created
npx supabase functions deploy generate-schedule
npx supabase functions deploy calculate-streak
npx supabase functions deploy send-push-notification
npx supabase functions deploy weekly-summary
npx supabase functions deploy smart-reminders
npx supabase functions deploy validate-subscription
```

Set the required secrets for Edge Functions:

```bash
npx supabase secrets set APPLE_SHARED_SECRET=<your-apple-shared-secret>
```

> `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically available to Edge Functions.

**Edge Function environment variables:**

| Secret | Description | Where to find it |
|---|---|---|
| `SUPABASE_URL` | Auto-injected by Supabase | — |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-injected by Supabase | — |
| `APPLE_SHARED_SECRET` | For App Store receipt validation | App Store Connect → My Apps → your app → In-App Purchases → App-Specific Shared Secret |

**Scheduling (cron triggers):**

Set up pg_cron jobs in Supabase SQL Editor for server-driven notifications:

```sql
-- Send push notifications every 15 minutes
select cron.schedule('send-push-notifications', '*/15 * * * *',
  $$ select net.http_post(url := '<SUPABASE_URL>/functions/v1/send-push-notification', headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>"}') $$
);

-- Weekly summary every Sunday at 10:00 UTC
select cron.schedule('weekly-summary', '0 10 * * 0',
  $$ select net.http_post(url := '<SUPABASE_URL>/functions/v1/weekly-summary', headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>"}') $$
);

-- Smart reminders daily at 20:00 UTC
select cron.schedule('smart-reminders', '0 20 * * *',
  $$ select net.http_post(url := '<SUPABASE_URL>/functions/v1/smart-reminders', headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>"}') $$
);
```

### 7. Apple-Specific Setup (iOS)

The following capabilities must be enabled in your Apple Developer account for the App ID `com.operavoce.app`:

| Capability | Purpose |
|---|---|
| **Push Notifications** | Daily reminders, streak alerts, weekly summaries |
| **HealthKit** | Log practice sessions as "mindful minutes" |
| **Sign In with Apple** | Optional (currently Google-only, but Apple may require it for App Store approval) |

These permissions are declared in `app.json` under `ios.infoPlist`:

- `NSCalendarsUsageDescription` — calendar sync
- `NSHealthShareUsageDescription` — read HealthKit data
- `NSHealthUpdateUsageDescription` — write mindful minutes to HealthKit
- `NSMicrophoneUsageDescription` — voice exercises (future)

### 8. Android-Specific Setup

The following permissions are declared in `app.json` under `android.permissions`:

- `SCHEDULE_EXACT_ALARM` — scheduling notification reminders
- `READ_CALENDAR` / `WRITE_CALENDAR` — device calendar sync

Android Health Connect integration requires that [Health Connect](https://developer.android.com/health-and-fitness/guides/health-connect) is installed on the device.

### 9. In-App Purchases (Monetization)

To enable Premium and Lifetime subscriptions:

**App Store (iOS):**
1. Configure subscription products in App Store Connect.
2. Generate an App-Specific Shared Secret (used by `validate-subscription` Edge Function).

**Google Play (Android):**
1. Configure subscription products in the Google Play Console.
2. Set up a service account with access to the Google Play Developer API for server-side receipt validation.

## Running the App

```bash
# Install dependencies
npm install

# Start the development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android
```

## Building for Release

```bash
# Development build (internal testing)
eas build --profile development --platform all

# Preview build (internal distribution)
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## Project Structure

```
operavoce/
├── app/                    # Expo Router screens
│   ├── (onboarding)/       # Onboarding flow (7 screens)
│   ├── (tabs)/             # Main app (Home, Programs, Calendar, Progress, Profile)
│   └── session/            # Deep-link target for notifications
├── src/
│   ├── lib/                # Supabase client, SQLite database, constants
│   ├── stores/             # Zustand state stores
│   ├── hooks/              # React Query hooks and custom hooks
│   ├── services/           # Data access and business logic
│   ├── components/         # Reusable UI components
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
└── supabase/
    ├── migrations/         # PostgreSQL schema (with RLS)
    └── functions/          # 7 Deno Edge Functions
```
