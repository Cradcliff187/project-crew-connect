import { useState, useEffect, useCallback, useRef } from 'react';
import debounce from 'lodash.debounce';

// --- Types ---
/**
 * Structure representing a suggestion from Google Places Autocomplete API.
 */
export interface PlaceSuggestion {
  /** The human-readable name/description of the suggested place. */
  description: string;
  /** A textual identifier that uniquely identifies a place. */
  place_id: string;
  // Add other fields from Autocomplete prediction if needed (e.g., structured_formatting)
}

/**
 * Structure representing detailed information about a place from Google Places Details API.
 * Contains address components, formatted address, geometry, etc.
 */
export interface PlaceDetails {
  /** Array of address components (street number, city, state, etc.). */
  address_components: google.maps.GeocoderAddressComponent[];
  /** The full, human-readable address for this place. */
  formatted_address: string;
  /** Contains the location (latitude/longitude) of the place. */
  geometry: google.maps.places.PlaceGeometry;
  /** The name of the place. */
  name: string;
  /** A textual identifier that uniquely identifies this place. */
  place_id: string;
}

/**
 * Props for the usePlacesAutocomplete hook.
 */
interface UsePlacesAutocompleteProps {
  /** Debounce time in milliseconds for API calls while typing. Defaults to 300. */
  debounceMs?: number;
  /** Callback function executed when a suggestion is selected and details are fetched. Receives PlaceDetails or null on error. */
  onSelect?: (details: PlaceDetails | null) => void;
  /** Optional initial value for the input field controlled by the hook. */
  initialValue?: string;
}

/**
 * Return value structure for the usePlacesAutocomplete hook.
 */
interface UsePlacesAutocompleteReturn {
  /** Current value of the input field controlled by the hook. */
  inputValue: string;
  /** Array of place suggestions fetched from the autocomplete API. */
  suggestions: PlaceSuggestion[];
  /** Boolean indicating if an API call (autocomplete or details) is in progress. */
  loading: boolean;
  /** Error message string if an API call failed, otherwise null. */
  error: string | null;
  /** Function to be passed to the input field's onChange event handler. */
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  /** Async function to call when a suggestion is selected. Pass the place_id. Fetches details and calls onSelect. */
  handleSelectSuggestion: (placeId: string) => Promise<void>;
  /** Function to manually clear the suggestions list (e.g., on input blur). */
  clearSuggestions: () => void;
  /** Function to manually set the input value (e.g., when syncing with external form state or resetting). */
  setInputValueManual: (value: string) => void;
}

// --- Hook Implementation ---
/**
 * Custom React hook to integrate Google Places Autocomplete functionality.
 *
 * Manages input state, fetches suggestions via a backend proxy (`/api/maps/autocomplete`),
 * handles selection, fetches place details via a backend proxy (`/api/maps/placedetails`),
 * and provides state for loading, errors, and suggestions.
 *
 * @param {UsePlacesAutocompleteProps} props - Configuration options for the hook.
 * @returns {UsePlacesAutocompleteReturn} - State variables and handlers for the autocomplete input.
 */
export function usePlacesAutocomplete({
  debounceMs = 300,
  onSelect,
  initialValue = '',
}: UsePlacesAutocompleteProps = {}): UsePlacesAutocompleteReturn {
  const [inputValue, setInputValue] = useState<string>(initialValue);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Ref to prevent fetching on initial mount or unnecessary re-renders
  const isMounted = useRef(false);
  // Ref to track if the input change was triggered internally by selection
  const internalUpdate = useRef(false);

  // Debounced function to fetch autocomplete suggestions
  const fetchAutocompleteSuggestions = useCallback(
    debounce(async (input: string) => {
      if (!input.trim() || internalUpdate.current) {
        if (!input.trim()) setSuggestions([]); // Clear if empty
        setLoading(false);
        setError(null);
        internalUpdate.current = false; // Reset flag
        return;
      }

      setLoading(true);
      setError(null);
      console.log(`Fetching autocomplete for: "${input}"`); // Debug log

      try {
        // Use '/api/' prefix assuming your backend is served relative to frontend
        // Adjust if your server setup is different (e.g., different port, full URL)
        const response = await fetch(`/api/maps/autocomplete?input=${encodeURIComponent(input)}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        const data: PlaceSuggestion[] = await response.json();
        setSuggestions(data || []);
      } catch (err: any) {
        console.error('Autocomplete API Call Failed:', err);
        setError(err.message || 'Failed to fetch suggestions');
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs),
    [debounceMs]
  );

  // Effect to call debounced fetch when input changes
  useEffect(() => {
    // Add console log here
    console.log(
      'Autocomplete useEffect triggered. Input:',
      inputValue,
      'isMounted:',
      isMounted.current,
      'internalUpdate:',
      internalUpdate.current
    );

    if (isMounted.current) {
      // Don't fetch if the update was internal (from selection)
      if (!internalUpdate.current) {
        console.log('Autocomplete calling fetchAutocompleteSuggestions for:', inputValue);
        fetchAutocompleteSuggestions(inputValue);
      } else {
        console.log('Autocomplete skipping fetch due to internal update.');
      }
    } else {
      // Handle initial value if provided on first mount potentially
      // Check if initialValue exists and we haven't fetched yet
      console.log('Autocomplete useEffect - initial mount check. InitialValue:', initialValue);
      // We set initialValue in the mount effect, so this might not be needed
      // if (initialValue) fetchAutocompleteSuggestions(initialValue);
    }

    // Clean up debounce timer on unmount or input change
    return () => {
      console.log('Autocomplete useEffect cleanup. Cancelling debounce timer.');
      fetchAutocompleteSuggestions.cancel();
    };
  }, [inputValue, fetchAutocompleteSuggestions, initialValue]); // Added initialValue dependency

  // Effect to track mount status
  useEffect(() => {
    isMounted.current = true;
    // Set initial value state when component mounts
    setInputValue(initialValue);
    return () => {
      isMounted.current = false;
    };
  }, [initialValue]); // Rerun if initialValue changes

  // Handler for input field changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    internalUpdate.current = false; // User is typing
    setInputValue(event.target.value);
  };

  // Function to allow setting input value externally (e.g., from form reset)
  const setInputValueManual = (value: string) => {
    internalUpdate.current = false; // Assume external update is like user typing
    setInputValue(value);
    if (!value.trim()) {
      setSuggestions([]); // Clear suggestions if value is cleared externally
    }
  };

  // Handler for selecting a suggestion
  const handleSelectSuggestion = async (placeId: string) => {
    setLoading(true);
    setError(null);
    setSuggestions([]); // Clear suggestions after selection
    console.log(`Fetching details for placeId: "${placeId}"`); // Debug log

    try {
      const response = await fetch(`/api/maps/placedetails?placeid=${encodeURIComponent(placeId)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      const details: PlaceDetails = await response.json();
      // Update input field with formatted address upon selection
      internalUpdate.current = true; // Mark this as an internal update
      setInputValue(details.formatted_address);
      // Execute the callback with the fetched details
      onSelect?.(details);
    } catch (err: any) {
      console.error('Place Details API Call Failed:', err);
      setError(err.message || 'Failed to fetch place details');
      onSelect?.(null); // Pass null on error
    } finally {
      setLoading(false);
    }
  };

  // Function to manually clear suggestions
  const clearSuggestions = () => {
    setSuggestions([]);
  };

  return {
    inputValue,
    suggestions,
    loading,
    error,
    handleInputChange,
    handleSelectSuggestion,
    clearSuggestions,
    setInputValueManual, // Expose manual setter
  };
}
