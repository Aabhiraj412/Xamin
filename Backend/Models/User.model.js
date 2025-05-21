```javascript
import mongoose, { model, Schema } from "mongoose";

// Define the user schema for MongoDB
const userSchema = new Schema(
  {
    // User's full name
    name: {
      type: String,
      required: true,
      trim: true, // Remove whitespace from beginning and end
    },
    // User's phone number
    phone: {
      type: String,
      required: true,
      unique: true, // Ensure phone numbers are unique
    },
    // User's email address
    email: {
      type: String,
      required: true,
      unique: true, // Ensure email addresses are unique
      lowercase: true, // Store emails in lowercase
    },
    // User's Aadhar number (government ID)
    aadhar: {
      type: String,
      required: true,
      unique: true, // Ensure Aadhar numbers are unique
    },
    // User's gender
    gender: {
      type: String,
      enum: ["male", "female", "other"], // Restrict to specific values
      required: true,
    },
    // User's password (should be hashed)
    password: {
      type: String,
      required: true,
    },
    // Array of exams associated with the user
    exams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam", // Reference to the Exam model
      },
    ],
  },
  {
    timestamps: true, // Add createdAt and updatedAt timestamps
  }
);

// Create the User model from the schema
const User = model("User", userSchema);

export default User;
```