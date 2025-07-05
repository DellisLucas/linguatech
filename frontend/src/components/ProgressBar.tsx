interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

const ProgressBar = ({ current, total, label }: ProgressBarProps) => {
  const percentage = Math.min(Math.round((current / total) * 100), 100);
  
  return (
    <div className="w-64">
      <div className="flex items-center justify-between mb-1 gap-4">
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
          {label || `Questão ${current} de ${total}`}
        </span>
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap ml-2">
          {percentage}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-linguatech-blue h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
