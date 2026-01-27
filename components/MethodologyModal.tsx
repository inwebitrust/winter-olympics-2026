"use client";

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MethodologyModal({ isOpen, onClose }: MethodologyModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="methodology-modal bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Methodology</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 text-gray-700">
          <div>
            <p className="mb-2">
              <strong>Anthony Veyssiere</strong> - Web developer based in Canada and sports enthusiast.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">How Medal Chances Are Determined</h3>
            <p className="mb-2">
              The medal chances for each athlete have been carefully assessed using a combination of:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>AI Analysis (Google Gemini/ChatGPT):</strong> Leveraging advanced AI models to analyze athlete performance data, recent results, and competitive history</li>
              <li><strong>Latest World Cup Standings & Rankings:</strong> Incorporating current FIS (International Ski Federation), IBU (International Biathlon Union), and other official sport federation rankings</li>
              <li><strong>Recent Competition Results:</strong> Analysis of performance in recent World Championships, World Cups, and Olympic qualification events</li>
              <li><strong>Historical Performance:</strong> Consideration of past Olympic and World Championship results</li>
              <li><strong>Current Form & Fitness:</strong> Assessment of recent performance trends and athlete condition</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Chance Categories</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Big Favourite (5 stars):</strong> Top contenders with exceptional recent form and ranking</li>
              <li><strong>Favourite (4 stars):</strong> Strong medal candidates with consistent high-level performance</li>
              <li><strong>Challenger (3 stars):</strong> Athletes with solid chances who could medal on a good day</li>
              <li><strong>Outsider (2 stars):</strong> Athletes with potential but less consistent results</li>
              <li><strong>Wildcard (1 star):</strong> Athletes who could surprise but face significant challenges</li>
            </ul>
          </div>

          <div className="text-sm text-gray-600 italic">
            <p>
              Note: These assessments are based on available data and analysis as of the data collection date. 
              Actual results may vary due to the unpredictable nature of competitive sports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
