import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Subcontractor } from '../utils/types';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tags } from 'lucide-react';

interface SpecialtiesSectionProps {
  subcontractor: Subcontractor;
  specialtyIds: string[];
}

const SpecialtiesSection = ({ subcontractor, specialtyIds }: SpecialtiesSectionProps) => {
  const [specialties, setSpecialties] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecialties = async () => {
      if (!specialtyIds.length) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('subcontractor_specialties')
          .select('*')
          .in('id', specialtyIds);

        if (error) throw error;

        // Convert to a map for easier lookup
        const specialtiesMap = (data || []).reduce(
          (acc, curr) => {
            acc[curr.id] = curr;
            return acc;
          },
          {} as Record<string, any>
        );

        setSpecialties(specialtiesMap);
      } catch (error) {
        console.error('Error fetching specialties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialties();
  }, [specialtyIds]);

  if (!subcontractor.specialty_ids || subcontractor.specialty_ids.length === 0) {
    return null;
  }

  const renderSpecialties = () => {
    if (loading) {
      return <div className="text-muted-foreground">Loading specialties...</div>;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {subcontractor.specialty_ids.map(id => {
          const specialty = specialties[id];
          return specialty ? (
            <Badge
              key={id}
              variant="secondary"
              className="text-xs font-medium bg-primary/10 text-primary border-primary/20"
            >
              {specialty.specialty}
            </Badge>
          ) : null;
        })}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Tags className="h-5 w-5" />
          Specialties
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{renderSpecialties()}</CardContent>
    </Card>
  );
};

export default SpecialtiesSection;
