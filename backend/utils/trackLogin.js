const UAParser = require("ua-parser-js");
const LoginHistory = require("../Model/LoginHistory");

async function trackLogin(req, { userId, email, role }) {
  const parser = new UAParser(req.headers["user-agent"]);
  const result = parser.getResult();

  const browser = result.browser.name || "Unknown";
  const os = result.os.name || "Unknown";
  let deviceType = result.device.type || "desktop"; // ua-parser returns undefined for desktop
  if (!result.device.type) deviceType = "desktop";

  const ipAddress =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

  let status = "allowed";
  let blockReason = "";

  // Rule 1: Mobile login only allowed 10:00 AM - 1:00 PM
  if (deviceType === "mobile") {
    const hour = new Date().getHours();
    if (hour < 10 || hour >= 13) {
      status = "blocked";
      blockReason = "Mobile login only allowed between 10:00 AM and 1:00 PM";
    }
  }

  await LoginHistory.create({
    userId,
    email,
    role,
    browser,
    os,
    deviceType,
    ipAddress,
    status,
    blockReason,
  });

  return { status, blockReason, browser, deviceType };
}

module.exports = trackLogin;
