import { cn } from "@/lib/utils";

interface LevelIndicatorProps {
  level: number;
  className?: string;
}

const LevelIndicator = ({ level, className }: LevelIndicatorProps) => {
  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-green-500";
      case 2:
        return "bg-blue-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-orange-500";
      case 5:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div
      className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
        getLevelColor(level),
        className
      )}
    >
      {level}
    </div>
  );
};

export default LevelIndicator; 