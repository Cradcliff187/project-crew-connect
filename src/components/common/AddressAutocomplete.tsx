import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { LoaderCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AddressAutocompleteProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onAddressSelect?: (address: {
    fullAddress: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  }) => void;
  apiKey?: string;
}

// Using the provided API key
const GOOGLE_API_KEY = 'AIzaSyBE-qjPRvQwxuEigwu4b5YK_wH77LDyTC0'; 

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  onAddressSelect,
  className,
  apiKey = GOOGLE_API_KEY,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  useEffect(() => {
    // Skip if the script is already loaded or we had an error
    if (window.google?.maps?.places || scriptLoaded || scriptError) return;

    // Check if API key is available
    if (!apiKey) {
      console.error('Google Maps API key is not configured');
      toast({
        title: 'Configuration Error',
        description: 'Google Maps API is not properly configured. Address autocomplete is disabled.',
        variant: 'destructive',
      });
      setScriptError(true);
      return;
    }

    setIsLoading(true);

    // Load the Google Maps Places API script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setScriptLoaded(true);
      setIsLoading(false);
    };
    
    script.onerror = () => {
      setScriptError(true);
      setIsLoading(false);
      toast({
        title: 'Connection Error',
        description: 'Failed to load Google Maps API. Address autocomplete is disabled.',
        variant: 'destructive',
      });
    };
    
    document.head.appendChild(script);
    
    return () => {
      // Clean up script tag when component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [apiKey]);

  useEffect(() => {
    // Initialize Google Places Autocomplete when the script is loaded
    if (scriptLoaded && inputRef.current && window.google?.maps?.places && !autocompleteRef.current) {
      try {
        const options = {
          types: ['address'],
          componentRestrictions: { country: 'us' }, // Restrict to US addresses
        };
        
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          options
        );
        
        // Add place_changed event listener
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          
          if (place && place.address_components && onAddressSelect) {
            // Process address components
            let streetNumber = '';
            let route = '';
            let city = '';
            let state = '';
            let zip = '';
            
            place.address_components.forEach(component => {
              const types = component.types;
              
              if (types.includes('street_number')) {
                streetNumber = component.long_name;
              } else if (types.includes('route')) {
                route = component.long_name;
              } else if (types.includes('locality')) {
                city = component.long_name;
              } else if (types.includes('administrative_area_level_1')) {
                state = component.short_name;
              } else if (types.includes('postal_code')) {
                zip = component.long_name;
              }
            });
            
            const street = streetNumber && route ? `${streetNumber} ${route}` : place.name || '';
            
            onAddressSelect({
              fullAddress: place.formatted_address || '',
              street,
              city,
              state,
              zip
            });
          }
        });
      } catch (error) {
        console.error('Error initializing Google Places Autocomplete:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize address autocomplete.',
          variant: 'destructive',
        });
      }
    }
    
    return () => {
      // Clean up listener when component unmounts
      if (autocompleteRef.current && window.google?.maps?.places) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [scriptLoaded, onAddressSelect]);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        className={className}
        disabled={isLoading || scriptError}
        {...props}
      />
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
