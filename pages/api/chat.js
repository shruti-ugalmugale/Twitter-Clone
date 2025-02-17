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

    if (req.method === "GET") {
        const { receiver } = req.query;

        if (!receiver) {
            return res.status(400).json({ error: "Receiver ID is required" });
        }

        try {
            const messages = await Message.find({
                $or: [
                    { sender: session.user.id, receiver },
                    { sender: receiver, receiver: session.user.id },
                ],
            })
            .populate("sender", "name username image") // ✅ Fetch sender details
            .sort({ createdAt: 1 }) // ✅ Sort by time
            .lean();

            return res.status(200).json(messages || []);
        } catch (error) {
            console.error("Error fetching messages:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    } 
    
    else if (req.method === "POST") {
        const { receiver, text } = req.body;

        if (!receiver || !text.trim()) {
            return res.status(400).json({ error: "Receiver ID and message text are required" });
        }

        try {
            const newMessage = await Message.create({
                sender: session.user.id,
                receiver,
                text,
            });

            // Fetch sender details for the response
            const messageWithSender = await Message.findById(newMessage._id)
                .populate("sender", "name username image")
                .lean();

            return res.status(201).json(messageWithSender);
        } catch (error) {
            console.error("Error sending message:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    return res.status(405).json({ error: "Method Not Allowed" });
}
