import { initMongoose } from "@/lib/mongoose";
import Post from "@/models/Post";
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
        if (req.method === "POST") {
            const { id } = req.body;
            const userId = session.user.id;

            if (!id) {
                return res.status(400).json({ error: "Post ID is required." });
            }

            // Find the post
            const post = await Post.findById(id);
            if (!post) {
                return res.status(404).json({ error: "Post not found." });
            }

            // Check if the user has already reposted it
            const existingRepost = await Post.findOne({ author: userId, parent: id, isRepost: true });

            if (existingRepost) {
                // If the user has already reposted, delete the repost
                await Post.findByIdAndDelete(existingRepost._id);
                // Decrease repost count
                await Post.findByIdAndUpdate(id, { $inc: { repostsCount: -1 } });

                return res.json({ isReposted: false, message: "Repost removed." });
            } else {
                // Create a new repost
                const repost = await Post.create({
                    author: userId,
                    parent: id,
                    text: post.text, // Copying the original post text
                    isRepost: true,
                });

                // Increase repost count
                await Post.findByIdAndUpdate(id, { $inc: { repostsCount: 1 } });

                return res.json({ isReposted: true, repostId: repost._id, message: "Post reposted successfully." });
            }
        }

        return res.status(405).json({ error: "Method Not Allowed" });
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
