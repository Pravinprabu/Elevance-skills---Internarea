const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'internarea', 'public', 'locales');

const translations = {
  hi: {
    "Experience": "अनुभव",
    "Jobs found": "नौकरियां मिलीं",
    "CTC": "सीटीसी (वेतन)",
    "Annual Salary": "वार्षिक वेतन",
    "Jobs": "नौकरियां"
  },
  es: {
    "Experience": "Experiencia",
    "Jobs found": "Trabajos encontrados",
    "CTC": "Salario (CTC)",
    "Annual Salary": "Salario Anual",
    "Jobs": "Trabajos"
  },
  pt: {
    "Experience": "Experiência",
    "Jobs found": "Vagas encontradas",
    "CTC": "Salário (CTC)",
    "Annual Salary": "Salário Anual",
    "Jobs": "Vagas"
  },
  zh: {
    "Experience": "经验",
    "Jobs found": "找到的工作",
    "CTC": "年薪 (CTC)",
    "Annual Salary": "年薪",
    "Jobs": "工作"
  },
  fr: {
    "Experience": "Expérience",
    "Jobs found": "Emplois trouvés",
    "CTC": "Salaire (CTC)",
    "Annual Salary": "Salaire Annuel",
    "Jobs": "Emplois"
  }
};

for (const [lang, newTrans] of Object.entries(translations)) {
  const filePath = path.join(localesDir, lang, 'common.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const merged = { ...data, ...newTrans };
    fs.writeFileSync(filePath, JSON.stringify(merged, null, 2));
  }
}
