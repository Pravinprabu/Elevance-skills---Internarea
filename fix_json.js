const fs = require('fs');
const path = require('path');

const localesDir = './internarea/public/locales';
const langs = ['en', 'es', 'hi', 'pt', 'zh', 'fr'];

langs.forEach(lang => {
  const filePath = path.join(localesDir, lang, 'common.json');
  if (fs.existsSync(filePath)) {
    const rawData = fs.readFileSync(filePath, 'utf8');
    let data;
    try {
      data = JSON.parse(rawData);
    } catch(e) {
      console.log('Error parsing', filePath);
      return;
    }
    
    // Find keys to fix
    const fixedData = {};
    for (const key in data) {
      let newKey = key;
      if (key.includes('LPAn') && key.includes('e.g.')) {
        newKey = 'e.g. ₹10 LPAn';
      } else if (key.includes('/month') && key.includes('15,000')) {
        newKey = 'e.g. ₹15,000/month';
      } else if (key.includes('Copyright 2025')) {
        newKey = '© Copyright 2025. All Rights Reserved.';
      }
      
      let val = data[key];
      if (val === key) {
        val = newKey; // sync the value too
      }
      fixedData[newKey] = val;
    }
    
    // sort again
    const sortedKeys = Object.keys(fixedData).sort().reduce((obj, k) => {
      obj[k] = fixedData[k];
      return obj;
    }, {});
    
    fs.writeFileSync(filePath, JSON.stringify(sortedKeys, null, 2), 'utf8');
    console.log('Fixed', filePath);
  }
});
