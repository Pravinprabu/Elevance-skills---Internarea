const fs = require('fs');
const path = require('path');

const translations = {
  en: {
    "Latest Jobs": "Latest Jobs",
    "Internship": "Internship",
    "Blog": "Blog",
    "Newsletter": "Newsletter",
    "Events": "Events",
    "Help center": "Help center",
    "Tutorials": "Tutorials",
    "Supports": "Supports",
    "Careers": "Careers",
    "Press": "Press",
    "News": "News",
    "Media kit": "Media kit",
    "Contact": "Contact",
    "Startups": "Startups",
    "Enterprise": "Enterprise",
    "Government": "Government",
    "SaaS": "SaaS",
    "Marketplaces": "Marketplaces",
    "Ecommerce": "Ecommerce",
    "Get Android App": "Get Android App"
  },
  hi: {
    "Latest Jobs": "नवीनतम नौकरियां",
    "Internship": "इंटर्नशिप",
    "Blog": "ब्लॉग",
    "Newsletter": "न्यूज़लेटर",
    "Events": "कार्यक्रम",
    "Help center": "सहायता केंद्र",
    "Tutorials": "ट्यूटोरियल",
    "Supports": "समर्थन",
    "Careers": "करियर",
    "Press": "प्रेस",
    "News": "समाचार",
    "Media kit": "मीडिया किट",
    "Contact": "संपर्क",
    "Startups": "स्टार्टअप",
    "Enterprise": "एंटरप्राइज़",
    "Government": "सरकार",
    "SaaS": "SaaS",
    "Marketplaces": "मार्केटप्लेस",
    "Ecommerce": "ई-कॉमर्स",
    "Get Android App": "Android ऐप डाउनलोड करें"
  },
  es: {
    "Latest Jobs": "Últimos trabajos",
    "Internship": "Pasantía",
    "Blog": "Blog",
    "Newsletter": "Boletín",
    "Events": "Eventos",
    "Help center": "Centro de ayuda",
    "Tutorials": "Tutoriales",
    "Supports": "Soporte",
    "Careers": "Carreras",
    "Press": "Prensa",
    "News": "Noticias",
    "Media kit": "Kit de medios",
    "Contact": "Contacto",
    "Startups": "Startups",
    "Enterprise": "Empresarial",
    "Government": "Gobierno",
    "SaaS": "SaaS",
    "Marketplaces": "Mercados",
    "Ecommerce": "Comercio electrónico",
    "Get Android App": "Obtener la app de Android"
  },
  pt: {
    "Latest Jobs": "Últimas vagas",
    "Internship": "Estágio",
    "Blog": "Blog",
    "Newsletter": "Boletim informativo",
    "Events": "Eventos",
    "Help center": "Central de ajuda",
    "Tutorials": "Tutoriais",
    "Supports": "Suporte",
    "Careers": "Carreiras",
    "Press": "Imprensa",
    "News": "Notícias",
    "Media kit": "Kit de mídia",
    "Contact": "Contato",
    "Startups": "Startups",
    "Enterprise": "Empresarial",
    "Government": "Governo",
    "SaaS": "SaaS",
    "Marketplaces": "Marketplaces",
    "Ecommerce": "E-commerce",
    "Get Android App": "Baixar app Android"
  },
  zh: {
    "Latest Jobs": "最新职位",
    "Internship": "实习",
    "Blog": "博客",
    "Newsletter": "新闻通讯",
    "Events": "活动",
    "Help center": "帮助中心",
    "Tutorials": "教程",
    "Supports": "支持",
    "Careers": "职业",
    "Press": "媒体",
    "News": "新闻",
    "Media kit": "媒体资料",
    "Contact": "联系我们",
    "Startups": "创业公司",
    "Enterprise": "企业",
    "Government": "政府",
    "SaaS": "SaaS",
    "Marketplaces": "市场",
    "Ecommerce": "电子商务",
    "Get Android App": "下载 Android 应用"
  },
  fr: {
    "Latest Jobs": "Dernières offres d'emploi",
    "Internship": "Stage",
    "Blog": "Blog",
    "Newsletter": "Lettre d'information",
    "Events": "Événements",
    "Help center": "Centre d'aide",
    "Tutorials": "Tutoriels",
    "Supports": "Assistance",
    "Careers": "Carrières",
    "Press": "Presse",
    "News": "Actualités",
    "Media kit": "Kit médias",
    "Contact": "Contact",
    "Startups": "Startups",
    "Enterprise": "Entreprise",
    "Government": "Gouvernement",
    "SaaS": "SaaS",
    "Marketplaces": "Places de marché",
    "Ecommerce": "E-commerce",
    "Get Android App": "Obtenir l'application Android"
  }
};

const localesDir = './internarea/public/locales';

Object.keys(translations).forEach(lang => {
  const filePath = path.join(localesDir, lang, 'common.json');
  if (fs.existsSync(filePath)) {
    const rawData = fs.readFileSync(filePath, 'utf8');
    let data = JSON.parse(rawData);
    
    // Add translations
    const langDict = translations[lang];
    for (const key in langDict) {
      data[key] = langDict[key];
    }
    
    // sort keys
    const sortedKeys = Object.keys(data).sort().reduce((obj, k) => {
      obj[k] = data[k];
      return obj;
    }, {});
    
    fs.writeFileSync(filePath, JSON.stringify(sortedKeys, null, 2), 'utf8');
    console.log(`Updated ${lang}`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});
