const { Schema } = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name must be enter"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password must be enter"],
      minLength: [8, "Minimum password length is 8 characters"],
    },
    email: {
      type: String,
      required: [true, "Email must be enter"],
      unique: true,
      validate: [validator.isEmail, "Please Enter a valid email"],
    },
    role: {
      type: String,
      require: [true, "Role must be enter"],
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password") || user.isNew) {
    try {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      user.password = hashedPassword;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

module.exports = UserSchema;
