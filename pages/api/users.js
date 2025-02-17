//pages/api/users.js
import { initMongoose } from "@/lib/mongoose";
import User from "@/models/User";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import multer from "multer";
import fs from "fs";
import path from "path";
import { promisify } from "util";

// Set up multer for file uploads
const upload = multer({ dest: "public/uploads/" });
const rename = promisify(fs.rename); // Convert callback to Promise

export default async function handler(req, res) {
    await initMongoose();
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method === "PUT") {
        // Handle the upload in a separate function to ensure async completion
        upload.single("image")(req, res, async (err) => {
            if (err) {
                console.error("File upload error:", err);
                return res.status(500).json({ error: "File upload failed" });
            }

            // Ensure req.body has the name field
            const { name } = req.body;
            let imageUrl = null;

            if (req.file) {
                // Rename and move uploaded file to `/public/uploads/`
                const tempPath = req.file.path;
                const ext = path.extname(req.file.originalname);
                const newFilename = `${session.user.id}${ext}`;
                const targetPath = path.join(process.cwd(), "public/uploads", newFilename);

                await rename(tempPath, targetPath);
                imageUrl = `/uploads/${newFilename}`;
            }

            const updateData = {};
            if (name) updateData.name = name;
            if (imageUrl) updateData.image = imageUrl;

            try {
                const updatedUser = await User.findByIdAndUpdate(
                    session.user.id,
                    updateData,
                    { new: true }
                );

                if (!updatedUser) {
                    return res.status(404).json({ error: "User not found" });
                }

                res.status(200).json({ message: "Profile updated", user: updatedUser });
            } catch (error) {
                console.error("Error updating user:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
    } else if (req.method === "GET") {
        const { id, username } = req.query;

        try {
            let user;
            if (id) {
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    return res.status(400).json({ error: "Invalid user ID" });
                }
                user = await User.findById(id);
            } else if (username) {
                user = await User.findOne({ username });
            }

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            res.status(200).json({ user });
        } catch (error) {
            console.error("Error fetching user:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    } else {
        res.status(405).json({ error: "Method Not Allowed" });
    }
}

export const config = {
    api: {
        bodyParser: false, // Required for handling file uploads with multer
    },
};
