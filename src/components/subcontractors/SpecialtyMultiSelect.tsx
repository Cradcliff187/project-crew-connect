import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

export interface Specialty {
  id: string;
  specialty: string;
  description: string | null;
}

interface SpecialtyMultiSelectProps {
  selectedSpecialties: string[];
  onChange: (specialties: string[]) => void;
}

const SpecialtyMultiSelect = ({ selectedSpecialties, onChange }: SpecialtyMultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all specialties from the database
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const { data, error } = await supabase
          .from('subcontractor_specialties')
          .select('id, specialty, description')
          .order('specialty');

        if (error) {
          throw error;
        }

        setSpecialties(data || []);
      } catch (error) {
        console.error('Error fetching specialties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialties();
  }, []);

  const toggleSpecialty = (specialtyId: string) => {
    if (selectedSpecialties.includes(specialtyId)) {
      onChange(selectedSpecialties.filter(id => id !== specialtyId));
    } else {
      onChange([...selectedSpecialties, specialtyId]);
    }
  };

  const removeSpecialty = (e: React.MouseEvent, specialtyId: string) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(selectedSpecialties.filter(id => id !== specialtyId));
  };

  const getSpecialtyName = (id: string) => {
    const specialty = specialties.find(s => s.id === id);
    return specialty?.specialty || 'Unknown Specialty';
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10"
          >
            {selectedSpecialties.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedSpecialties.map(specialtyId => (
                  <Badge key={specialtyId} variant="secondary" className="mr-1 mb-1">
                    {getSpecialtyName(specialtyId)}
                    <button onClick={e => removeSpecialty(e, specialtyId)} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground">Select specialties...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search specialties..." />
            <CommandEmpty>{loading ? 'Loading...' : 'No specialty found.'}</CommandEmpty>
            <CommandGroup>
              {specialties.map(specialty => (
                <CommandItem
                  key={specialty.id}
                  value={specialty.specialty}
                  onSelect={() => toggleSpecialty(specialty.id)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedSpecialties.includes(specialty.id) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{specialty.specialty}</span>
                    {specialty.description && (
                      <span className="text-xs text-muted-foreground">{specialty.description}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SpecialtyMultiSelect;
