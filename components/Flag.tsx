"use client";

interface FlagProps {
  country: string;
  className?: string;
}

export default function Flag({ country, className = "" }: FlagProps) {
  // Normalize country code to lowercase for filename matching
  const countryCode = country.toLowerCase().trim();
  const flagPath = `/flags/${countryCode}.svg`;

  return (
    <img
      src={flagPath}
      alt={`${country} flag`}
      className={`inline-block ${className}`}
      onError={(e) => {
        // Hide broken images if flag doesn't exist
        e.currentTarget.style.display = "none";
      }}
    />
  );
}
