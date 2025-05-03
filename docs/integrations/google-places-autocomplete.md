# Google Places Autocomplete Integration Documentation

This document provides details on the Google Places Autocomplete integration implemented in the CRM Live application.

## Purpose

This integration provides address suggestions as users type into address input fields across the application. When a suggestion is selected, it fetches detailed place information (including structured address components like city, state, zip, and geometry) to automatically populate related form fields, reducing manual entry and improving address accuracy.

## Implementation Details

### Reusable Hook

The core logic is encapsulated in a reusable React hook:

- **Hook:** `usePlacesAutocomplete`
- **Location:** `src/hooks/usePlacesAutocomplete.ts`

This hook handles:

- Debouncing user input
- Calling the backend API to fetch suggestions
- Managing loading, error, and suggestion states
- Fetching place details upon selection
- Providing handlers for input changes and suggestion selection

### Backend Endpoints

The hook relies on two backend endpoints defined in `server/server.js`:

1.  **`GET /api/maps/autocomplete?input=...`**

    - Takes the user's partial address input.
    - Calls the Google Places Autocomplete API using the server-side API key.
    - Returns an array of `PlaceSuggestion` objects.

2.  **`GET /api/maps/placedetails?placeid=...`**
    - Takes the `place_id` of a selected suggestion.
    - Calls the Google Places Details API using the server-side API key.
    - Returns a `PlaceDetails` object containing `address_components`, `formatted_address`, `geometry`, etc.

### Required Configuration

- **Environment Variable:** The backend server (`server/server.js`) requires the `GOOGLE_MAPS_API_KEY` variable to be set in the `server/.env` file.
- **Google Cloud Setup:** The API key used must be enabled for the **Places API** in your Google Cloud Console project (`crm-live-458710`). Ensure appropriate API key restrictions (e.g., HTTP referrers for frontend keys if used, or IP address/API restrictions for backend keys) are configured for security.

## Implemented Components

The `usePlacesAutocomplete` hook has been integrated into the following components:

1.  `src/components/projects/createWizard/Step1_ProjectCustomerInfo.tsx` (Handles `siteLocation.*` fields)
2.  `src/components/vendors/VendorForm.tsx` (Handles `address`, `city`, `state`, `zip` fields)
3.  `src/components/workOrders/dialog/components.tsx` (Handles `address`, `city`, `state`, `zip` fields within `LocationFields` when custom address is used)
4.  `src/components/contacts/ContactFormFields.tsx` (Handles the single `address` field)

## Adding Autocomplete to a New Form

To integrate address autocomplete into a new React component (assuming `react-hook-form` and `@/components/ui/input`):

1.  **Import Hook & Utils:**

    ```typescript
    import React from 'react';
    import { usePlacesAutocomplete, PlaceDetails } from '@/hooks/usePlacesAutocomplete';
    import { parseAddressComponents, getFullStreetAddress } from '@/utils/addressUtils';
    import { useFormContext } from 'react-hook-form'; // Or your form library hook
    import { Input } from '@/components/ui/input';
    import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
    ```

2.  **Setup Hook State:** Inside your component, get form methods and initialize the hook:

    ```typescript
    const { setValue, watch, getValues } = useFormContext(); // Adapt to your form library
    const initialAddress = React.useRef(getValues('your_address_field_name') || '');

    const {
      inputValue: autocompleteInputValue,
      suggestions,
      loading: autocompleteLoading,
      error: autocompleteError,
      handleInputChange: handleAutocompleteInputChange,
      handleSelectSuggestion,
      clearSuggestions,
      setInputValueManual,
    } = usePlacesAutocomplete({
      initialValue: initialAddress.current,
      onSelect: details => {
        if (details) {
          const parsed = parseAddressComponents(details.address_components);
          // Set main address field (e.g., with formatted_address)
          setValue('your_address_field_name', details.formatted_address, {
            shouldValidate: true,
            shouldDirty: true,
          });
          // Set related fields (city, state, zip)
          setValue('your_city_field_name', parsed.city, {
            shouldValidate: true,
            shouldDirty: true,
          });
          setValue('your_state_field_name', parsed.state, {
            shouldValidate: true,
            shouldDirty: true,
          });
          setValue('your_zip_field_name', parsed.postalCode, {
            shouldValidate: true,
            shouldDirty: true,
          });
        } else {
          console.error('Failed to get place details for [Your Form Name].');
          // Optionally clear related fields
        }
      },
    });
    ```

3.  **Create Input Handlers:**

    ```typescript
    const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleAutocompleteInputChange(e); // Update hook state
      setValue('your_address_field_name', e.target.value, { shouldDirty: true }); // Update form state
    };

    const handleSuggestionClick = (placeId: string) => {
      handleSelectSuggestion(placeId);
    };
    ```

4.  **Sync External Form Changes:** (Optional but recommended if the field can be changed externally)

    ```typescript
    const currentAddressValue = watch('your_address_field_name');
    React.useEffect(() => {
      if (currentAddressValue !== autocompleteInputValue) {
        setInputValueManual(currentAddressValue || '');
      }
    }, [currentAddressValue, autocompleteInputValue, setInputValueManual]);
    ```

5.  **Render the Input and Suggestions:** Use `FormField` (or similar) and render the `Input` and suggestion list:

    ```typescript
     <FormField
       control={form.control} // Your react-hook-form control object
       name="your_address_field_name"
       render={({ field }) => (
         <FormItem className="relative"> {/* Required for positioning suggestions */}
           <FormLabel>Address</FormLabel>
           <FormControl>
             <Input
               placeholder="Start typing address..."
               {...field} // Spread RHF props
               value={autocompleteInputValue} // *** Use hook's value ***
               onChange={handleAddressInputChange} // *** Use combined handler ***
               onBlur={() => setTimeout(clearSuggestions, 150)} // Clear suggestions on blur
             />
           </FormControl>
           {/* Suggestions Dropdown */}
           {autocompleteLoading && <div className="text-sm ...">Loading...</div>}
           {autocompleteError && <div className="text-sm text-red-600 ...">{autocompleteError}</div>}
           {suggestions.length > 0 && (
             <ul className="absolute z-10 w-full bg-background border ...">
               {suggestions.map((suggestion) => (
                 <li
                   key={suggestion.place_id}
                   className="px-3 py-2 cursor-pointer hover:bg-accent"
                   onMouseDown={() => handleSuggestionClick(suggestion.place_id)}
                 >
                   {suggestion.description}
                 </li>
               ))}
             </ul>
           )}
           <FormMessage />
         </FormItem>
       )}
     />
     {/* Render City, State, Zip fields (likely as readOnly) */}
     <FormField name="your_city_field_name" ... >
        <Input {...field} readOnly />
     </FormField>
     {/* ... similar for state and zip ... */}
    ```

6.  **Adapt:** Adjust field names (`your_address_field_name`, etc.), form library hooks (`useFormContext`, `setValue`, `watch`), and styling as needed for your specific component.
