import { initMongoose } from "@/lib/mongoose";
import Message from "@/models/Message";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
    await initMongoose();
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: "Username is required" });
    }

    try {
        // Find the receiver (user being messaged)
        const receiver = await User.findOne({ username });

        if (!receiver) {
            return res.status(404).json({ error: "User not found" });
        }

        const userId = session.user.id;

        // Check if a conversation already exists
        const existingConversation = await Message.findOne({
            $or: [
                { sender: userId, receiver: receiver._id },
                { sender: receiver._id, receiver: userId }
            ]
        });

        if (existingConversation) {
            return res.status(200).json({ conversationId: receiver._id });
        }

        // No existing conversation, return receiver's ID as conversation ID
        return res.status(200).json({ conversationId: receiver._id });

    } catch (error) {
        console.error("Error starting conversation:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
