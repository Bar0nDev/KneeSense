import { BsCameraVideo } from "react-icons/bs";
import Button from "@/components/ui/Button";

const steps = [
  {
    title: "1. Attach the Device",
    description: "Strap the sensor firmly against the front of your knee, ensuring the gel surface is in full contact with the skin.",
  },
  {
    title: "2. Starting Position",
    description: "Sit on a chair with your knee bent at a 90° angle. Keep your back straight and your foot resting lightly on the floor.",
  },
  {
    title: "3. Establish Baseline",
    description: "Press record and remain still in the starting position for 2-3 seconds to capture a clean baseline frame.",
  },
  {
    title: "4. Flexion & Extension",
    description: "Slowly extend your leg forward until straight. Hold this position for 2 seconds, then slowly lower it back to the 90° starting point.",
  },
];

interface InstructionsStepProps {
  onContinue: () => void;
}

export default function InstructionsStep({ onContinue }: InstructionsStepProps) {
  return (
    <div className="flex flex-col gap-12 w-full max-w-5xl">

      {/* Step Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map(({ title, description }, i) => (
          <div key={i} className="flex flex-col gap-3">

            <div className="w-full aspect-square rounded-2xl bg-[#E5E5E5] flex items-center justify-center border border-[#D9D9D9]">
              <span className="text-[#455858] font-medium text-sm">Step {i + 1} Image</span>
            </div>

            <div>
              <p className="text-sm font-semibold leading-snug">{title}</p>
              <p className="text-xs mt-1 leading-relaxed text-[#455858]">{description}</p>
            </div>

          </div>
        ))}
      </div>

      {/* CTA Button */}
      <div className="flex justify-center">
        <Button
          bgColor="bg-[#27AE60]"
          hoverColor="hover:bg-[#219150]"
          onClick={onContinue}
          className="px-16 py-3"
        >
          <BsCameraVideo size={16} className="mr-2" />
          Proceed with recording
        </Button>
      </div>

    </div>
  );
}