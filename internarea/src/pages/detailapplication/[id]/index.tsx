import axios from "axios";
import { Building2, Calendar, FileText, Loader2, User } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Application } from "../../../types";
import { toast } from "react-toastify";

import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
export async function getServerSideProps(context: any) {
  const { locale, params } = context;
  const { id } = params;

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
    const res = await axios.get(`${apiUrl}/api/application/${id}`);
    
    return {
      props: {
        applicationProp: res.data,
        ...(await serverSideTranslations(locale || 'en', ['common'])),
      },
    };
  } catch (error) {
    return {
      props: {
        applicationProp: null,
        ...(await serverSideTranslations(locale || 'en', ['common'])),
      },
    };
  }
}


const index = ({ applicationProp }: any) => {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setloading] = useState(false);
  const [data, setdata] = useState<Application | any>(applicationProp || null);
  useEffect(() => {
    const fetchdata = async () => {
      try {
        setloading(true);

        //need to check the api link
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/application/${id}`
        );
        setdata(res.data);
      } catch (error) {
        toast.error("Failed to load application details");
      } finally {
        setloading(false);
      }
    };
    if (!applicationProp && id) {
      fetchdata();
    }
  }, [id, applicationProp]);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">
          Loading application details...
        </span>
      </div>
    );
  }
  if (!data && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray-600">Application not found</span>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <section key={data._id} className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="relative">
              <img
                alt="Applicant photo"
                className="w-full h-full object-cover"
                src={data?.user?.photo}
              />
              {data.status && (
                <div
                  className={`absolute top-4 right-4 px-4 py-2 rounded-full ${
                    data.status === "accepted"
                      ? "bg-green-100 text-green-600"
                      : data.status === "rejected"
                      ? "bg-red-100 text-red-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  <span className="font-semibold capitalize">
                    {data.status}
                  </span>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-8">
              <div className="mb-8">
                <div className="flex items-center mb-6">
                  <Building2 className="w-5 h-5 text-blue-600 mr-2" />
                  <h2 className="text-sm font-medium text-gray-500">Company</h2>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {data.company}
                </h1>
              </div>

              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <FileText className="w-5 h-5 text-blue-600 mr-2" />
                  <h2 className="text-sm font-medium text-gray-500">
                    Cover Letter
                  </h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {data.coverLetter}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <div className="flex items-center mb-2">
                    <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-500">
                      Application Date
                    </span>
                  </div>
                  <p className="text-gray-900 font-semibold">
                    {new Date(data.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <User className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-500">
                      Applied By
                    </span>
                  </div>
                  <p className="text-gray-900 font-semibold">
                    {data.user?.name}
                  </p>
                </div>
              </div>

              {data.resume && (
                <div className="mt-8 border-t pt-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-blue-600 mr-2" />
                      <h2 className="text-sm font-medium text-gray-500">
                        Applicant Resume
                      </h2>
                    </div>
                    <a
                      href={data.resume}
                      download="resume.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                    >
                      View Resume
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default index;
