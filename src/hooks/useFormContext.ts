import { useCallback } from 'react';

/**
 * A fallback hook to provide a basic form context when useFormContext is used outside a FormProvider
 * This helps prevent crashes when components using form context are rendered in isolation
 */
export const useFormFallback = () => {
  // Create a minimal implementation of form context API
  const getValues = useCallback((path?: string | string[]) => {
    console.warn('useFormContext used outside FormProvider - using fallback implementation');
    return path ? undefined : {};
  }, []);

  const setValue = useCallback(() => {
    console.warn('useFormContext used outside FormProvider - using fallback implementation');
    return undefined;
  }, []);

  const handleSubmit = useCallback(
    (onValid: (data: any) => void, onInvalid?: (errors: any) => void) => {
      console.warn('useFormContext used outside FormProvider - using fallback implementation');
      return (e: any) => {
        e.preventDefault();
        return undefined;
      };
    },
    []
  );

  const reset = useCallback(() => {
    console.warn('useFormContext used outside FormProvider - using fallback implementation');
    return undefined;
  }, []);

  const trigger = useCallback(() => {
    console.warn('useFormContext used outside FormProvider - using fallback implementation');
    return Promise.resolve(false);
  }, []);

  const getFieldState = useCallback(() => {
    return { invalid: false, isDirty: false, isTouched: false, error: undefined };
  }, []);

  const watch = useCallback(() => {
    console.warn('useFormContext used outside FormProvider - using fallback implementation');
    return undefined;
  }, []);

  // Return the minimal implementation needed to prevent errors
  return {
    getValues,
    setValue,
    handleSubmit,
    reset,
    trigger,
    formState: {
      errors: {},
      isSubmitting: false,
      isDirty: false,
      isValid: false,
      dirtyFields: {},
      touchedFields: {},
    },
    watch,
    getFieldState,
    control: {
      register: () => ({ name: '' }),
      unregister: () => {},
      _names: { mount: {}, array: {}, watch: {} },
    },
    register: () => ({ name: '' }),
    unregister: () => {},
    clearErrors: () => {},
    setError: () => {},
    setFocus: () => {},
  };
};
