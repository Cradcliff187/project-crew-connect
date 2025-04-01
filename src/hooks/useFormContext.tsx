
import React, { createContext, useContext, ReactNode } from 'react';

// Create a fallback context that can be used when Form context is not available
interface FormFallbackContextValue {
  getFieldState: (name: string) => ({ invalid: false, isDirty: false, isTouched: false, error: undefined });
  formState: { errors: {} };
}

const FormFallbackContext = createContext<FormFallbackContextValue>({
  getFieldState: () => ({ invalid: false, isDirty: false, isTouched: false, error: undefined }),
  formState: { errors: {} }
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
        getFieldState: () => ({ invalid: false, isDirty: false, isTouched: false, error: undefined }),
        formState: { errors: {} }
      }}
    >
      {children}
    </FormFallbackContext.Provider>
  );
};
