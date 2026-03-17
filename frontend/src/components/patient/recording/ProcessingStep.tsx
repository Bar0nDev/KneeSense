export default function ProcessingStep() {
  return (
    <div className="flex flex-col items-center gap-8 text-center py-12">
      {/* Animated Spinner */}
      <div className="relative w-20 h-20">
        {/* Outer Background Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-[#E5E5E5]" />
        
        {/* Animated Teal Spinner */}
        <div className="absolute inset-0 rounded-full border-4 border-t-[#12606A] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
      </div>

      <div>
        <p className="text-xl font-bold">Processing your session</p>
        <p className="text-sm text-[#455858] mt-2 max-w-[280px] leading-relaxed">
          Please wait while our system analyses your recording for insights.
        </p>
      </div>
      
      <div className="flex gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#12606A] animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#12606A] animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#12606A] animate-bounce" />
      </div>
    </div>
  );
}