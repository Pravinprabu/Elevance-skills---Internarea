import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectuser } from "@/Feature/Userslice";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ResumeBuilder() {
  const user = useSelector(selectuser);
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    photo: "",
    summary: "",
    qualifications: [{ degree: "", institution: "", year: "" }],
    experience: [{ role: "", company: "", duration: "", description: "" }],
    skills: "",
  });

  useEffect(() => {
    if (user === undefined) return;
    if (!user) { router.push("/register"); return; }
    if (user.role !== "jobseeker") { router.push("/"); return; }
    
    // Check if script exists, if not create it
    if (!document.querySelector(`script[src="https://checkout.razorpay.com/v1/checkout.js"]`)) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
    
    // Pre-fill
    setFormData(prev => ({ ...prev, name: user.name || "", email: user.email || "" }));
  }, [user]);

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const b64 = await toBase64(e.target.files[0]);
      setFormData(prev => ({ ...prev, photo: b64 }));
    }
  };

  const addQual = () => setFormData(prev => ({ ...prev, qualifications: [...prev.qualifications, { degree: "", institution: "", year: "" }] }));
  const addExp = () => setFormData(prev => ({ ...prev, experience: [...prev.experience, { role: "", company: "", duration: "", description: "" }] }));

  const updateQual = (index: number, field: string, value: string) => {
    const q = [...formData.qualifications];
    (q[index] as any)[field] = value;
    setFormData(prev => ({ ...prev, qualifications: q }));
  };

  const updateExp = (index: number, field: string, value: string) => {
    const e = [...formData.experience];
    (e[index] as any)[field] = value;
    setFormData(prev => ({ ...prev, experience: e }));
  };

  const handleSendOtp = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/resume/send-otp`, { uid: user.uid });
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (e) {
      toast.error("Failed to send OTP.");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/resume/verify-otp`, { uid: user.uid, otp });
      toast.success("OTP verified!");
      setStep(3);
    } catch (e) {
      toast.error("Incorrect or expired OTP.");
    }
  };

  const verifyPayment = async (response: any) => {
    try {
      const skillsArray = formData.skills.split(",").map(s => s.trim()).filter(s => s);
      const payload = {
        uid: user.uid,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        resumeData: { ...formData, skills: skillsArray }
      };
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/resume/verify-payment`, payload);
      toast.success("Payment successful! Resume saved.");
      setStep(4);
    } catch (e) {
      toast.error("Payment verification failed.");
    }
  };

  const openRazorpay = async () => {
    try {
      const orderRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/resume/create-order`);
      const order = orderRes.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "InternArea",
        description: "Resume Builder - ₹50",
        order_id: order.id,
        handler: async (response: any) => {
          await verifyPayment(response);
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: "#2563EB" },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e) {
      toast.error("Failed to initiate payment.");
    }
  };

  const downloadPDF = async () => {
    const element = document.getElementById("resume-preview");
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${formData.name || 'Resume'}.pdf`);
    } catch (e) {
      toast.error("Failed to generate PDF.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-10 px-4">
        
        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold ${step >= s ? 'bg-blue-600' : 'bg-gray-300'}`}>
                {s}
              </div>
              {s < 4 && <div className={`w-12 md:w-32 h-1 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-300'}`}></div>}
            </div>
          ))}
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Resume Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" className="mt-1 w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" className="mt-1 w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input type="tel" className="mt-1 w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Photo</label>
                  <input type="file" accept="image/*" className="mt-1 w-full border rounded-lg p-1.5" onChange={handlePhotoChange} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Professional Summary</label>
                <textarea rows={3} className="mt-1 w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500" value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} />
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-700">Qualifications</h3>
                  <button onClick={addQual} className="text-sm text-blue-600 hover:underline">+ Add More</button>
                </div>
                {formData.qualifications.map((q, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <input placeholder="Degree" className="border rounded p-2" value={q.degree} onChange={e => updateQual(i, 'degree', e.target.value)} />
                    <input placeholder="Institution" className="border rounded p-2" value={q.institution} onChange={e => updateQual(i, 'institution', e.target.value)} />
                    <input placeholder="Year" className="border rounded p-2" value={q.year} onChange={e => updateQual(i, 'year', e.target.value)} />
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-700">Experience</h3>
                  <button onClick={addExp} className="text-sm text-blue-600 hover:underline">+ Add More</button>
                </div>
                {formData.experience.map((ex, i) => (
                  <div key={i} className="space-y-3 mb-4 pb-4 border-b last:border-0 last:mb-0 last:pb-0 border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input placeholder="Role/Title" className="border rounded p-2" value={ex.role} onChange={e => updateExp(i, 'role', e.target.value)} />
                      <input placeholder="Company" className="border rounded p-2" value={ex.company} onChange={e => updateExp(i, 'company', e.target.value)} />
                      <input placeholder="Duration (e.g. 2020-2022)" className="border rounded p-2" value={ex.duration} onChange={e => updateExp(i, 'duration', e.target.value)} />
                    </div>
                    <textarea placeholder="Description of responsibilities..." className="w-full border rounded p-2" rows={2} value={ex.description} onChange={e => updateExp(i, 'description', e.target.value)} />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Skills (comma separated)</label>
                <input type="text" placeholder="React, Node.js, Python, Leadership" className="mt-1 w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} />
              </div>

              <div className="mt-8 flex justify-end">
                <button onClick={handleSendOtp} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                  Verify with OTP
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center py-10 max-w-sm mx-auto">
              <h2 className="text-2xl font-bold mb-2">Verify your email</h2>
              <p className="text-gray-500 mb-6">We sent a 6-digit code to {formData.email}</p>
              <input 
                type="text" 
                maxLength={6} 
                className="w-full text-center text-3xl tracking-widest border-2 border-gray-300 rounded-xl p-4 mb-6 focus:border-blue-500 outline-none" 
                value={otp} 
                onChange={e => setOtp(e.target.value)}
                placeholder="------"
              />
              <button onClick={handleVerifyOtp} className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                Verify OTP
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-10">
              <div className="bg-blue-50 p-6 rounded-2xl max-w-sm mx-auto mb-8 border border-blue-100">
                <h2 className="text-xl font-bold text-blue-900 mb-2">Premium Resume</h2>
                <p className="text-blue-700 mb-6">Generate and download your ATS-friendly professional resume in PDF format.</p>
                <div className="text-4xl font-extrabold text-blue-900">₹50</div>
                <div className="text-sm text-blue-600 mt-1">One-time payment</div>
              </div>
              
              <button onClick={openRazorpay} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition-all inline-flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                <span>Pay with Razorpay</span>
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Resume Generated!</h2>
              <p className="text-gray-500 mb-8">Your premium resume has been successfully created and saved to your profile.</p>
              
              <button onClick={downloadPDF} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all inline-flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                <span>Download PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hidden PDF Preview Container */}
      {step === 4 && (
        <div style={{ position: "absolute", left: "-9999px" }}>
          <div id="resume-preview" className="bg-white p-10 w-[800px] min-h-[1130px] shadow-none text-black font-sans">
            {/* Header Section */}
            <div className="flex items-center space-x-6 border-b-2 border-gray-300 pb-6 mb-6">
              {formData.photo && (
                <img src={formData.photo} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-gray-200" />
              )}
              <div>
                <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-wide">{formData.name}</h1>
                <div className="flex items-center space-x-4 mt-2 text-gray-600">
                  <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>{formData.email}</span>
                  {formData.phone && <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>{formData.phone}</span>}
                </div>
              </div>
            </div>

            {/* Summary */}
            {formData.summary && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-300 pb-1 mb-2">Professional Summary</h2>
                <p className="text-gray-700 leading-relaxed text-sm">{formData.summary}</p>
              </div>
            )}

            {/* Experience */}
            {formData.experience.some(e => e.role || e.company) && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-300 pb-1 mb-3">Work Experience</h2>
                <div className="space-y-4">
                  {formData.experience.filter(e => e.role || e.company).map((ex, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-gray-900">{ex.role}</h3>
                        <span className="text-sm font-medium text-gray-500">{ex.duration}</span>
                      </div>
                      <div className="text-md font-medium text-blue-600 mb-1">{ex.company}</div>
                      <p className="text-gray-700 text-sm">{ex.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Qualifications */}
            {formData.qualifications.some(q => q.degree || q.institution) && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-300 pb-1 mb-3">Education</h2>
                <div className="space-y-3">
                  {formData.qualifications.filter(q => q.degree || q.institution).map((q, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-bold text-gray-900">{q.degree}</h3>
                        <span className="text-sm font-medium text-gray-500">{q.year}</span>
                      </div>
                      <div className="text-gray-700 text-sm">{q.institution}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {formData.skills && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 uppercase border-b border-gray-300 pb-1 mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.split(",").map(s => s.trim()).filter(s => s).map((s, i) => (
                    <span key={i} className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
}
