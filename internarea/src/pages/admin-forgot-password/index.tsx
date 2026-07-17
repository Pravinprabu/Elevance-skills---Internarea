import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

export default function AdminForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/forgot-password/send-otp`, { email });
      toast.success("OTP sent to your email.");
      setStep(2);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!otp) return;
    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/forgot-password/verify-and-reset`,
        { email, otp }
      );
      setNewPassword(res.data.newPassword);
      setStep(3);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Incorrect or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Admin Password Reset</h2>
        <p className="mt-2 text-center text-sm text-gray-600">For admin accounts only</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 space-y-6">

          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Admin Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="mt-1 w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Enter your registered admin email"
                />
              </div>
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm text-gray-600">OTP sent to <strong>{email}</strong>. Enter it below.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700">OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className="mt-1 w-full border rounded-lg p-2 text-center text-2xl tracking-widest focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="------"
                />
              </div>
              <button
                onClick={handleVerify}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify & Reset Password"}
              </button>
            </>
          )}

          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Password Reset Successful</h3>
              <p className="text-sm text-gray-500">Your new password is shown below. Copy it now — it will not be shown again.</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-lg font-mono font-bold text-gray-900 break-all">{newPassword}</p>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(newPassword); toast.success("Copied!"); }}
                className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
              >
                Copy Password
              </button>
              <button
                onClick={() => router.push("/adminlogin")}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Go to Login
              </button>
            </div>
          )}

          {step !== 3 && (
            <div className="text-center">
              <button onClick={() => router.push("/adminlogin")} className="text-sm text-blue-600 hover:underline">
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
