```javascript
import express from "express";
const router = express.Router();
import Student from "../Models/Student.model.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

// Get the current filename and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Route for student registration
router.post("/register", async (req, res) => {
    const { name, phone, email, aadhar, gender, password, examId, roll_no } =
        req.body;

    try {
        // Validate required fields
        if (
            !name ||
            !phone ||
            !email ||
            !aadhar ||
            !gender ||
            !password ||
            !roll_no
        ) {
            return res.status(400).json({
                status: "failure",
                message: "All fields are required.",
            });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new student
        const newStudent = await Student.create({
            name,
            phone,
            email,
            aadhar,
            gender,
            password: hashedPassword,
            roll_no,
        });

        // Add the exam ID to the student's exams array
        newStudent.exams.push(examId);
        await newStudent.save();

        // Respond with success message
        res.status(201).json({
            status: "success",
            message: "Student was successfully added!",
        });
    } catch (error) {
        // Handle errors
        res.status(500).json({
            status: "failure",
            message: "Something went wrong",
            error: error.message,
        });
    }
});

// Route for student login
router.post("/login", async (req, res) => {
    const { roll_no, password } = req.body;

    try {
        // Find the student by roll number and populate exams
        const foundStudent = await Student.findOne({ roll_no }).populate(
            "exams"
        );

        // Check if student exists
        if (!foundStudent) {
            return res
                .status(404)
                .json({ status: "failure", message: "Student not found." });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, foundStudent.password);
        if (!isMatch) {
            return res
                .status(401)
                .json({ status: "failure", message: "Incorrect password." });
        }

        // Get the decrypted paper (assuming it's the second exam in the array)
        const decryptedPaper = foundStudent.exams[1]?.decryptedPapers; // Added optional chaining

        // Check if paper exists
        if (!decryptedPaper) {
            return res
                .status(404)
                .json({ status: "failure", message: "Paper not found." });
        }

        // Construct the paper path
        const paperPath = path.join(__dirname, `../${decryptedPaper}`);

        // Send the paper file
        res.status(200).sendFile(paperPath);
    } catch (error) {
        // Handle errors
        res.status(500).json({
            status: "failure",
            message: "Something went wrong",
            error: error.message,
        });
    }
});

// Route to add a paper to a student
router.post("/add-paper", async (req, res) => {
    const { examId, studentId } = req.body;

    try {
        // Find the student by ID
        const foundStudent = await Student.findById(studentId);

        // Check if student exists
        if (!foundStudent) {
            return res
                .status(404)
                .json({ status: "failure", message: "Student not found." });
        }

        // Add the exam ID to the student's exams array
        foundStudent.exams.push(examId);
        await foundStudent.save();

        // Respond with success message
        res.status(200).json({
            status: "success",
            message: "Paper added successfully!",
        });
    } catch (error) {
        // Handle errors
        res.status(500).json({
            status: "failure",
            message: "Something went wrong",
            error: error.message,
        });
    }
});

export default router;
```