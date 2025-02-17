import { initMongoose } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import Bookmark from "@/models/Bookmark";
import Post from "@/models/Post";

export default async function handler(req, res) {
    await initMongoose();
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = session.user.id;

    if (req.method === "GET") {
        try {
            // ✅ Fetch only bookmarks saved by the logged-in user
            const bookmarks = await Bookmark.find({ user: userId })
                .populate({
                    path: "post",
                    populate: [
                        { path: "author", select: "name username image" }, // ✅ Fetch post author
                        {
                            path: "replies",
                            populate: { path: "author", select: "name username image" }, // ✅ Fetch replies' author
                        }
                    ],
                });

            // ✅ Filter out any replies that have no author (deleted users)
            const savedPosts = bookmarks
                .map((bookmark) => {
                    if (!bookmark.post) return null; // Skip deleted posts
                    return {
                        ...bookmark.post.toObject(),
                        replies: bookmark.post.replies.filter(reply => reply.author), // ✅ Remove replies without author
                    };
                })
                .filter(Boolean); // Remove null values

            return res.status(200).json({ bookmarks: savedPosts });
        } catch (error) {
            console.error("Error fetching bookmarks:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    else if (req.method === "POST") {
        const { id: postId } = req.body;

        if (!postId) {
            return res.status(400).json({ error: "Post ID is required" });
        }

        try {
            // ✅ Check if the post is already bookmarked by the user
            const existingBookmark = await Bookmark.findOne({ user: userId, post: postId });

            if (existingBookmark) {
                // ✅ Remove bookmark
                await Bookmark.findByIdAndDelete(existingBookmark._id);
                return res.status(200).json({ isBookmarked: false });
            } else {
                // ✅ Add new bookmark
                await Bookmark.create({ user: userId, post: postId });
                return res.status(200).json({ isBookmarked: true });
            }
        } catch (error) {
            console.error("Error toggling bookmark:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    else {
        return res.status(405).json({ error: "Method Not Allowed" });
    }
}
