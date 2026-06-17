export const APP_URL =
  process.env.EXPO_PUBLIC_APP_URL || "https://civic-shield.pages.dev";

export function getTrackingUrl(incidentId: string) {
  return `${APP_URL}?track=${incidentId}`;
}

export function getSafeWalkUrl(journeyId: string) {
  return `${APP_URL}?walk=${journeyId}`;
}
