// components/rehab/ExerciseCard.tsx
import { BsCheckCircleFill } from "react-icons/bs";
import { LuMoveRight } from "react-icons/lu";

export function ExerciseCard({ exercise, onStart }: { exercise: any; onStart: () => void }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col border border-gray-50">
      <div className="w-full aspect-[4/3] bg-[#E6F4F4] flex items-center justify-center">
        <img src={exercise.image} alt={exercise.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-md font-bold text-gray-900">{exercise.name}</p>
        <p className="text-xs text-[#9CA3AF]">
          {exercise.reps} reps × {exercise.sets} sets
        </p>
        <div className="mt-auto pt-2">
          {exercise.done ? (
            <span className="text-sm font-semibold text-[#27AE60] flex items-center gap-1">
              <BsCheckCircleFill size={12} /> Finished
            </span>
          ) : (
            <button 
              onClick={onStart}
              className="text-sm font-semibold text-[#12606A] hover:text-[#30C3B1] transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              Start <LuMoveRight size={14}/>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}