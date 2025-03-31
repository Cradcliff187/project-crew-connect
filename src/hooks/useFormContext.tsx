
import React, { createContext, useContext, ReactNode } from 'react';

// Create a fallback context that can be used when Form context is not available
interface FormFallbackContextValue {
  getFieldState: (name: string, formState: any) => ({ invalid: boolean, isDirty: boolean, isTouched: boolean, error: undefined });
  formState: { errors: Record<string, any> };
  setValue: (name: string, value: any) => void;
  getValues: (name?: string) => any;
  watch: (name?: string) => any;
  reset: () => void;
  handleSubmit: (onValid: (data: any) => void) => (e: React.BaseSyntheticEvent) => void;
  control: any;
  register: (name: string, options?: any) => any;
  trigger: (name?: string | string[]) => Promise<boolean>;
}

const FormFallbackContext = createContext<FormFallbackContextValue>({
  getFieldState: () => ({ invalid: false, isDirty: false, isTouched: false, error: undefined }),
  formState: { errors: {} },
  setValue: () => {},
  getValues: () => ({}),
  watch: () => ({}),
  reset: () => {},
  handleSubmit: () => () => {},
  control: {},
  register: () => ({}),
  trigger: () => Promise.resolve(true)
});

export const useFormFallback = () => {
  return useContext(FormFallbackContext);
};

interface FormFallbackProviderProps {
  children: ReactNode;
}

export const FormFallbackProvider: React.FC<FormFallbackProviderProps> = ({ children }) => {
  // Create a mock form object that prevents errors when using form methods
  // outside of a real form context
  const mockFormMethods: FormFallbackContextValue = {
    getFieldState: (name, formState) => ({ 
      invalid: false, 
      isDirty: false, 
      isTouched: false, 
      error: undefined 
    }),
    formState: { errors: {} },
    setValue: (name, value) => {
      console.log('Form context fallback: setValue called', { name, value });
    },
    getValues: (name) => {
      console.log('Form context fallback: getValues called', { name });
      return name ? undefined : {};
    },
    watch: (name) => {
      console.log('Form context fallback: watch called', { name });
      return undefined;
    },
    reset: () => {
      console.log('Form context fallback: reset called');
    },
    handleSubmit: (onValid) => (e) => {
      console.log('Form context fallback: handleSubmit called');
      e?.preventDefault();
      return undefined;
    },
    control: {
      register: () => ({}),
      unregister: () => {},
      getFieldState: () => ({ invalid: false }),
      _formValues: {}
    },
    register: (name) => {
      console.log('Form context fallback: register called', { name });
      return { 
        name, 
        onChange: () => {}, 
        onBlur: () => {},
        ref: () => {} 
      };
    },
    trigger: () => {
      console.log('Form context fallback: trigger called');
      return Promise.resolve(true);
    }
  };

  return (
    <FormFallbackContext.Provider value={mockFormMethods}>
      {children}
    </FormFallbackContext.Provider>
  );
};
