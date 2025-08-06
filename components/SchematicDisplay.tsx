import React from 'react';

interface SchematicDisplayProps {
  svgContent: string;
}

const SchematicDisplay: React.FC<SchematicDisplayProps> = ({ svgContent }) => {
  // Basic validation to ensure we're not injecting script tags, etc.
  // This is a simple check; for production, a more robust sanitizer might be needed
  // if the SVG source wasn't fully trusted. Here, we trust the GenAI prompt constraints.
  const isSafeSvg = svgContent.startsWith('<svg') && !svgContent.includes('<script');

  if (!isSafeSvg) {
    return (
      <div className="mt-4 p-4 bg-black border-2 border-orange-700/50 rounded-lg text-red-500">
        <p>Error: Invalid or unsafe SVG content received.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-black border-2 border-orange-700/50 rounded-lg">
      <div 
        className="w-full h-auto text-orange-400"
        dangerouslySetInnerHTML={{ __html: svgContent }} 
      />
      <p className="mt-3 pt-3 border-t border-orange-700/50 text-xs text-orange-600">
        NOTE: This schematic is AI-generated. Always verify circuit diagrams with a trusted source before use.
      </p>
    </div>
  );
};

export default SchematicDisplay;