const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const keys = new Set();
// Regex to match t('key') or t("key") or t('key', "fallback")
const regex = /t\(\s*(['"])(.*?)\1/g;

walkDir('./internarea/src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    const content = fs.readFileSync(filePath, 'utf-8');
    let match;
    while ((match = regex.exec(content)) !== null) {
      keys.add(match[2]);
    }
  }
});

const newKeys = Array.from(keys);
console.log('Found ' + newKeys.length + ' keys.');

const localesDir = './internarea/public/locales';
const langs = ['en', 'es', 'hi', 'pt', 'zh', 'fr'];

langs.forEach(lang => {
  const filePath = path.join(localesDir, lang, 'common.json');
  let currentKeys = {};
  if (fs.existsSync(filePath)) {
    try {
      currentKeys = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      console.log('Error reading ' + filePath);
    }
  }
  
  newKeys.forEach(k => {
    if (!currentKeys[k]) {
      currentKeys[k] = k;
    }
  });
  
  const sortedKeys = Object.keys(currentKeys).sort().reduce(
    (obj, key) => { 
      obj[key] = currentKeys[key]; 
      return obj;
    }, 
    {}
  );
  
  fs.writeFileSync(filePath, JSON.stringify(sortedKeys, null, 2));
  console.log('Updated ' + filePath);
});
