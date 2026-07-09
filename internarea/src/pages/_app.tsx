import Footer from "@/Components/Fotter";
import axios from "axios";
import Navbar from "@/Components/Navbar";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { store } from "../store/store";
import { Provider, useDispatch } from "react-redux";
import { useEffect } from "react";
import { auth } from "@/firebase/firebase";
import { login, logout } from "@/Feature/Userslice";
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { appWithTranslation } from 'next-i18next/pages';

function App({ Component, pageProps }: AppProps) {
  function AuthListener() {
    const dispatch = useDispatch();
    useEffect(() => {
      // Check for custom admin session first
      const adminSession = localStorage.getItem("adminUser");
      if (adminSession) {
        dispatch(login(JSON.parse(adminSession)));
        return; // Skip Firebase auth check for admins
      }

      const unsubscribe = auth.onAuthStateChanged(async (authuser) => {
        if (authuser) {
          try {
            const res = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/api/user/${authuser.uid}?email=${authuser.email}`
            );
            dispatch(
              login({
                uid: authuser.uid,
                name: authuser.displayName,
                email: authuser.email,
                photo: authuser.photoURL || res.data.photo,
                role: res.data.role,
                plan: res.data.plan,
              })
            );
          } catch (error: any) {
            if (error?.response?.status === 403) {
              toast.error(error.response.data.error);
              await auth.signOut();
            }
            dispatch(logout());
          }
        } else {
          dispatch(logout());
        }
      });
      return () => unsubscribe();
    }, [dispatch]);
    return null;
  }

  return (
    <Provider store={store}>
      <AuthListener />
      <div className="bg-white">
        <ToastContainer/>
        <Navbar />
        <Component {...pageProps} />
        <Footer />
      </div>
    </Provider>
  );
}

export default appWithTranslation(App);
