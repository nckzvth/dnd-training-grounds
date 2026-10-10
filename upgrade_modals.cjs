const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');

const filesToUpgrade = [
  'ScenarioModal.tsx',
  'RestModal.tsx',
  'SpellPickerModal.tsx',
  'ReactionModal.tsx',
  'HelpModal.tsx',
  'TelemetryModal.tsx',
  'MapExportImportModal.tsx'
];

function upgradeModal(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add import for ART_ASSETS
  if (!content.includes('ART_ASSETS')) {
    const importMatch = content.match(/import\s+.*?['"];?\n/);
    if (importMatch) {
      content = content.replace(importMatch[0], importMatch[0] + "import { ART_ASSETS } from '../utils/artAssets';\n");
    }
  }

  // Modal container replacement
  content = content.replace(
    /className="bg-slate-900[^"]*rounded-[^"]*max-w-[^"]* w-full p-5[^"]*flex flex-col[^"]*"/,
    'className="bg-slate-950 border-2 border-amber-600/70 rounded-2xl shadow-2xl relative overflow-hidden max-w-[MATCH_WIDTH] w-full p-5 flex flex-col MATCH_MAX_H"'
  );
  
  // Specific replacements for the container depending on file:
  if (content.includes('max-w-xl')) {
    content = content.replace('MATCH_WIDTH', 'xl');
  } else if (content.includes('max-w-lg')) {
    content = content.replace('MATCH_WIDTH', 'lg');
  } else if (content.includes('max-w-2xl')) {
    content = content.replace('MATCH_WIDTH', '2xl');
  } else if (content.includes('max-w-md')) {
    content = content.replace('MATCH_WIDTH', 'md');
  } else {
    content = content.replace('MATCH_WIDTH', 'xl');
  }

  if (content.includes('max-h-[90vh]')) {
    content = content.replace('MATCH_MAX_H', 'max-h-[90vh]');
  } else {
    content = content.replace('MATCH_MAX_H', '');
  }

  // Insert relative z-10 and background overlay into the main modal container
  // Find the new container class
  const containerRegex = /className="bg-slate-950 border-2 border-amber-600\/70 rounded-2xl shadow-2xl relative overflow-hidden.*?"\s*>/;
  const match = content.match(containerRegex);
  if (match) {
    const replacement = match[0] + `
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 mix-blend-overlay" style={{ backgroundImage: \`url(\${ART_ASSETS.darkWood})\` }} />
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none" style={{ backgroundImage: \`url(\${ART_ASSETS.crestEmblem})\`, width: '150px', height: '150px', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'top right', mixBlendMode: 'overlay' }} />
        <div className="relative z-10 flex flex-col h-full">`;
    content = content.replace(match[0], replacement);
    // Add </div> at the end right before the outer </div>
    const closingDivRegex = /(<\/div>\s*)(<\/div>\s*<\/div>\s*\);\s*};\s*)$/;
    content = content.replace(closingDivRegex, '</div>$1$2');
    
    // For ReactionModal it might be slightly different
    const closingDivRegex2 = /(<\/div>\s*)(<\/div>\s*\);\s*};\s*)$/;
    if (!content.match(closingDivRegex)) {
        content = content.replace(closingDivRegex2, '</div>$1$2');
    }
  }

  // Headings
  content = content.replace(
    /className="text-base font-bold text-slate-100 flex items-center gap-2"/g,
    'className="text-xl font-fantasy text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 flex items-center gap-2 drop-shadow-md"'
  );
  content = content.replace(
    /className="text-base font-bold text-slate-100"/g,
    'className="text-xl font-fantasy text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 drop-shadow-md"'
  );

  // Lists and Cards (Parchment styles)
  // Replaces bg-slate-950 or bg-slate-900 border with parchment styled ones
  content = content.replace(
    /bg-slate-950\/60 border-slate-800 hover:border-slate-700/g,
    'bg-slate-900/90 border-amber-800/60 hover:border-amber-600/80 relative overflow-hidden'
  );
  content = content.replace(
    /bg-slate-950\/80 border border-slate-800 hover:border-slate-700/g,
    'bg-slate-900/90 border border-amber-800/60 hover:border-amber-600/80 relative overflow-hidden'
  );
  content = content.replace(
    /bg-slate-950 border border-slate-800/g,
    'bg-slate-900/90 border border-amber-800/60 relative overflow-hidden'
  );
  
  // Need to inject parchment background into relative overflow-hidden divs manually or just use classes
  // The simplest is to add the parchment div via a regex
  content = content.replace(
    /(className="[^"]*bg-slate-900\/90 border[^"]*relative overflow-hidden[^"]*"\s*>)/g,
    '$1\n              <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url(${ART_ASSETS.parchment})` }} />\n              <div className="relative z-10">'
  );
  // Then we have to close it. But this is hard with regex. 
  // Maybe just inline style for parchment background instead of nested div?
  // Let's revert that and just use inline styles for parchment on the cards.
  
  content = content.replace(/\n              <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"[^>]+>\s*<div className="relative z-10">/g, '');
  content = content.replace(/relative overflow-hidden/g, ''); // cleanup

  // Let's do parchment via style directly on the elements
  content = content.replace(
    /className="([^"]*bg-slate-900\/90 border[^"]*)"/g,
    'className="$1 relative overflow-hidden"\n                style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.9)), url(${ART_ASSETS.parchment})`, backgroundBlendMode: "overlay" }}'
  );

  // Buttons
  content = content.replace(
    /bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/g,
    'btn-fantasy-gold'
  );
  content = content.replace(
    /bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900\/20/g,
    'btn-fantasy-gold shadow-md shadow-amber-900/20'
  );
  content = content.replace(
    /bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white/g,
    'btn-fantasy-gold text-white'
  );
  content = content.replace(
    /bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500/g,
    'btn-fantasy-gold text-white'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Upgraded', filePath);
}

filesToUpgrade.forEach(file => {
  upgradeModal(path.join(componentsDir, file));
});
