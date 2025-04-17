
import { ReactNode } from "react";

interface StatsCardProps {
  icon: ReactNode;
  value: string;
  label: string;
  subtext?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

const StatsCard = ({ icon, value, label, subtext, trend }: StatsCardProps) => {
  return (
    <div className="stat-card">
      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-500">{label}</span>
        <span className="text-blue-500">{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      {subtext && <div className="text-sm text-gray-500 mt-1">{subtext}</div>}
      {trend && (
        <div className={`text-sm mt-2 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {trend.value}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
