import { initMongoose } from "@/lib/mongoose";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
    await initMongoose();
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { query } = req.query;

    if (!query || query.trim().length === 0) {
        return res.status(400).json({ users: [] }); // Return empty array if no query
    }

    try {
        const users = await User.find({
            username: { $regex: query, $options: "i" }, // Case-insensitive match
            _id: { $ne: session.user.id }, // ✅ Exclude logged-in user
        })
        .limit(5) // Limit results for better UX
        .select("id username name image"); // ✅ Include profile picture

        return res.status(200).json({ users });
    } catch (error) {
        console.error("Error searching users:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
