"use client";

interface SportIconProps {
  sport: string;
  isSelected: boolean;
  isDimmed: boolean;
  onClick: () => void;
}

// Convert sport name to slug for icon filename
function sportToSlug(sport: string): string {
  return sport
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function SportIcon({ sport, isSelected, isDimmed, onClick }: SportIconProps) {
  const slug = sportToSlug(sport);
  const iconPath = `/icons/${slug}.svg`;

  // Determine opacity based on state
  const getOpacityClass = () => {
    if (isSelected) return ""; // No opacity class, will be handled by inline style
    if (isDimmed) return "opacity-30 hover:opacity-50";
    return "hover:opacity-50";
  };

  return (
    <button
      onClick={onClick}
      className={`sport-icon flex flex-col items-center gap-2 transition-all self-start ${getOpacityClass()}`}
      style={isSelected ? { opacity: 1 } : undefined}
    >
      <div className={`sport-icon-circle w-16 h-16 rounded-full border-2 flex items-center justify-center overflow-hidden transition-all ${
        isSelected 
          ? "bg-[#014a5c] border-[#014a5c]" 
          : "bg-white border-[#014a5c]"
      }`}>
        <img
          src={iconPath}
          alt={sport}
          className={`w-12 h-12 object-contain ${isSelected ? "brightness-0 invert" : ""}`}
          onError={(e) => {
            // Hide broken images
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
      <span className={`sport-icon-label text-xs font-medium text-center max-w-[80px] ${
        isSelected ? "text-[#014a5c]" : "text-gray-700"
      }`}>
        {sport}
      </span>
    </button>
  );
}
