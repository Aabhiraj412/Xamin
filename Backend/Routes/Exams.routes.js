import express from "express";
import Exam from "../Models/Exam.models.js";
import crypto from "crypto";
import fs from "fs";
import multer from "multer";
import shamir from "shamirs-secret-sharing";
const router = express.Router();

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import User from "../Models/User.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

router.post("/create", async (req, res) => {
    const { name, admin, date, duration } = req.body;
    try {
        if (!name || !admin || !date || !duration) {
            return res.status(400).json({
                status: "failure",
                message: "All fields are required",
            });
        }
        const newExam = await Exam.create({ name, admin, date, duration });
        const user = await User.findById(admin)
        user.exams.push(newExam._id)
        await user.save()
        await newExam.save();
        res.status(201).json({
            status: "success",
            message: "Exam successfully created",
        });
    } catch (err) {
        res.status(500).json({
            status: "failure",
            message: "Something went wrong!",
            error: err.message,
        });
    }
});

router.post("/add/b_members", async (req, res) => {
    try {
        const { ExamId } = req.body;
        const exam = await Exam.findById(ExamId);
        if (!exam) {
            return res
                .status(404)
                .json({ status: "failure", message: "Exam not found!" });
        }
        const { b_members } = req.body;
        b_members.map((member) => exam.b_members.push(member));
        await exam.save();
        res.status(200).json({
            status: "success",
            message: "Board members added successfully!",
        });
    } catch (err) {
        res.status(500).json({
            status: "failure",
            message: "Something went wrong!",
            error: err.message,
        });
    }
});

router.post("/add/paper", async (req, res) => {
    try {
        const { ExamId } = req.body;
        const exam = await Exam.findById(ExamId);
        if (!exam) {
            return res
                .status(404)
                .json({ status: "failure", message: "Exam not found!" });
        }
        const { paper } = req.body;
        exam.papers.push(paper);
        await exam.save();
        res.status(200).json({
            status: "success",
            message: "Paper added successfully!",
        });
    } catch (err) {
        res.status(500).json({
            status: "failure",
            message: "Something went wrong!",
            error: err.message,
        });
    }
});

export const upload = multer({ dest: "uploads/" });
const IV_LENGTH = 16;

const TOTAL_PARTS = 5; // Number of board members
const MINIMUM_PARTS = 2;

router.post("/upload-final-paper", upload.single("file"), async (req, res) => {
    try {
        const { ExamId } = req.body;
        const exam = await Exam.findById(ExamId);

        if (!exam) {
            return res.status(404).json({
                status: "failure",
                message: "Exam not found!",
            });
        }

        const filePath = req.file.path;

        // ✅ Step 1: Read PDF and convert to binary
        const pdfData = fs.readFileSync(filePath);

        // ✅ Step 2: Generate Encryption Key and IV
        const ENCRYPTION_KEY = crypto.randomBytes(32); // 256-bit key
        const iv = crypto.randomBytes(IV_LENGTH);

        // ✅ Step 3: Encrypt binary data with AES-256
        const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);

        let encrypted = cipher.update(pdfData);
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        // ✅ Step 4: Save the encrypted binary file
        const encryptedFilePath = `encrypted/${Date.now()}-${crypto.randomInt(999999)}-encrypted.bin`;
        const absoluteEncryptedPath = join(__dirname, `../${encryptedFilePath}`);

        // ✅ Use async write
        await fs.promises.writeFile(absoluteEncryptedPath, Buffer.concat([iv, encrypted]));

        // ✅ Step 5: Split the encryption key into Shamir shards
        const shards = shamir.split(ENCRYPTION_KEY, {
            shares: TOTAL_PARTS,
            threshold: MINIMUM_PARTS,
        });

        const boardMembers = (await exam.populate("b_members")).b_members;

        const distributedKeys = boardMembers.map((member, index) => ({
            memberId: member._id,
            name: member.name,
            keyShard: shards[index].toString("base64"),
            sequence: index + 1,
        }));

        // ✅ Step 6: Store the encrypted file path and key shards
        exam.f_paper.push(encryptedFilePath);
        exam.keyParts = distributedKeys;
        exam.encryptionKey = ENCRYPTION_KEY.toString("base64"); 
        await exam.save();

        // ✅ Clean up temporary uploaded file
        fs.unlinkSync(filePath);

        res.status(200).json({
            message: "File encrypted successfully",
            file: encryptedFilePath,
        });

    } catch (error) {
        console.error("Encryption failed:", error);
        res.status(500).json({
            status: "failure",
            message: "Encryption failed",
            error: error.message,
        });
    }
});

// ============================
// 🔓 DECRYPTION ROUTE
// ============================
router.post("/decrypt", async (req, res) => {
    try {
        const { examId, keyShards } = req.body;

        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({
                status: "failure",
                message: "Exam not found!",
            });
        }

        const filePath = exam.f_paper[exam.f_paper.length - 1];

        // ✅ Retrieve the encrypted file path
        const encryptedFilePath = join(__dirname, `../${filePath}`);

        if (!fs.existsSync(encryptedFilePath)) {
            return res.status(404).json({
                status: "failure",
                message: "Encrypted file not found!",
            });
        }

        const encryptedData = fs.readFileSync(encryptedFilePath);

        // ✅ Extract IV and content
        const iv = encryptedData.slice(0, IV_LENGTH);
        const encryptedContent = encryptedData.slice(IV_LENGTH);

        // ✅ Combine key shards
        const sortedShards = keyShards
            .sort((a, b) => a.sequence - b.sequence)
            .map((shard) => Buffer.from(shard.keyShard, "base64"));

        const reconstructedKey = shamir.combine(sortedShards);

        if (!reconstructedKey || reconstructedKey.length !== 32) {
            console.error("Invalid reconstructed key:", reconstructedKey);
            return res.status(400).json({
                status: "failure",
                message: "Key reconstruction failed or invalid length",
            });
        }

        // ✅ Decrypt the content
        const decipher = crypto.createDecipheriv("aes-256-cbc", reconstructedKey, iv);

        let decrypted = decipher.update(encryptedContent);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        // ✅ Save the decrypted PDF
        const pdfFilePath = `decrypted/${Date.now()}-decrypted.pdf`;
        const decryptedFilePath = join(__dirname, `../${pdfFilePath}`);

        // ✅ Store the decrypted file path in the database
        exam.decryptedPaper = pdfFilePath; 
        await exam.save();

        await fs.promises.writeFile(decryptedFilePath, decrypted);

        // ✅ Send the decrypted PDF
        res.status(200).sendFile(decryptedFilePath);

    } catch (error) {
        console.error("Decryption failed:", error);
        res.status(500).json({
            status: "failure",
            message: "Decryption failed",
            error: error.message,
        });
    }
});


export default router;
