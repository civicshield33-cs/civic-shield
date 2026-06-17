# Civic Shield Gambia — Product Roadmap

> **Vision:** A national emergency and community safety platform for The Gambia — not just an SOS button.
>
> **Concept reference:** [`Refined Concept_ Civic Shield Gambia.pdf`](./Refined%20Concept_%20Civic%20Shield%20Gambia.pdf)

**Last updated:** June 2026  
**Repo:** [civicshield33-cs/civic-shield](https://github.com/civicshield33-cs/civic-shield)  
**Live (web):** https://civic-shield.pages.dev

---

## How to use this roadmap

| Symbol | Meaning |
|--------|---------|
| `[x]` | Done |
| `[~]` | Partial / UI only / needs backend |
| `[ ]` | Not started |
| **P0** | Blocker — do first |
| **P1** | High priority |
| **P2** | Medium priority |
| **P3** | Future / nice-to-have |

Update checkboxes as tasks ship. Link PRs/commits next to tasks when possible.

---

## Current baseline (shipped)

What exists today in the codebase:

- [x] Welcome / splash screen (`WelcomeScreen`)
- [x] Registration with validation (`RegisterScreen`)
- [x] Login with local auth (`LoginScreen`, `src/utils/auth.ts`)
- [x] Home dashboard with SOS + quick actions (`HomeScreen`)
- [x] Hold-to-activate SOS UI (`HoldSOSScreen`) — 3s hold, GPS fetch started
- [x] Emergency + tracking screens (`EmergencyScreen`, `TrackingScreen`)
- [x] Emergency contacts CRUD (`ContactsScreen`, `contactStore`)
- [x] Community alerts UI (`CommunityAlertsScreen`)
- [x] Incident reporting UI (`ReportIncidentScreen` + type-specific screens)
- [x] Missing person report UI (`MissingPersonScreen`)
- [x] Safe Walk UI (`SafeWalkScreen`)
- [x] Command center dashboard UI (`CommandCenterDashboard`, `LiveMapScreen`, `IncidentFeedScreen`)
- [x] Settings screen (`SettingsScreen`)
- [x] Web deploy via Cloudflare Pages + GitHub
- [x] Firebase services layer (`src/services/firebase.ts`, env-driven)
- [x] Dual mode: Firebase when configured, AsyncStorage fallback locally
- [x] Auth via `authService` (local + optional Firebase Auth)

---

## Phase 0 — Foundation & polish

**Goal:** Stable app shell, auth, deploy pipeline, and UI consistency before backend work.

| ID | Task | Priority | Status | Notes / files |
|----|------|----------|--------|----------------|
| P0-001 | Fix Expo scripts for macOS (`node …/expo/bin/cli`) | P0 | [x] | `package.json` |
| P0-002 | Cloudflare Pages deploy from `main` branch | P0 | [x] | Set production branch to `main` in CF dashboard |
| P0-003 | Cache headers for fresh web deploys | P0 | [x] | `public/_headers` |
| P0-004 | Web-compatible alerts (no silent `Alert.alert`) | P0 | [x] | `src/utils/alert.ts` |
| P0-005 | Modern register / login screens | P1 | [x] | `RegisterScreen`, `LoginScreen` |
| P0-006 | Remove back button on Create Account | P1 | [x] | `RegisterScreen` |
| P0-007 | Sign up & sign in → Home | P1 | [x] | `RegisterScreen`, `LoginScreen` |
| P0-008 | Polish Home dashboard (icons, status card, user name) | P1 | [x] | `HomeScreen`, `EmergencyStatusCard` |
| P0-009 | Rename quick actions to match concept | P2 | [x] | My Contacts, Live Location, Incident Report, Safety Alerts |
| P0-010 | Home status colors: green / orange / red | P2 | [x] | SAFE ✓ / Setup / Emergency states |
| P0-011 | Shared bottom tab navigator (replace per-screen nav) | P2 | [x] | `MainTabNavigator`, `AppTabBar` |
| P0-012 | Load user profile on Home from `APP_USER` everywhere | P2 | [x] | `useUserProfile` hook |

**Exit criteria:** App deploys reliably; auth works on web; Home matches concept layout labels. ✅ Complete

---

## Phase 1 — Real SOS & emergency response

**Goal:** When SOS fires, location, contacts, and evidence flow work end-to-end.

| ID | Task | Priority | Status | Notes / files |
|----|------|----------|--------|----------------|
| P1-001 | Set up Firebase project (Auth, Realtime DB or Firestore, Storage) | P0 | [x] | `civic-shield-1cfc4`, `.env`, Cloudflare env vars |
| P1-002 | Move user accounts to Firebase Auth (phone or email) | P0 | [x] | `authService.ts` — phone→email auth + local fallback |
| P1-003 | Sync emergency contacts to cloud per user | P0 | [x] | `contactService`, `contactStore` |
| P1-004 | SOS countdown: 15 seconds with cancel (per concept) | P0 | [x] | `EmergencyScreen` — 15s cancel countdown |
| P1-005 | Emergency activated screen: step-by-step status | P1 | [x] | `EmergencyScreen` — status steps + evidence |
| P1-006 | Continuous GPS tracking during active SOS | P0 | [x] | `TrackingScreen`, `sosService` location trail |
| P1-007 | Write SOS events to Firebase (`sos_alerts` collection) | P0 | [x] | `sosService.ts` — Firestore + local |
| P1-008 | SMS / WhatsApp alert to emergency contacts with live link | P0 | [x] | `sosService.notifyEmergencyContacts`, Share API |
| P1-009 | Start audio recording on SOS activation | P1 | [x] | `evidenceService.ts`, `EmergencyScreen` |
| P1-010 | Optional front-camera snapshot on SOS | P2 | [ ] | `expo-image-picker` / `expo-camera` |
| P1-011 | Upload evidence to Firebase Storage | P1 | [x] | `evidenceService.ts` — audio upload when Firebase set |
| P1-012 | Live tracking screen with real map + contact/police status | P0 | [x] | `TrackingScreen` — GPS watch + polyline |
| P1-013 | Share live tracking URL (`?track=incidentId`) | P1 | [x] | `PublicTrackScreen`, `App.tsx` query param |
| P1-014 | Vibration + haptic feedback on SOS trigger | P2 | [x] | `EmergencyScreen`, `HoldSOSScreen` |

**Exit criteria:** User triggers SOS → contacts notified → live map updates → evidence stored in cloud.

---

## Phase 2 — Reports, alerts & community safety

**Goal:** Citizens can report incidents and receive community safety information.

| ID | Task | Priority | Status | Notes / files |
|----|------|----------|--------|----------------|
| P2-001 | Incident report schema in Firebase | P0 | [x] | `types/emergency.ts`, `incidentService.ts` |
| P2-002 | Submit reports from `ReportIncidentScreen` to backend | P0 | [x] | Wired to `submitIncidentReport` + GPS |
| P2-003 | Photo upload on incident reports | P1 | [x] | `incidentService.uploadImageAsync` |
| P2-004 | GPS auto-tag on reports | P1 | [x] | `expo-location` on submit |
| P2-005 | Community alerts feed from Firebase | P0 | [x] | `CommunityAlertsScreen` — `subscribeCommunityAlerts` |
| P2-006 | Alert types: accident, flood, crime, fire | P1 | [x] | Seed + report-derived alerts |
| P2-007 | Push notifications for nearby alerts | P1 | [ ] | `expo-notifications` + FCM |
| P2-008 | Missing persons module — submit to backend | P1 | [x] | `MissingPersonScreen` → `submitMissingPersonReport` |
| P2-009 | Missing persons public feed / search | P2 | [ ] | Optional admin approval workflow |
| P2-010 | Safe Walk: start journey + share link with contacts | P0 | [x] | `SafeWalkScreen`, `safeWalkService` |
| P2-011 | Safe Walk: “Track me until I reach home” destination | P1 | [~] | Destination field; geofence arrival TBD |
| P2-012 | Safe Walk: auto-SOS if journey deviates or timer expires | P2 | [ ] | Safety escalation |

**Exit criteria:** Reports and alerts persist in cloud; Safe Walk shares live journey.

---

## Phase 3 — Silent & voice emergency activation

**Goal:** Multiple activation methods from the concept doc (Levels 1–2).

| ID | Task | Priority | Status | Notes / files |
|----|------|----------|--------|----------------|
| P3-001 | Settings: configure secret PIN for silent SOS | P1 | [x] | `SettingsScreen`, `settingsService` |
| P3-002 | Hidden emergency button (disguised UI element) | P1 | [x] | Home weather widget + 5-tap greeting |
| P3-003 | Shake phone to trigger (3 shakes) | P1 | [x] | `expo-sensors`, `useSafetyTriggers` |
| P3-004 | Power button press pattern (5 presses) — native module | P2 | [~] | Toggle in Settings; native module TBD |
| P3-005 | Voice phrase: “Help Me Now” / “Red Alert” | P1 | [x] | Web Speech API in `useVoiceTrigger` |
| P3-006 | User-defined custom voice phrase in Settings | P2 | [x] | `SettingsScreen` voice phrase editor |
| P3-007 | Silent mode: no screen flash / discreet notification | P1 | [x] | `EmergencyScreen` silent UI |
| P3-008 | Women's Safety Mode preset (silent + evidence) | P2 | [x] | Settings toggle |

**Exit criteria:** At least two silent triggers + one voice trigger work on mobile.

---

## Phase 4 — Command center (government dashboard)

**Goal:** Police, fire, ambulance, and disaster agencies see and manage live incidents.

| ID | Task | Priority | Status | Notes / files |
|----|------|----------|--------|----------------|
| P4-001 | Operator role auth (admin vs citizen) | P0 | [x] | `OperatorLoginScreen`, PIN via env |
| P4-002 | Real-time incident feed from `sos_alerts` + reports | P0 | [x] | `commandCenterService`, `IncidentFeedScreen` |
| P4-003 | Severity colors: red / orange / yellow / green | P0 | [x] | Feed, map, dashboard |
| P4-004 | Live map with incident pins | P0 | [x] | `LiveMapScreen` — real incident markers |
| P4-005 | Assign incident to unit / change status | P1 | [x] | `IncidentDetailScreen`, `assignIncidentToUnit` |
| P4-006 | ETA display for responding units | P2 | [x] | ETA on assign + `UnitsStatusScreen` |
| P4-007 | Operator notifications on new critical incidents | P1 | [~] | Live feed; push TBD |
| P4-008 | Incident detail: evidence playback (audio, photos, GPS trail) | P1 | [x] | `IncidentDetailScreen` |
| P4-009 | Audit log for government actions | P2 | [x] | `commandCenterService.appendAuditLog` |
| P4-010 | Separate web-only admin app or `/admin` route | P2 | [x] | `?admin=1`, `AdminWebNavigator` |

**Exit criteria:** Operators see live SOS + reports on map; can update status and resolve incidents.

---

## Phase 5 — Gambia-specific features

**Goal:** Features tailored to local needs (rainy season, tourism, community scale).

| ID | Task | Priority | Status | Notes / files |
|----|------|----------|--------|----------------|
| P5-001 | Flood & disaster alerts module | P0 | [x] | `FloodAlertsScreen`, `gambiaService` |
| P5-002 | Integration with National Disaster Management Agency data | P2 | [~] | Manual publish via flood alerts; API TBD |
| P5-003 | Tourist Safety Mode | P1 | [x] | `TouristSafetyScreen` |
| P5-004 | Emergency translation assistance (basic phrases) | P2 | [x] | `EmergencyPhrasesScreen` |
| P5-005 | Region-based community alerts (Banjul, West Coast, etc.) | P1 | [x] | `filterAlertsByRegion`, flood tabs |
| P5-006 | Offline SOS queue when no network | P1 | [x] | `offlineQueueService` |
| P5-007 | Low-bandwidth mode for rural areas | P2 | [x] | Settings toggle |
| P5-008 | Public education onboarding (how SOS works) | P2 | [x] | `OnboardingScreen` |

**Exit criteria:** Flood alerts live; tourist mode register flow works.

---

## Phase 6 — AI, scale & sustainability

**Goal:** Future differentiators and business model from the concept doc.

| ID | Task | Priority | Status | Notes / files |
|----|------|----------|--------|----------------|
| P6-001 | AI risk detection: screaming, gunshots, impact | P3 | [ ] | On-device or cloud ML |
| P6-002 | “Are you safe?” prompt + 15s auto-activate | P3 | [ ] | After AI detection |
| P6-003 | Native iOS + Android store builds (EAS) | P1 | [ ] | `eas.json`, app signing |
| P6-004 | Government subscription / agency onboarding | P3 | [ ] | Business model |
| P6-005 | NGO partnership portal | P3 | [ ] | |
| P6-006 | Premium personal plan (extended storage, family tracking) | P3 | [ ] | |
| P6-007 | Analytics dashboard (response times, coverage) | P2 | [ ] | For government reporting |
| P6-008 | Security review + penetration test | P1 | [ ] | Before national rollout |

**Exit criteria:** Production mobile apps in stores; pilot with one government agency.

---

## Suggested sprint order (next 4 weeks)

### Week 1 — Phase 0 finish + Firebase setup
- P0-009, P0-010, P0-011
- P1-001, P1-002

### Week 2 — Core SOS backend
- P1-004, P1-006, P1-007, P1-008, P1-012

### Week 3 — Reports & alerts
- P2-001, P2-002, P2-005, P2-010

### Week 4 — Command center MVP
- P4-001, P4-002, P4-003, P4-004

---

## Technical debt & known issues

| Issue | Impact | Fix |
|-------|--------|-----|
| Auth is local-only (`AsyncStorage`) | No cross-device login | Phase 1 → Firebase Auth |
| `react-native-maps` web stub | No real map on web | Leaflet web map or map provider |
| `master` vs `main` branch history | Stale deploys if wrong branch | Production branch = `main` |
| Emoji / mixed icons on some screens | Inconsistent UI | Ionicons everywhere |
| No shared tab navigation | Duplicated bottom nav | Phase 0-011 |
| Firebase keys in `firebaseConfig.ts` | Placeholder values | Env vars + Firebase console |

---

## File map (quick reference)

| Area | Key files |
|------|-----------|
| Navigation | `src/navigation/AppNavigator.tsx`, `MainTabNavigator.tsx`, `AppTabBar.tsx` |
| Auth | `src/utils/auth.ts`, `src/hooks/useUserProfile.ts`, `RegisterScreen`, `LoginScreen` |
| Home / status | `HomeScreen`, `EmergencyStatusCard.tsx` |
| SOS flow | `SOSButton`, `HoldSOSScreen`, `EmergencyScreen`, `TrackingScreen` |
| Contacts | `ContactsScreen`, `src/store/contactStore.ts` |
| Reports | `ReportIncidentScreen`, `*ReportScreen.tsx` |
| Alerts | `CommunityAlertsScreen` |
| Safe Walk | `SafeWalkScreen` |
| Silent SOS | `settingsService`, `useSafetyTriggers`, `SafetyTriggerProvider` |
| Admin | `commandCenterService`, `OperatorLoginScreen`, `AdminWebNavigator`, `IncidentDetailScreen` |
| Gambia | `gambiaService`, `FloodAlertsScreen`, `TouristSafetyScreen`, `EmergencyPhrasesScreen`, `OnboardingScreen` |
| Admin UI | `CommandCenterDashboard`, `LiveMapScreen`, `IncidentFeedScreen` |
| Deploy | `package.json`, `public/`, `wrangler.toml`, Cloudflare Pages |

---

## Contributing

When picking up a task:

1. Find the task ID in this file (e.g. `P1-007`).
2. Create a branch: `feature/P1-007-sos-firebase`.
3. Mark the task `[~]` in your PR description.
4. Mark `[x]` when merged to `main`.

---

*This roadmap is derived from the Civic Shield Gambia refined concept document and the current codebase state.*
