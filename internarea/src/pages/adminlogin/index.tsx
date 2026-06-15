import axios from "axios";
import { User, Lock } from "lucide-react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { login } from "@/Feature/Userslice";

const index = () => {
  const [formadata, setformadata] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();
  const dispatch = useDispatch();
  const [isloading, setisloading] = useState(false);
  const handlechange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setformadata((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handlesubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formadata.email || !formadata.password) {
      toast.error("Please fill in all detials");
      return;
    }
    try {
      setisloading(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/adminlogin`,
        formadata
      );
      dispatch(
        login({
          uid: res.data.user._id,
          name: res.data.user.name,
          email: res.data.user.email,
          role: res.data.user.role,
        })
      );
      localStorage.setItem("adminUser", JSON.stringify({
        uid: res.data.user._id,
        name: res.data.user.name,
        email: res.data.user.email,
        role: res.data.user.role,
      }));
      toast.success("logged in successfuly");
      router.push("/adminpanel");
    } catch (error) {
      toast.error("Invalid credentials");
    } finally {
      setisloading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Admin Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Access the admin dashboard to manage internships and applications
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handlesubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formadata.email}
                  onChange={handlechange}
                  className="block w-full text-black pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formadata.password}
                  onChange={handlechange}
                  className="block w-full text-black pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={isloading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isloading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  " Sign in"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default index;
