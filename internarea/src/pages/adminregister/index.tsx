import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import { useTranslation } from 'react-i18next';
export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
}


const AdminRegister = () => {
  const { t } = useTranslation('common');
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create admin user using the regular register route but forcing role admin on the backend or we can create an admin specific register route.
      // But the instructions say: "On submit, hash the password with bcrypt and save to the User collection with role: "admin"".
      // Let's create an admin register route first.
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/adminregister`, formData);
      toast.success("Admin registered successfully");
      router.push("/adminlogin");
    } catch (error) {
      toast.error("Admin registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t("Register Admin")}
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t("Name")}</label>
              <input type="text" name="name" onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t("Email")}</label>
              <input type="email" name="email" onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t("Password")}</label>
              <input type="password" name="password" onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-black" />
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              {t("Register Admin")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
