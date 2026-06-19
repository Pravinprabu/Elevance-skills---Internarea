const fs = require('fs');
const path = require('path');

const localesDir = './internarea/public/locales';
const langs = ['en', 'es', 'hi', 'pt', 'zh', 'fr'];

langs.forEach(lang => {
  const filePath = path.join(localesDir, lang, 'common.json');
  if (fs.existsSync(filePath)) {
    const rawData = fs.readFileSync(filePath, 'utf8');
    let data = JSON.parse(rawData);
    
    // keys to remove
    const keysToRemove = [];
    
    for (const key in data) {
      if (key.includes('Copyright 2025') && key !== '© Copyright 2025. All Rights Reserved.') {
        data['© Copyright 2025. All Rights Reserved.'] = '© Copyright 2025. All Rights Reserved.';
        keysToRemove.push(key);
      }
      if (key.includes('LPAn') && key !== 'e.g. ₹10 LPAn') {
        data['e.g. ₹10 LPAn'] = 'e.g. ₹10 LPAn';
        keysToRemove.push(key);
      }
      if (key.includes('/month') && key !== 'e.g. ₹15,000/month') {
        data['e.g. ₹15,000/month'] = 'e.g. ₹15,000/month';
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(k => delete data[k]);
    
    const sortedKeys = Object.keys(data).sort().reduce((obj, k) => {
      obj[k] = data[k];
      return obj;
    }, {});
    
    fs.writeFileSync(filePath, JSON.stringify(sortedKeys, null, 2), 'utf8');
  }
});
