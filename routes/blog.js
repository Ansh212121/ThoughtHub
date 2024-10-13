const { Router } = require("express");
const router = Router();
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const mongoose = require("mongoose");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const User = require('../models/user'); 

// Middleware to check for authentication and user existence
function ensureAuthenticated(req, res, next) {
  if (!req.user) {
    return res.status(401).send("User not authenticated");
  }
  next();
}

// Set up multer storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!req.user) {
      return cb(new Error("User not authenticated"), null);
    }

    const uploadPath = path.resolve(`./public/uploads/${req.user._id}`);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

// Route to render the "Add New Blog" form (Move this above /:id to prevent conflicts)
router.get("/add-new", (req, res) => {
  console.log("Rendering add new blog form");
  return res.render("addBlog", {
      user: req.user,
  });
});

// Route to display a specific blog post by ID
router.get('/:id', async (req, res) => {
  try {
    // Check if the blog exists
    const blog = await Blog.findById(req.params.id).populate('createdBy');
    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    // Fetch comments for the blog
    const comments = await Comment.find({ blogId: req.params.id }).populate("createdBy");
    console.log("comments", comments);
    
    // Pass user and comments to the view
    res.render('blog', { blog, user: req.user, comments });
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return res.status(500).send("Server Error");
  }
});

// Route to handle blog creation
router.post("/", ensureAuthenticated, upload.single("coverImageURL"), async (req, res) => {
  try {
    const { body, title } = req.body;

    // Handle cases where no file is uploaded
    let coverImageURL = null;
    if (req.file) {
      coverImageURL = `/uploads/${req.user._id}/${req.file.filename}`;
    }

    // Create the blog in the database
    const blog = await Blog.create({
      title,
      body,
      createdBy: req.user._id,
      coverImageURL, // Use the file URL if present
    });

    // Redirect to the newly created blog post
    return res.redirect(`/blog/${blog._id}`);
  } catch (error) {
    console.error("Error processing blog post:", error.message);
    return res.status(500).send("Server Error");
  }
});

// Route to handle comment posting
router.post("/comment/:blogId", ensureAuthenticated, async (req, res) => {
  try {
    await Comment.create({
      content: req.body.content,
      blogId: req.params.blogId,
      createdBy: req.user._id,
    });
    return res.redirect(`/blog/${req.params.blogId}`);
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).send("Server Error");
  }
});

module.exports = router;
