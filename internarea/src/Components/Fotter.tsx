import { Facebook, Twitter, Instagram } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation('common');
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <FooterSection title={t("Internship by places", "Internship by places")} items={["New York", "Los Angeles", "Chicago", "San Francisco", "Miami", "Seattle"]} />
          <FooterSection title={t("Internship by stream", "Internship by stream")} items={["About us", "Careers", "Press", "News", "Media kit", "Contact"]} />
          <FooterSection title={t("Job Places", "Job Places")} items={["Blog", "Newsletter", "Events", "Help center", "Tutorials", "Supports"]} links />
          <FooterSection title={t("Jobs by streams", "Jobs by streams")} items={["Startups", "Enterprise", "Government", "SaaS", "Marketplaces", "Ecommerce"]} links />
        </div>

        <hr className="my-10 border-gray-600" />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <FooterSection title={t("About us", "About us")} items={["Startups", "Enterprise"]} links />
          <FooterSection title={t("Team diary", "Team diary")} items={["Startups", "Enterprise"]} links />
          <FooterSection title={t("Terms and conditions", "Terms and conditions")} items={["Startups", "Enterprise"]} links />
          <FooterSection title={t("Sitemap", "Sitemap")} items={["Startups"]} links />
        </div>

        <div className="mt-10 flex flex-col sm:flex-row justify-between items-center">
          <p className="flex items-center gap-2 border border-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-700">
            <i className="bi bi-google-play"></i> {t("Get Android App", "Get Android App")}
          </p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <Facebook className="w-6 h-6 hover:text-blue-400 cursor-pointer" />
            <Twitter className="w-6 h-6 hover:text-blue-400 cursor-pointer" />
            <Instagram className="w-6 h-6 hover:text-pink-400 cursor-pointer" />
          </div>
          <p className="mt-4 sm:mt-0 text-sm text-gray-400">© Copyright 2025. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterSection({ title, items, links }:any) {
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-300">{title}</h3>
      <div className="flex flex-col items-start mt-4 space-y-3">
        {items.map((item:any, index:any) =>
          links ? (
            <a key={index} href="/" className="text-gray-400 hover:text-blue-400 hover:underline">
              {item}
            </a>
          ) : (
            <p key={index} className="text-gray-400 hover:text-blue-400 hover:underline cursor-pointer">
              {item}
            </p>
          )
        )}
      </div>
    </div>
  );
}