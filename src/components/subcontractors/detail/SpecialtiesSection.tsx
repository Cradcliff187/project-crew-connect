import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Subcontractor } from '../utils/types';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

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
              className="text-xs font-medium bg-[#f0f7fe] text-[#0485ea] border-[#dcedfd]"
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
        <CardTitle className="text-lg text-primary">Specialties</CardTitle>
      </CardHeader>
      <div className="space-y-4">
        <div>{renderSpecialties()}</div>
      </div>
    </Card>
  );
};

export default SpecialtiesSection;
