
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TimelogAddButtonProps {
  onClick: () => void;
}

const TimelogAddButton = ({ onClick }: TimelogAddButtonProps) => {
  return (
    <Button 
      onClick={onClick}
      className="bg-[#0485ea] hover:bg-[#0375d1]"
    >
      <Plus className="h-4 w-4 mr-2" />
      Log Time
    </Button>
  );
};

export default TimelogAddButton;
