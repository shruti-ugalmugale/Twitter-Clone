// pages/api/posts.js
import { initMongoose } from "@/lib/mongoose";
import Post from "@/models/Post";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import Like from "@/models/Like";
import Bookmark from "@/models/Bookmark";

export default async function handler(req, res) {
    await initMongoose();
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        if (req.method === "GET") {
            const { id, username } = req.query;

            if (id) {
                // ✅ Fetch the single post (ensure it's a parent post)
                const post = await Post.findById(id)
                    .populate("author")
                    .populate({
                        path: "replies",
                        populate: { path: "author" },
                        options: { sort: { createdAt: -1 } },
                    })
                    .lean();

                if (!post) {
                    return res.status(404).json({ error: "Post not found" });
                }

                post.replies = post.replies || [];

                // ✅ Fetch Like and Bookmark Data
                const likedByMe = await Like.exists({ author: session.user.id, post: id });
                const likeCount = await Like.countDocuments({ post: id });
                const bookmarkedByMe = await Bookmark.exists({ user: session.user.id, post: id });

                // ✅ Fetch Likes for Replies
                const replyIds = post.replies.map((r) => r?._id?.toString()).filter(Boolean);
                const repliesLikedByMe = replyIds.length
                    ? await Like.find({ author: session.user.id, post: { $in: replyIds } })
                    : [];

                const replyIdsLikedByMe = repliesLikedByMe.map((like) => like.post.toString());

                // ✅ Attach Like Data to Replies
                post.replies = post.replies.map(reply => ({
                    ...reply,
                    likesCount: reply.likesCount || 0,
                    likedByMe: replyIdsLikedByMe.includes(reply._id.toString()),
                }));

                return res.json({
                    post: {
                        ...post,
                        likedByMe: !!likedByMe,
                        likesCount: likeCount,
                        bookmarkedByMe: !!bookmarkedByMe,
                    }
                });
            } 

            else if (username) {
                // ✅ Fetch only parent posts for Profile Page
                const user = await User.findOne({ username });

                if (!user) {
                    return res.status(404).json({ error: "User not found" });
                }

                const posts = await Post.find({ author: user._id, parent: null })
                    .populate("author")
                    .populate({
                        path: "replies",
                        populate: { path: "author" },
                        options: { sort: { createdAt: -1 } },
                    })
                    .sort({ createdAt: -1 })
                    .lean();

                return res.status(200).json({ posts });
            } 

            else {
                // ✅ Fetch only parent posts for Home Page
                const posts = await Post.find({ parent: null })
                    .populate("author")
                    .populate({
                        path: "replies",
                        populate: { path: "author" },
                        options: { sort: { createdAt: -1 } },
                    })
                    .sort({ createdAt: -1 })
                    .limit(20)
                    .lean();

                const postIds = posts.map((p) => p?._id?.toString()).filter(Boolean);
                const postsLikedByMe = postIds.length
                    ? await Like.find({ author: session.user.id, post: { $in: postIds } })
                    : [];

                const idsLikedByMe = postsLikedByMe.map((like) => like.post.toString());

                // ✅ Attach Like Data to Posts
                const postsWithLikes = posts.map(post => ({
                    ...post,
                    likesCount: post.likesCount || 0,
                    likedByMe: idsLikedByMe.includes(post._id.toString()),
                }));

                return res.status(200).json({ posts: postsWithLikes, idsLikedByMe });
            }
        }

        if (req.method === "POST") {
            const { text, parent } = req.body;

            if (!text) {
                return res.status(400).json({ error: "Text is required" });
            }

            if (parent) {
                // ✅ Create a reply
                const reply = await Post.create({
                    author: session.user.id,
                    text,
                    parent,
                });

                // ✅ Link reply to the parent post (avoiding duplication)
                await Post.findByIdAndUpdate(parent, { $push: { replies: reply._id } });

                return res.json({ reply });
            } else {
                // ✅ Create a new top-level post
                const post = await Post.create({
                    author: session.user.id,
                    text,
                    likesCount: 0,
                });

                return res.json(post);
            }
        }

        return res.status(405).json({ error: "Method Not Allowed" });
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
