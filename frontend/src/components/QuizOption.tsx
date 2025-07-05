
import { cn } from "@/lib/utils";

interface QuizOptionProps {
  text: string;
  selected: boolean;
  correct: boolean | null;
  onClick: () => void;
  disabled: boolean;
}

const QuizOption = ({ text, selected, correct, onClick, disabled }: QuizOptionProps) => {
  const getOptionClass = () => {
    if (correct === true) return "quiz-option-correct";
    if (correct === false) return "quiz-option-incorrect";
    if (selected) return "quiz-option-selected";
    return "";
  };

  return (
    <div 
      className={cn("quiz-option", getOptionClass())}
      onClick={() => !disabled && onClick()}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-300">
          {selected && (
            <div className="h-3 w-3 rounded-full bg-linguatech-blue" />
          )}
          {correct === true && (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-linguatech-green">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          )}
          {correct === false && (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-red-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <div className="text-base">{text}</div>
      </div>
    </div>
  );
};

export default QuizOption;
