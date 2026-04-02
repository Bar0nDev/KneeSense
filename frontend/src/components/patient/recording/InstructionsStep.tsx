import Image from "next/image";
import { BsCameraVideo, BsImage } from "react-icons/bs";
import PrimaryButton from "@/components/ui/PrimaryButton";

interface Step {
  title: string;
  description: string;
  image?: string;
}

interface InstructionsStepProps {
  onContinue: () => void;
  steps: Step[]; // Passed from the hook via the page
}

export default function InstructionsStep({ onContinue, steps }: InstructionsStepProps) {
  return (
    <div className="flex flex-col gap-12 w-full max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Step Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map(({ title, description, image }, i) => (
          <div key={i} className="group flex flex-col gap-4">

            {/* Step Image */}
            <div className="relative w-full aspect-square rounded-[2rem] bg-gray-100 flex flex-col items-center justify-center border border-gray-200 transition-all group-hover:bg-gray-200 group-hover:border-gray-300 overflow-hidden">
              {image ? (
                <Image src={image} alt={`Step ${i + 1}`} fill className="object-cover" unoptimized />
              ) : (
                <>
                  <BsImage className="text-gray-400 mb-2" size={24} />
                  <span className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">
                    Step {i + 1}
                  </span>
                </>
              )}
            </div>

            <div className="px-1">
              <h2 className="text-sm font-bold text-gray-900 leading-tight">
                {title}
              </h2>
              <p className="text-xs mt-2 leading-relaxed text-[#455858] font-medium">
                {description}
              </p>
            </div>

          </div>
        ))}
      </div>

      {/* CTA PrimaryButton with better styling */}
      <div className="flex justify-center mt-4">
        <PrimaryButton
          onClick={onContinue}
          color="#27AE60"
          className="px-20 py-3 gap-2"
        >
          <BsCameraVideo size={18} />
          Proceed with Recording
        </PrimaryButton>
      </div>

    </div>
  );
}