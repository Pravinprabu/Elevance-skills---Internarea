import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Book,
  Calendar,
  Cat,
  Clock,
  DollarSign,
  ExternalLink,
  MapPin,
  X,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { selectuser } from "@/Feature/Userslice";
import { Job } from "../../../types";

import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import { useTranslation } from 'react-i18next';
export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export async function getStaticProps(context: any) {
  const { locale, params } = context;

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://elevance-skills-internarea.onrender.com";
    const baseUrl = apiUrl.replace(/\/$/, "");
    console.log(`Fetching from: ${baseUrl}/api/job/${params.id}`);
    
    const res = await fetch(`${baseUrl}/api/job/${params.id}`);

    if (!res.ok) {
      return { notFound: true };
    }

    const data = await res.json();

    return {
      props: {
        jobProp: data,
        ...(await serverSideTranslations(locale || "en", ["common"])),
      },
    };
  } catch (err) {
    return { notFound: true };
  }
}

// const filteredJobs = [
//     {
//       _id: "101",
//       title: "Frontend Developer",
//       company: "Amazon",
//       location: "Seattle",
//       CTC: "$100K/year",
//       Experience: "2+ years",
//       category: "Engineering",
//       StartDate: "April 1, 2025",
//       aboutCompany:
//         "Amazon is a global leader in e-commerce and cloud computing, providing cutting-edge technology solutions.",
//       aboutJob:
//         "Seeking a skilled Frontend Developer proficient in React.js, JavaScript, and UI development.",
//       Whocanapply:
//         "Developers with experience in JavaScript, React.js, and modern frontend frameworks.",
//       perks:
//         "Remote work, stock options, health insurance, learning resources.",
//       AdditionalInfo: "This role is hybrid with occasional onsite meetings.",
//       numberOfopning: "3",
//     },
//     {
//       _id: "102",
//       title: "Data Analyst",
//       company: "Microsoft",
//       location: "Remote",
//       CTC: "$90K/year",
//       Experience: "1+ years",
//       category: "Data Science",
//       StartDate: "March 15, 2025",
//       aboutCompany:
//         "Microsoft is a technology company specializing in software development, cloud computing, and AI.",
//       aboutJob:
//         "Looking for a Data Analyst with expertise in SQL, Python, and data visualization tools.",
//       Whocanapply:
//         "Candidates with experience in data analytics, SQL, Python, and Tableau/Power BI.",
//       perks: "Flexible hours, remote work, upskilling programs, bonuses.",
//       AdditionalInfo: "This is a fully remote role.",
//       numberOfopning: "2",
//     },
//     {
//       _id: "103",
//       title: "UX Designer",
//       company: "Apple",
//       location: "California",
//       CTC: "$110K/year",
//       Experience: "3+ years",
//       category: "Design",
//       StartDate: "March 30, 2025",
//       aboutCompany:
//         "Apple is a leader in consumer electronics and software, focusing on design and innovation.",
//       aboutJob:
//         "Seeking a UX Designer to craft intuitive user experiences for our next-generation products.",
//       Whocanapply:
//         "Designers with experience in Figma, Adobe XD, user research, and usability testing.",
//       perks:
//         "Creative environment, free lunches, fitness perks, flexible hours.",
//       AdditionalInfo: "Office-based with occasional remote work options.",
//       numberOfopning: "1",
//     },
//     {
//       _id: "104",
//       title: "Backend Developer",
//       company: "NextGen Solutions",
//       location: "Austin, TX",
//       CTC: "$90,000 - $110,000",
//       Experience: "3-5 years",
//       category: "Engineering",
//       StartDate: "March 20, 2025",
//       aboutCompany:
//         "NextGen Solutions specializes in building scalable backend systems and APIs for high-performance applications.",
//       aboutJob:
//         "Looking for a Backend Developer skilled in Node.js, Express.js, and database management.",
//       Whocanapply:
//         "Developers with experience in server-side programming, databases (SQL, NoSQL), and RESTful APIs.",
//       perks: "Stock options, remote work, gym membership, yearly bonuses.",
//       AdditionalInfo: "Hybrid role with 2 days of in-office meetings per week.",
//       numberOfopning: "3",
//     },
//     {
//       _id: "105",
//       title: "UI/UX Designer",
//       company: "Design Pro",
//       location: "San Francisco, CA",
//       CTC: "$70,000 - $85,000",
//       Experience: "2+ years",
//       category: "Design",
//       StartDate: "March 25, 2025",
//       aboutCompany:
//         "Design Pro is an award-winning UI/UX design agency focusing on innovative user experiences.",
//       aboutJob:
//         "We need a UI/UX Designer who can create user-friendly interfaces and improve the user experience of our applications.",
//       Whocanapply:
//         "Designers with proficiency in Figma, Adobe XD, and user research methodologies.",
//       perks:
//         "Creative workspace, wellness programs, free team lunches, flexible hours.",
//       AdditionalInfo: "Office-based with flexible working hours.",
//       numberOfopning: "1",
//     },
//   ];
const index = ({ jobProp }: any) => {
  const { t } = useTranslation('common');
  const user=useSelector(selectuser)
  const router = useRouter();
  const { id } = router.query;
  const [jobdata, setjob] = useState<Job | null>(jobProp || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobProp && id) {
      const fetchdata = async () => {
        try {
          setLoading(true);
          setError(null);
          const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
          const res = await axios.get(`${apiUrl}/api/job/${id}`);
          setjob(res.data);
        } catch (error: any) {
          if (error.response && error.response.status === 404) {
            setError("not_found");
          } else {
            setError("network_error");
            toast.error("Failed to load data. The server might be waking up.");
          }
        } finally {
          setLoading(false);
        }
      };
      fetchdata();
    }
  }, [id, jobProp]);

  const [availability, setAvailability] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [subStatus, setSubStatus] = useState<any>(null);

  useEffect(() => {
    if (user?.uid && user.role === "jobseeker") {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
      axios.get(`${apiUrl}/api/subscription/status/${user.uid}`)
        .then(res => setSubStatus(res.data))
        .catch(() => {});
    }
  }, [user]);

  if (loading || (!jobdata && !jobProp && !loading && id === undefined && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error === "network_error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <span className="text-gray-600 text-lg mb-4">Failed to load job details. The server might be unavailable.</span>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Retry</button>
      </div>
    );
  }

  if (!jobdata || error === "not_found") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray-600 text-lg">Job not found</span>
      </div>
    );
  }

  const handlesubmitapplication = async () => {
    if (!jobdata) return;
    if (!coverLetter.trim()) {
      toast.error("please write a cover letter");
      return;
    }
    if (!availability) {
      toast.error("please select your availability");
      return;
    }
    if(!resume){
      toast.error("please upload your resume (PDF)");
      return;
    }
    try {
      // Convert resume to base64
      const getBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
      };
      const resumeBase64 = await getBase64(resume);

      const applicationdata = {
        category: jobdata.category,
        company: jobdata.company,
        coverLetter: coverLetter,
        resume: resumeBase64,
        user: user,
        Application: id,
        jobOwner: jobdata.postedBy,
        availability,
      };
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
      await axios.post(
        `${apiUrl}/api/application`,
        applicationdata
      );
      toast.success("Application submit successfully");
      router.push("/job");
    } catch (error: any) {
      if (error?.response?.status === 403 && error?.response?.data?.upgradeRequired) {
        toast.error(error.response.data.error);
        setIsModalOpen(false);
        router.push("/plans");
      } else {
        toast.error("Failed to submit application");
      }
    }
  };
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-2 text-blue-600 mb-4">
            <ArrowUpRight className="h-5 w-5" />
            <span className="font-medium">{t("Actively Hiring")}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {jobdata.title}
          </h1>
          <p className="text-lg text-gray-600 mb-4">{jobdata.company}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="h-5 w-5" />
              <span>{jobdata.location}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <DollarSign className="h-5 w-5" />
              <span>CTC {jobdata.CTC}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Book className="h-5 w-5" />
              <span>{jobdata.category}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <Clock className="h-4 w-4 text-green-500" />
            <span className="text-green-500 text-sm">
              {t("Posted on ")} {jobdata.createAt}
            </span>
          </div>
        </div>
        {/* Company Section */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t("About ")} {jobdata.company}
          </h2>
          <div className="flex items-center space-x-2 mb-4">
            <a
              href="#"
              className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>{t("Visit company website")}</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <p className="text-gray-600">{jobdata.aboutCompany}</p>
        </div>
        {/* Internship Details Section */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t("About the Job")}
          </h2>
          <p className="text-gray-600 mb-6">{jobdata.aboutJob}</p>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("Who can apply")}
          </h3>
          <p className="text-gray-600 mb-6">{jobdata.whoCanApply}</p>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("Perks")}</h3>
          <p className="text-gray-600 mb-6">{jobdata.perks}</p>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("Additional Information")}
          </h3>
          <p className="text-gray-600 mb-6">{jobdata.AdditionalInfo}</p>
        </div>
        {/* Apply Button */}
        <div className="p-6 flex justify-center">
          {(!user || user.role === "jobseeker") && (
            <div className="text-center">
              {subStatus && (
                <p className="text-sm text-gray-500 mb-3">
                  Plan: <span className="font-semibold capitalize">{subStatus.plan}</span> —
                  {subStatus.applicationLimit === "Unlimited"
                    ? " Unlimited applications"
                    : ` ${subStatus.applicationCount} / ${subStatus.applicationLimit} applications used this month`}
                </p>
              )}
              {subStatus && !subStatus.canApply ? (
                <div className="space-y-2">
                  <p className="text-red-600 text-sm font-medium">
                    You have reached your monthly application limit.
                  </p>
                  <button
                    onClick={() => router.push("/plans")}
                    className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition duration-150"
                  >
                    Upgrade Plan to Apply More
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (!user) { router.push("/register"); return; }
                    setIsModalOpen(true);
                  }}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition duration-150"
                >
                  {t("Apply Now")}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Apply Modal */}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {t("Apply to ")} {jobdata.company}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Resume Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("Your Resume")}
                </h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf"
                    id="resume-upload"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setResume(e.target.files[0]);
                      }
                    }}
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer text-center w-full">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="mt-4 flex text-sm text-gray-600 justify-center">
                      <span className="relative rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        {t("Upload a file")}
                      </span>
                      <p className="pl-1">{t("or drag and drop")}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {t("PDF up to 5MB")}
                    </p>
                  </label>
                </div>
                {resume && (
                  <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                      <span className="truncate max-w-[200px] sm:max-w-[300px]">{resume.name}</span>
                    </div>
                    <button onClick={() => setResume(null)} className="text-blue-700 hover:text-blue-900 focus:outline-none">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("Cover Letter")}
                </h3>
                <p className="text-gray-600 mb-2">
                  {t("Why should you be selected for this internship?")}
                </p>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder={t("Write your cover letter here...") as string}
                ></textarea>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("Your Availability")}
                </h3>
                <div className="space-y-3">
                  {[
                    t("Yes, I am available to join immediately"),
                    t("No, I am currently on notice period"),
                    t("No, I will have to serve notice period"),
                    t("Other"),
                  ].map((option) => (
                    <label key={option as string} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name=""
                        id=""
                        value={option as string}
                        checked={availability === option}
                        onChange={(e) => setAvailability(e.target.value)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="text-gray-700">{option as string}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end pt-4">
                {user ? (
                  <button
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    onClick={handlesubmitapplication}
                  >
                    {t("Submit Application")}
                  </button>
                ) : (
                  <Link
                    href={`/`}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    {t("Sign up to apply")}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default index;
