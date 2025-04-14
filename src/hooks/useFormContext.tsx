import React, { createContext, useContext, ReactNode } from 'react';

// Create a fallback context that can be used when Form context is not available
interface FormFallbackContextValue {
  getFieldState: (name: string) => {
    invalid: false;
    isDirty: false;
    isTouched: false;
    error: undefined;
  };
  formState: { errors: {} };
  getValues: (path?: string | string[]) => any;
  setValue: (name: string, value: any) => void;
  handleSubmit: (onValid: Function, onInvalid?: Function) => (e: any) => void;
  reset: () => void;
  trigger: () => Promise<boolean>;
  watch: (name?: string | string[]) => any;
  control: {
    register: () => { name: string };
    unregister: () => void;
    _names: { mount: {}; array: {}; watch: {} };
  };
  register: () => { name: string };
  unregister: () => void;
  clearErrors: () => void;
  setError: () => void;
  setFocus: () => void;
}

const FormFallbackContext = createContext<FormFallbackContextValue>({
  getFieldState: () => ({ invalid: false, isDirty: false, isTouched: false, error: undefined }),
  formState: { errors: {} },
  getValues: () => ({}),
  setValue: () => undefined,
  handleSubmit: () => e => {
    e.preventDefault();
  },
  reset: () => undefined,
  trigger: () => Promise.resolve(false),
  watch: () => undefined,
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
});

export const useFormFallback = () => {
  return useContext(FormFallbackContext);
};

interface FormFallbackProviderProps {
  children: ReactNode;
}

export const FormFallbackProvider: React.FC<FormFallbackProviderProps> = ({ children }) => {
  return (
    <FormFallbackContext.Provider
      value={{
        getFieldState: () => ({
          invalid: false,
          isDirty: false,
          isTouched: false,
          error: undefined,
        }),
        formState: { errors: {} },
        getValues: path => (path ? undefined : {}),
        setValue: () => undefined,
        handleSubmit: (onValid, onInvalid) => e => {
          e.preventDefault();
          return undefined;
        },
        reset: () => undefined,
        trigger: () => Promise.resolve(false),
        watch: () => undefined,
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
      }}
    >
      {children}
    </FormFallbackContext.Provider>
  );
};

// Export the useFormFallback hook from the .ts file for backward compatibility
export * from './useFormContext';
