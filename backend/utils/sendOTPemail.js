const axios = require("axios");

/**
 * Sends an OTP email using EmailJS REST API.
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {number} expiryMinutes - Expiry duration in minutes (default: 15)
 */
const sendOtpEmail = async (email, otp, expiryMinutes = 15) => {
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
  
  const formattedTime = expiresAt.toLocaleTimeString([], { 
    hour: "2-digit", 
    minute: "2-digit" 
  });

  const payload = {
    service_id: process.env.EMAILJS_SERVICE_ID,
    template_id: process.env.EMAILJS_TEMPLATE_ID, // Your common template ID
    user_id: process.env.EMAILJS_PUBLIC_KEY,
    accessToken: process.env.EMAILJS_PRIVATE_KEY,
    template_params: {
      email: email,      // Matches {{email}} in EmailJS
      passcode: otp,     // Matches {{passcode}} in EmailJS
      time: formattedTime // Matches {{time}} in EmailJS
    },
  };

  try {
    await axios.post("https://api.emailjs.com/api/v1.0/email/send", payload, {
      headers: { "Content-Type": "application/json" },
    });
    console.log(`[EmailJS] Common OTP sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ EmailJS Delivery Error:", error.response?.data || error.message);
    throw error;
  }
};

module.exports = sendOtpEmail;