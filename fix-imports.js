const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'internarea', 'src', 'pages');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (file === 'index.tsx' || file === '_app.tsx') {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('next-i18next/serverSideTranslations')) {
        content = content.replace(/next-i18next\/serverSideTranslations/g, 'next-i18next/pages/serverSideTranslations');
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

walk(pagesDir);
