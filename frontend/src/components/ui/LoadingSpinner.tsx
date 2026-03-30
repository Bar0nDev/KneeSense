export default function ProcessingStep() {
  return (
    <div className="flex h-screen items-center justify-center ">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-[#E5E5E5]" />
        <div className="absolute inset-0 rounded-full border-4 border-t-[#12606A] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
      </div>
    </div>
  );
}