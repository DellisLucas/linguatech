
interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

const ProgressBar = ({ current, total, label }: ProgressBarProps) => {
  const percentage = Math.min(Math.round((current / total) * 100), 100);
  
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label || `${current} de ${total}`}</span>
        <span className="text-sm font-medium text-gray-700">{percentage}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

export default ProgressBar;
