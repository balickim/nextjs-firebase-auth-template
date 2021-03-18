import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import { readdirSync } from "fs";
const morgan = require("morgan");

require("dotenv").config();

// app
const app = express();

// db
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => console.log(`DB Connected`))
  .catch((err) => console.log("DB connection error ", err));

// middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "2mb" }));

// routes middleware
readdirSync("./routes").map((r) => app.use("/api", require(`./routes/${r}`)));

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
