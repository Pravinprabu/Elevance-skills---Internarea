const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('c:\\\\Users\\\\WELCOME\\\\OneDrive\\\\Desktop\\\\VS code\\\\internshala-clone-main\\\\Elevance-skills---Internarea\\\\internarea\\\\src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  const regex1 = new RegExp('"http://localhost:5000([^"]*)"', 'g');
  if (regex1.test(content)) {
    content = content.replace(regex1, '`${process.env.NEXT_PUBLIC_API_URL}$1`');
    changed = true;
  }
  
  const regex2 = new RegExp('`http://localhost:5000([^`]*)`', 'g');
  if (regex2.test(content)) {
    content = content.replace(regex2, '`${process.env.NEXT_PUBLIC_API_URL}$1`');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
});
