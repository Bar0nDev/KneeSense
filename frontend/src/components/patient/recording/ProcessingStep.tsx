"use client";

import { FaCheck } from "react-icons/fa6";

interface ProcessingStepProps {
  message?: string;
}

const STEPS = [
  {
    trigger: "Uploading your recording...",
    label: "Upload",
  },
  {
    trigger: "Analyzing knee movement...",
    label: "Analyze",
  },
  {
    trigger: "Retrieving predictions...",
    label: "Predictions",
  },
  {
    trigger: "Generating AI insights...",
    label: "AI Insights",
  },
];

function getActiveIndex(message: string): number {
  const idx = STEPS.findIndex((s) => s.trigger === message);
  return idx === -1 ? 0 : idx;
}

export default function ProcessingStep({ message = STEPS[0].trigger }: ProcessingStepProps) {
  const activeIndex = getActiveIndex(message);

  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-lg py-8 px-4">

      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">Processing your session</h2>
        <p className="text-xs text-[#455858] mt-1 font-medium">Please keep this page open.</p>
      </div>

      {/* Horizontal stepper */}
      <div className="w-full">

        {/* Circles row */}
        <div className="flex items-center justify-between w-full">
          {STEPS.map((step, i) => {
            const isDone    = i < activeIndex;
            const isActive  = i === activeIndex;
            const isPending = i > activeIndex;
            const isLast    = i === STEPS.length - 1;

            return (
              <div key={step.trigger} className="flex items-center">
                {/* Step circle */}
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div
                    className={[
                      "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300",
                      isDone    ? "bg-[#12606A]"                                                          : "",
                      isActive  ? "border border-2 border-gray-200 border-t-[#12606A] animate-spin"               : "",
                      isPending ? "border border-2 border-gray-200"                                                     : "",
                    ].join(" ")}
                  >
                    {isDone && (
                      <FaCheck size={18} className="text-white" />
                    )}
                  </div>

                  {/* Label below circle */}
                  <span
                    className={[
                      "text-xs font-semibold text-center whitespace-nowrap transition-colors duration-300",
                      isDone    ? "text-[#12606A]" : "",
                      isActive  ? "text-gray-900"  : "",
                      isPending ? "text-gray-400"  : "",
                    ].join(" ")}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector line between steps */}
                {!isLast && (
                  <div className="flex-1 min-w-0 h-px mx-3 relative rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className={[
                        "absolute inset-0 rounded-full transition-all duration-500",
                        isDone   ? "bg-[#12606A]"       : "",
                        isActive ? "bg-[#12606A]/30"    : "",
                      ].join(" ")}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active step description */}
      <p className="text-sm text-[#455858] text-center leading-relaxed min-h-[20px] animate-in fade-in duration-300">
        {message}
      </p>

      {/* Bouncing dots */}
      <div className="flex gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#12606A] animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#12606A] animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#12606A] animate-bounce" />
      </div>
    </div>
  );
}
