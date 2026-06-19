import React, { useState } from "react";
import { auth, provider } from "../../firebase/firebase";
import { signInWithPopup } from "firebase/auth";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { login } from "@/Feature/Userslice";
import axios from "axios";

import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import { useTranslation } from 'react-i18next';
export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
}


const Register = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const dispatch = useDispatch();
  const [role, setRole] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!role) {
      toast.error("Please select whether you are a Job Seeker or a Recruiter.");
      return;
    }
    try {
      const res = await signInWithPopup(auth, provider);
      
      const payload = {
        uid: res.user.uid,
        name: res.user.displayName,
        email: res.user.email,
        photo: res.user.photoURL,
        role: role,
      };

      const backendRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/user/register`, payload);
      
      dispatch(
        login({
          uid: res.user.uid,
          name: res.user.displayName,
          email: res.user.email,
          photo: res.user.photoURL,
          role: backendRes.data.role,
          plan: backendRes.data.plan,
        })
      );
      toast.success("Registered successfully");
      router.push("/");
    } catch (error) {
      toast.error("Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t("Create a new account")}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t("Join InternArea to kickstart your career")}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div
              className={`border-2 rounded-lg p-6 cursor-pointer text-center transition ${
                role === "jobseeker" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => setRole("jobseeker")}
            >
              <div className="text-4xl mb-2">🧑‍💼</div>
              <h3 className="text-lg font-bold text-gray-900">{t("I'm a Job Seeker")}</h3>
              <p className="text-sm text-gray-500">{t("Looking for internships or jobs")}</p>
            </div>
            <div
              className={`border-2 rounded-lg p-6 cursor-pointer text-center transition ${
                role === "recruiter" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => setRole("recruiter")}
            >
              <div className="text-4xl mb-2">🏢</div>
              <h3 className="text-lg font-bold text-gray-900">{t("I'm a Recruiter")}</h3>
              <p className="text-sm text-gray-500">{t("I want to post jobs or internships")}</p>
            </div>
          </div>

          <button
            onClick={handleRegister}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {t("Continue with Google")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
