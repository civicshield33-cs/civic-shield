export type MapCoordinate = {
  latitude: number;
  longitude: number;
};

export const DEFAULT_MAP_CENTER: MapCoordinate = {
  latitude: 13.4549,
  longitude: -16.579,
};

const TOWN_COORDS: Record<string, MapCoordinate> = {
  Banjul: { latitude: 13.4549, longitude: -16.579 },
  Kanifing: { latitude: 13.4467, longitude: -16.675 },
  Serrekunda: { latitude: 13.4381, longitude: -16.6781 },
  Brikama: { latitude: 13.271, longitude: -16.6494 },
  Bakau: { latitude: 13.4781, longitude: -16.6819 },
  Sukuta: { latitude: 13.4094, longitude: -16.7081 },
  Kotu: { latitude: 13.45, longitude: -16.7167 },
  Kololi: { latitude: 13.4397, longitude: -16.7319 },
  Westfield: { latitude: 13.443, longitude: -16.678 },
  "Latri Kunda": { latitude: 13.428, longitude: -16.685 },
  Tallinding: { latitude: 13.417, longitude: -16.692 },
  Gunjur: { latitude: 13.203, longitude: -16.734 },
  Sanyang: { latitude: 13.256, longitude: -16.765 },
  Tanji: { latitude: 13.348, longitude: -16.789 },
  Kartong: { latitude: 13.106, longitude: -16.772 },
  Brufut: { latitude: 13.384, longitude: -16.761 },
  Tujereng: { latitude: 13.335, longitude: -16.778 },
  Jambanjelly: { latitude: 13.318, longitude: -16.768 },
  Soma: { latitude: 13.433, longitude: -15.533 },
  "Mansa Konko": { latitude: 13.443, longitude: -15.537 },
  "Jarra Soma": { latitude: 13.433, longitude: -15.533 },
  Janjanbureh: { latitude: 13.533, longitude: -14.767 },
  Bansang: { latitude: 13.433, longitude: -14.65 },
  Kuntaur: { latitude: 13.671, longitude: -14.889 },
  Basse: { latitude: 13.317, longitude: -14.217 },
  Fatoto: { latitude: 13.45, longitude: -13.95 },
  Sabi: { latitude: 13.233, longitude: -14.2 },
  Koina: { latitude: 13.483, longitude: -13.867 },
  Farafenni: { latitude: 13.567, longitude: -15.6 },
  Kerewan: { latitude: 13.489, longitude: -16.042 },
  Kaur: { latitude: 13.633, longitude: -15.417 },
  Essau: { latitude: 13.489, longitude: -16.65 },
};

export function getTownCenter(townName: string): MapCoordinate {
  const match = TOWN_COORDS[townName];
  return match
    ? { latitude: match.latitude, longitude: match.longitude }
    : { ...DEFAULT_MAP_CENTER };
}

export function resolveReportCoordinates(
  locationName: string,
  latitude?: number,
  longitude?: number
): MapCoordinate {
  if (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    !Number.isNaN(latitude) &&
    !Number.isNaN(longitude)
  ) {
    return { latitude, longitude };
  }
  return getTownCenter(locationName);
}

export function formatPinLabel(pin: MapCoordinate) {
  return `Pinned at ${pin.latitude.toFixed(5)}, ${pin.longitude.toFixed(5)}`;
}
