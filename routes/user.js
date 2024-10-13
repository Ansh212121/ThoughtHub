const { Router } = require("express");
const User = require("../models/user");

const router = Router();

router.get("/signin", (req, res) => {
  return res.render("signin");
});

router.get("/signup", (req, res) => {
  return res.render("signup");
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  console.log("Sign-in attempt:", { email, password });

  try {
    // Authenticate the user and get the token
    const token = await User.matchPasswordAndGenerateToken(email, password);
    console.log("token", token);

    // Fetch the user object and populate any necessary fields
    const user = await User.findOne({ email }).populate('profile'); // Adjust if you have a profile reference
    if (!user) {
      throw new Error("User not found!");
    }

    // Set the cookie and user in the session
    res.cookie("token", token);
    req.user = user; // Store user object in the request

    // Redirect to the home page
    return res.redirect("/");
  } catch (error) {
    console.error("Error during sign-in:", error.message);
    return res.render("signin", {
      error: "Try again",
    });
  }
});



router.get("/logout",(req,res)=>{
  res.clearCookie("token").redirect("/");
})

router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    // Create the new user
    const newUser = await User.create({ fullName, email, password });
    console.log("New user created:", newUser); // Log the created user

    // Automatically sign in the user after sign-up
    const token = await User.matchPasswordAndGenerateToken(email, password); // Authenticate user
    res.cookie("token", token); // Set the token in the cookie
    req.user = newUser; // Store user object in the request

    return res.redirect("/"); // Redirect to the homepage
  } catch (error) {
    console.error("Error creating user:", error);
    return res.render("signup", { error: "Error creating user." });
  }
});


module.exports = router;
