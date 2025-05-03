// src/utils/addressUtils.ts

/**
 * Structure for holding parsed address components.
 */
interface ParsedAddress {
  /** The street number. */
  streetNumber: string;
  /** The street name. */
  route: string;
  /** The city or locality. */
  city: string;
  /** The county or administrative area level 2. */
  county: string;
  /** The state or administrative area level 1 (usually abbreviation). */
  state: string;
  /** The country name. */
  country: string;
  /** The postal code or zip code. */
  postalCode: string;
}

/**
 * Parses Google Maps address components into a structured object.
 * Assumes google.maps types are available globally or via @types/google.maps
 * @param {google.maps.GeocoderAddressComponent[]} components - The address_components array from Place Details.
 * @returns {ParsedAddress} - A structured address object.
 */
export function parseAddressComponents(
  components: google.maps.GeocoderAddressComponent[] | undefined
): ParsedAddress {
  const parsed: Partial<ParsedAddress> = {};

  if (!components) {
    return {
      streetNumber: '',
      route: '',
      city: '',
      county: '',
      state: '',
      country: '',
      postalCode: '',
    };
  }

  components.forEach(component => {
    const types = component.types;

    if (types.includes('street_number')) {
      parsed.streetNumber = component.long_name;
    } else if (types.includes('route')) {
      parsed.route = component.long_name;
    } else if (types.includes('locality')) {
      parsed.city = component.long_name;
    } else if (types.includes('administrative_area_level_2')) {
      parsed.county = component.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      parsed.state = component.short_name || component.long_name; // Prefer short name for state (e.g., "CA")
    } else if (types.includes('country')) {
      parsed.country = component.long_name;
    } else if (types.includes('postal_code')) {
      parsed.postalCode = component.long_name;
    }
  });

  // Return with defaults for missing fields
  return {
    streetNumber: parsed.streetNumber || '',
    route: parsed.route || '',
    city: parsed.city || '',
    county: parsed.county || '',
    state: parsed.state || '',
    country: parsed.country || '',
    postalCode: parsed.postalCode || '',
  };
}

/**
 * Combines street number and route from a ParsedAddress object into a single street address string.
 *
 * @param {ParsedAddress} parsed - The parsed address object.
 * @returns {string} - The combined street address (e.g., "123 Main St").
 */
export function getFullStreetAddress(parsed: ParsedAddress): string {
  return `${parsed.streetNumber} ${parsed.route}`.trim();
}
