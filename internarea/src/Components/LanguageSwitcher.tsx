import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { selectuser } from '@/Feature/Userslice';
import { Globe } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'hi', name: 'Hindi' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'fr', name: 'French' }
];

const LanguageSwitcher = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const user = useSelector(selectuser);
  const [isOpen, setIsOpen] = useState(false);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.email) {
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0 && otpSent) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft, otpSent]);

  const changeLanguage = (langCode: string) => {
    setIsOpen(false);
    if (langCode === 'fr') {
      setShowModal(true);
      setOtpSent(false);
      setOtp('');
      setTimeLeft(0);
    } else {
      router.push(router.pathname, router.asPath, { locale: langCode });
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/language/send-otp`, { email });
      if (res.data.success) {
        setOtpSent(true);
        setTimeLeft(120); // 2 minutes
        toast.success('OTP sent to your email');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/language/verify-otp`, { email, otp });
      if (res.data.success) {
        toast.success('Language changed to French');
        setShowModal(false);
        router.push(router.pathname, router.asPath, { locale: 'fr' });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Incorrect or expired code');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentLang = languages.find(l => l.code === router.locale) || languages[0];

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md transition-colors"
      >
        <Globe size={20} />
        <span className="hidden sm:inline">{currentLang.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`block w-full text-left px-4 py-2 text-sm ${router.locale === lang.code ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 max-w-full">
            <h2 className="text-xl font-bold mb-4">{t("Verify to switch to French", "Verify to switch to French")}</h2>
            
            {!otpSent ? (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  {t("Please verify your email to switch the language to French.", "Please verify your email to switch the language to French.")}
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("Enter your email", "Enter your email")}
                  readOnly={!!(user && user.email)}
                  className={`w-full border border-gray-300 rounded-md px-3 py-2 mb-4 ${user && user.email ? 'bg-gray-100' : ''}`}
                />
                <div className="flex justify-end space-x-2">
                  <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
                    {t("Cancel", "Cancel")}
                  </button>
                  <button onClick={handleSendOtp} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                    {loading ? t("Sending...", "Sending...") : t("Send Code", "Send Code")}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  {t("Enter the 6-digit code sent to", "Enter the 6-digit code sent to")} {email}.
                </p>
                <div className="mb-4">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder={t("Enter OTP", "Enter OTP")}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2 text-center text-lg tracking-widest"
                    disabled={timeLeft === 0}
                  />
                  <div className="flex justify-between items-center text-sm">
                    {timeLeft > 0 ? (
                      <span className="text-blue-600 font-mono">{formatTime(timeLeft)}</span>
                    ) : (
                      <span className="text-red-500">{t("Code expired", "Code expired")}</span>
                    )}
                    
                    {timeLeft === 0 && (
                      <button onClick={handleSendOtp} disabled={loading} className="text-blue-600 hover:underline">
                        {t("Resend", "Resend")}
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-4">
                  <button onClick={() => { setShowModal(false); setOtpSent(false); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
                    {t("Cancel", "Cancel")}
                  </button>
                  <button onClick={handleVerifyOtp} disabled={loading || timeLeft === 0} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                    {loading ? t("Verifying...", "Verifying...") : t("Verify", "Verify")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
