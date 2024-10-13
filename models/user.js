  const { Schema, model } = require("mongoose");
  const { randomBytes, createHmac } = require("crypto");
  const { createTokenforUser } = require("../services/authentication");

  const userSchema = new Schema(
    {
      fullName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      salt: {
        type: String,
      },
      password: {
        type: String,
        required: true,
      },
      profile: {
        type: Schema.Types.ObjectId,
        ref: 'Profile', // Assuming you have a Profile model
      },
      profileImageURL: {
        type: String,
        default: "./public/images/th.jpg",
      },
      role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER",
      },
    },
    { timestamps: true }
  );

  userSchema.pre("save", function (next) {
    const user = this;

    if (!user.isModified("password")) return next();

    const salt = randomBytes(16).toString("hex");
    const hashedPassword = createHmac("sha256", salt)
      .update(user.password)
      .digest("hex");

    user.salt = salt;
    user.password = hashedPassword;

    next();
  });

  // Correctly defining the static method
  userSchema.statics.matchPasswordAndGenerateToken = async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) throw new Error("User not found!");

    const salt = user.salt;
    const hashedPassword = user.password;
    const userProvidedHash = createHmac("sha256", salt)
      .update(password)
      .digest("hex");

    if (hashedPassword !== userProvidedHash) throw new Error("Incorrect password");

    // Return a new object without sensitive information
    const token=createTokenforUser(user);
    return token;
  };

  const User = model("User", userSchema);

  module.exports = User;
