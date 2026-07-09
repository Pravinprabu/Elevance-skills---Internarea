import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectuser } from "@/Feature/Userslice";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import Navbar from "@/Components/Navbar";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "₹0",
    applications: "1 application/month",
    features: ["Apply to 1 internship per month", "Basic profile", "Community access"],
    color: "border-gray-200",
    buttonColor: "bg-gray-400 cursor-not-allowed",
    popular: false,
  },
  {
    id: "bronze",
    name: "Bronze",
    price: 100,
    priceLabel: "₹100/month",
    applications: "3 applications/month",
    features: ["Apply to 3 internships per month", "Priority listing", "Community access"],
    color: "border-yellow-400",
    buttonColor: "bg-yellow-500 hover:bg-yellow-600",
    popular: false,
  },
  {
    id: "silver",
    name: "Silver",
    price: 300,
    priceLabel: "₹300/month",
    applications: "5 applications/month",
    features: ["Apply to 5 internships per month", "Priority listing", "Resume Builder access", "Community access"],
    color: "border-gray-400",
    buttonColor: "bg-gray-500 hover:bg-gray-600",
    popular: true,
  },
  {
    id: "gold",
    name: "Gold",
    price: 1000,
    priceLabel: "₹1000/month",
    applications: "Unlimited applications",
    features: ["Unlimited internship applications", "Top priority listing", "Resume Builder access", "Community access", "Email support"],
    color: "border-yellow-500",
    buttonColor: "bg-yellow-600 hover:bg-yellow-700",
    popular: false,
  },
];

export default function Plans() {
  const user = useSelector(selectuser);
  const router = useRouter();
  const [subStatus, setSubStatus] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) { router.push("/register"); return; }
    if (user.role !== "jobseeker") { router.push("/"); return; }

    // Load Razorpay script
    if (!document.querySelector(`script[src="https://checkout.razorpay.com/v1/checkout.js"]`)) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }

    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/status/${user.uid}`)
      .then(res => setSubStatus(res.data))
      .catch(() => {});
  }, [user]);

  const handleUpgrade = async (plan: string) => {
    if (plan === "free") return;
    if (subStatus?.plan === plan) {
      toast.info("You are already on this plan.");
      return;
    }

    setLoading(plan);
    try {
      const orderRes = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/subscription/create-order`,
        { uid: user.uid, plan }
      );

      const { order } = orderRes.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "InternArea",
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan — 1 Month`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/api/subscription/verify-payment`,
              {
                uid: user.uid,
                plan,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            );
            toast.success(`Successfully upgraded to ${plan} plan! Invoice sent to your email.`);
            // Refresh status
            const statusRes = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/api/subscription/status/${user.uid}`
            );
            setSubStatus(statusRes.data);
          } catch {
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: "#2563EB" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to initiate payment.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="mt-2 text-gray-500">Choose a plan that fits your internship goals</p>

          {subStatus && (
            <div className="mt-4 inline-block bg-blue-50 border border-blue-200 rounded-lg px-6 py-3">
              <p className="text-blue-800 text-sm">
                Current Plan: <span className="font-bold capitalize">{subStatus.plan}</span>
                {subStatus.plan !== "free" && subStatus.planExpiresAt && (
                  <span className="ml-2 text-blue-600">
                    (expires {new Date(subStatus.planExpiresAt).toLocaleDateString()})
                  </span>
                )}
                <span className="ml-4">
                  Applications this month:{" "}
                  <span className="font-bold">
                    {subStatus.applicationCount} / {subStatus.applicationLimit}
                  </span>
                </span>
              </p>
            </div>
          )}

          <p className="mt-3 text-sm text-amber-600 font-medium">
            ⏰ Payments are only processed between 10:00 AM – 11:00 AM IST
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => {
            const isCurrent = subStatus?.plan === plan.id;
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl border-2 ${plan.color} shadow-sm p-6 flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      POPULAR
                    </span>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      CURRENT
                    </span>
                  </div>
                )}
                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <p className="text-3xl font-extrabold text-gray-900 mt-2">{plan.priceLabel}</p>
                <p className="text-sm text-blue-600 font-medium mt-1">{plan.applications}</p>

                <ul className="mt-4 space-y-2 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={plan.id === "free" || isCurrent || loading === plan.id}
                  className={`mt-6 w-full py-2.5 rounded-xl text-white font-semibold transition-colors ${
                    plan.id === "free" || isCurrent
                      ? "bg-gray-300 cursor-not-allowed"
                      : plan.buttonColor
                  } disabled:opacity-60`}
                >
                  {loading === plan.id
                    ? "Processing..."
                    : isCurrent
                    ? "Current Plan"
                    : plan.id === "free"
                    ? "Default Plan"
                    : `Upgrade to ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
