
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface LearningCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  onContinue: () => void;
}

const LearningCard = ({ title, description, icon, onContinue }: LearningCardProps) => {
  return (
    <div className="learning-card">
      {icon && <div className="text-linguatech-blue mb-1">{icon}</div>}
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>
      <Button className="bg-linguatech-blue hover:bg-blue-700 w-full" onClick={onContinue}>
        Continuar
      </Button>
    </div>
  );
};

export default LearningCard;
