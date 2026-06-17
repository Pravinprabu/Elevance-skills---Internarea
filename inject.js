const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'internarea', 'src', 'pages');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (file === 'index.tsx' && fullPath !== path.join(pagesDir, 'index.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      const snippet = `
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
}
`;
      // Don't inject if it already has it
      if (!content.includes('serverSideTranslations')) {
        // inject at the top but after imports
        const lines = content.split('\n');
        let lastImportIndex = -1;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ')) {
            lastImportIndex = i;
          }
        }
        
        lines.splice(lastImportIndex + 1, 0, snippet);
        fs.writeFileSync(fullPath, lines.join('\n'));
        console.log('Injected getStaticProps into ' + fullPath);
      }
    }
  }
}

walk(pagesDir);
