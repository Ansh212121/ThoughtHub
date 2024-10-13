
const express = require("express");
const cookieParser = require("cookie-parser");
const { checkForAuthenticationCookie } = require("./middleware/authentication");
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog"); // Correct path for blog route
const path = require("path");
const app = express();
const port = 8001;
const Blog= require('./models/blog')
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.set("views", path.resolve("./views"));
app.use(express.static(path.resolve("./public")));
const mongoose = require('mongoose');

// Use the URL encoded password
require('dotenv').config();

const password =process.env.pass;
const uri = `mongodb+srv://ansh2109ag:${password}@cluster0.9x9nr.mongodb.net/blogify?retryWrites=true&w=majority`; // Use backticks for template literals

mongoose.connect(uri)
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));
// Home route
app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/user", userRoute);
app.use("/blog", blogRoute);  // Ensure correct use of blog route

app.get("/", async (req, res) => {
  const allBlogs=await Blog.find({});
  
    res.render("home", {
        user: req.user,
        blogs:allBlogs,
    });
});

// Start the server
app.listen(port, () => console.log(`Server started at PORT: ${port}`));
