"use client";

import Flag from "./Flag";
import { getStars } from "@/lib/utils";
import { getCountryName } from "@/lib/countries";

interface FilterSidebarProps {
  countries: string[];
  countryPower: Map<string, number>;
  selectedCountries: string[];
  onCountryToggle: (country: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function FilterSidebar({
  countries,
  countryPower,
  selectedCountries,
  onCountryToggle,
  isOpen,
  onToggle,
}: FilterSidebarProps) {
  return (
    <aside className={`filter-sidebar z-10 fixed top-[89px] left-0 w-64 bg-white border-r border-gray-200 p-6 h-[calc(100vh-89px)] overflow-y-auto flex flex-col ${isOpen ? 'sidebar-open' : ''}`}>
      <button
        onClick={onToggle}
        className={`burger-button hidden ${isOpen ? 'open' : ''}`}
        aria-label="Toggle sidebar"
      >
        {isOpen ? (
          <span className="text-2xl font-bold text-[#014a5c] leading-none">✕</span>
        ) : (
          <>
            <span></span>
            <span></span>
            <span></span>
          </>
        )}
      </button>
      <div className="filter-sidebar-container flex-1 flex flex-col">
        {/* Countries Filter */}
        <div className="filter-section filter-section-countries flex-1 flex flex-col">
          <h3 className="filter-section-title text-sm font-semibold text-gray-700 mb-3">Countries</h3>
          <div className="filter-list filter-list-countries space-y-2">
            {countries.map((country) => (
              <label
                key={country}
                className="filter-item filter-item-country flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedCountries.includes(country)}
                  onChange={() => onCountryToggle(country)}
                  className="filter-checkbox filter-checkbox-country w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Flag country={country} className="filter-flag w-4 h-4 object-cover rounded" />
                <span className="filter-label filter-label-country text-sm text-gray-700">
                  {getCountryName(country)} ({countryPower.get(country) || 0} ⭐)
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
