import { selectuser } from "@/Feature/Userslice";
import { ExternalLink, Mail, User } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
interface User {
  name: string;
  email: string;
  photo: string;
}
import { useRouter } from "next/router";

import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import { useTranslation } from 'react-i18next';
export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
}


const index = () => {
  const { t } = useTranslation('common');
  // const [user, setuser] = useState<User | null>({
  //   name: "Rahul",
  //   email: "xyz@gmail.com",
  //   photo:
  //     "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=faces",
  // });
  const user=useSelector(selectuser)
  const router = useRouter();
  const [loginHistory, setLoginHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      router.push("/register");
      return;
    }
    if (user?.uid) {
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/user/${user.uid}/login-history`)
        .then(res => setLoginHistory(res.data))
        .catch(() => setLoginHistory([]));
    }
  }, [user]);
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              {user?.photo ? (
                <img
                  src={user?.photo}
                  alt={user?.name}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-16 pb-8 px-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
              <div className="mt-2 flex items-center justify-center text-gray-500">
                <Mail className="h-4 w-4 mr-2" />
                <span>{user?.email}</span>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <span className="text-blue-600 font-semibold text-2xl">
                    0
                  </span>
                  <p className="text-blue-600 text-sm mt-1">
                    {t("Active Applications")}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <span className="text-green-600 font-semibold text-2xl">
                    0
                  </span>
                  <p className="text-green-600 text-sm mt-1">
                    {t("Accepted Applications")}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center pt-4">
                <Link
                  href={user?.role === "admin" || user?.role === "recruiter" ? "/applications" : "/userapplication"}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  {t("View Applications")}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Login History */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg overflow-hidden p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t("Login History")}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Browser</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loginHistory.map((history, idx) => (
                  <tr key={idx} className={history.status === "blocked" ? "bg-red-50" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(history.loginAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{history.browser}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{history.os}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{history.deviceType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{history.ipAddress}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${history.status === "allowed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {history.status}
                      </span>
                      {history.status === "blocked" && history.blockReason && (
                        <div className="text-xs text-red-600 mt-1">{history.blockReason}</div>
                      )}
                    </td>
                  </tr>
                ))}
                {loginHistory.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      {t("No login history found.")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;
