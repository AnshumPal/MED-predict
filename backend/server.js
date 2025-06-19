const express = require("express");
const mongoose = require('mongoose')
const cors = require("cors");
const connectDB = require("./db");
const authRoutes = require("./routes/auth");
const fs = require("fs");
const https = require('https');
require("dotenv").config();

const app = express();
connectDB();

app.use(express.json());
app.use(cors());
app.use("/auth", authRoutes);



const options = {
  key: fs.readFileSync("localhost-key.pem"),
  cert: fs.readFileSync("localhost.pem"),
};

https.createServer(options, app).listen(5000, () => {
  console.log("✅ Secure Server running on port 5000 (HTTPS)");
});

