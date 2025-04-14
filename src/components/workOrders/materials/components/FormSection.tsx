import { ReactNode } from 'react';

interface FormSectionProps {
  label: string;
  children: ReactNode;
  optional?: boolean;
  rightElement?: ReactNode;
}

const FormSection = ({ label, children, optional = false, rightElement }: FormSectionProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between h-6">
        <label htmlFor="vendor" className="text-sm font-medium">
          {label} {!optional && '*'}
        </label>
        {rightElement}
      </div>
      {children}
    </div>
  );
};

export default FormSection;
