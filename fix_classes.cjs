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

filesToUpgrade.forEach(file => {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/max-w-\[xl\]/g, 'max-w-xl');
  content = content.replace(/max-w-\[lg\]/g, 'max-w-lg');
  content = content.replace(/max-w-\[2xl\]/g, 'max-w-2xl');
  content = content.replace(/max-w-\[md\]/g, 'max-w-md');
  fs.writeFileSync(filePath, content, 'utf8');
});
console.log('Fixed classes');
