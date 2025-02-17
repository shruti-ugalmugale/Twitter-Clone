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

    try {
        if (req.method === "GET") {
            const userId = session.user.id;

            // ✅ Find distinct conversation partners (sender or receiver)
            const conversations = await Message.aggregate([
                {
                    $match: { 
                        $or: [{ sender: userId }, { receiver: userId }] 
                    }
                },
                {
                    $group: {
                        _id: {
                            sender: "$sender",
                            receiver: "$receiver"
                        }
                    }
                }
            ]);

            // ✅ Extract unique user IDs
            const userIds = new Set();
            conversations.forEach(conv => {
                userIds.add(conv._id.sender.toString());
                userIds.add(conv._id.receiver.toString());
            });
            userIds.delete(userId); // Remove self

            // ✅ Fetch user details for each conversation partner
            const users = await User.find({ _id: { $in: Array.from(userIds) } }, "id name username");

            return res.status(200).json(users);
        }

        return res.status(405).json({ error: "Method Not Allowed" });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
