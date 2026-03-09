// Quick script to update all localhost API calls
// Run this with: node update-api-urls.js

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const files = [
  'src/components/Login.jsx',
  'src/components/UserManagement.jsx', 
  'src/components/SubCityDashboard.jsx',
  'src/components/WoredaDashboard.jsx',
  'src/components/ReportForm.jsx',
  'src/components/ReportDetailModal.jsx'
];

files.forEach(file => {
  try {
    let content = readFileSync(file, 'utf8');
    
    // Add import if not present
    if (!content.includes("import { API_URL }")) {
      const importIndex = content.indexOf("import React");
      if (importIndex !== -1) {
        const lines = content.split('\n');
        let insertIndex = 0;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ')) {
            insertIndex = i + 1;
          } else if (lines[i].trim() === '' && insertIndex > 0) {
            break;
          }
        }
        lines.splice(insertIndex, 0, "import { API_URL } from '../config/api';");
        content = lines.join('\n');
      }
    }
    
    // Replace localhost URLs
    content = content.replace(/http:\/\/localhost:5000/g, '${API_URL}');
    content = content.replace(/`http:\/\/localhost:5000/g, '`${API_URL}');
    content = content.replace(/'http:\/\/localhost:5000/g, '`${API_URL}');
    content = content.replace(/"http:\/\/localhost:5000/g, '`${API_URL}');
    
    writeFileSync(file, content);
    console.log(`Updated ${file}`);
  } catch (error) {
    console.log(`Skipped ${file}: ${error.message}`);
  }
});

console.log('Done! All API URLs updated.');