import { Separator } from '@/components/ui/separator';

interface WorkOrderDescriptionProps {
  description: string | null;
}

const WorkOrderDescription = ({ description }: WorkOrderDescriptionProps) => {
  if (!description) return null;

  return (
    <>
      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-2">Description</h3>
        <p className="text-sm whitespace-pre-wrap">{description}</p>
      </div>
    </>
  );
};

export default WorkOrderDescription;
