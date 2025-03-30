
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { toast } from '@/hooks/use-toast';

const EstimateSettingsButton = () => {
  const [useMultiStepForm, setUseMultiStepForm] = useLocalStorage('use-multistep-estimate-form', false);
  
  const handleToggleMultiStepForm = () => {
    setUseMultiStepForm(!useMultiStepForm);
    toast({
      title: useMultiStepForm ? "Using Classic Form" : "Using Multi-Step Form",
      description: useMultiStepForm 
        ? "Switched to the classic estimate form." 
        : "Switched to the enhanced multi-step estimate form.",
    });
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Estimate Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="flex items-center justify-between cursor-pointer">
            <span>Use Multi-Step Form</span>
            <Switch 
              checked={useMultiStepForm} 
              onCheckedChange={handleToggleMultiStepForm} 
            />
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EstimateSettingsButton;
