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
    const token = await User.matchPasswordAndGenerateToken(email, password);
    console.log("token", token);

    const user = await User.findOne({ email }).populate('profile'); 
    if (!user) {
      throw new Error("User not found!");
    }

    res.cookie("token", token);
    req.user = user;
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
    const newUser = await User.create({ fullName, email, password });
    console.log("New user created:", newUser); 
    const token = await User.matchPasswordAndGenerateToken(email, password);
    res.cookie("token", token); 
    req.user = newUser; 

    return res.redirect("/"); 
  } catch (error) {
    console.error("Error creating user:", error);
    return res.render("signup", { error: "Error creating user." });
  }
});


module.exports = router;
