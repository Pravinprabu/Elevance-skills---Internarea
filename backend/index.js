require("dotenv").config();
const bodyparser = require("body-parser");
const express = require("express");
const cors = require("cors");

const { connect } = require("./db");
const router = require("./Routes/index");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: function (origin, callback) {
    // 1. Allow server-to-server requests or tools like Postman (where origin is undefined)
    if (!origin) return callback(null, true);

    // 2. Define safe check conditions
    const isLocalhost = origin.startsWith("http://localhost");
    const isVercelApp = origin.includes("vercel.app");
    const isRenderApp = origin.includes("onrender.com");

    // 3. If it matches any of your deployment environments, let it through!
    if (isLocalhost || isVercelApp || isRenderApp) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200 // Forces 200 OK for OPTIONS preflight instead of 204
}));

// Explicit catch-all handler for preflight OPTIONS requests across all routes
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
  res.header("Access-Control-Allow-Credentials", "true");
  return res.sendStatus(200);
});

// Setup your body parsers cleanly
app.use(bodyparser.json({ limit: "50mb" }));
app.use(bodyparser.urlencoded({ extended: true, limit: "50mb" }));

app.get("/", (req, res) => {
  res.send("hello this is internshala backend");
});

app.use("/api", router);

const startServer = async () => {
  try {
    await connect();

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.log(err);
  }
};

startServer();