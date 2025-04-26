const express = require("express");
const cookieParser = require("cookie-parser");
const { checkForAuthenticationCookie } = require("./middleware/authentication");
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const path = require("path");
const mongoose = require('mongoose');
const Blog = require('./models/blog');

require("dotenv").config();

const app = express();
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.set("views", path.resolve("./views"));
app.use(express.static(path.resolve("./public")));

const password = process.env.PASS;
const uri = `mongodb+srv://ansh2109ag:${password}@cluster0.9x9nr.mongodb.net/blogify?retryWrites=true&w=majority`;

mongoose.connect(uri)
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({});
  res.render("home", {
    user: req.user,
    blogs: allBlogs,
  });
});
const port = process.env.PORT || 8001; 
app.listen(port, () => console.log(`Server started at PORT: ${port}`));
