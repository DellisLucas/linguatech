
interface WeekProgressProps {
  currentStreak: number;
  record: number;
  weeklyProgress?: number[];
}

const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const WeekProgress = ({ currentStreak, record, weeklyProgress = [] }: WeekProgressProps) => {
  // If no weekly progress is provided, use a default pattern
  const completedDays = weeklyProgress?.length 
    ? daysOfWeek.map((_, index) => weeklyProgress[index] === 1 ? index : -1).filter(day => day !== -1)
    : [0, 1, 2]; // Default completed days
  
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 items-center text-linguatech-orange">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
          </svg>
          <span className="font-semibold">Sequência de Estudo</span>
        </div>
      </div>
      
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-bold">{currentStreak} dias</h3>
          <p className="text-sm text-gray-500">Atual</p>
        </div>
        <div>
          <h3 className="text-2xl font-bold">{record} dias</h3>
          <p className="text-sm text-gray-500">Recorde</p>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-7 gap-1">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="text-xs text-gray-500 mb-2">{day}</div>
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                completedDays.includes(index) 
                  ? 'bg-linguatech-orange text-white' 
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {completedDays.includes(index) && (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekProgress;
