require("dotenv").config();
const bodyparser = require("body-parser");
const express = require("express");
const cors = require("cors");

const { connect } = require("./db");
const router = require("./Routes/index");

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyparser.json({ limit: "50mb" }));
app.use(bodyparser.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json());

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