//pages/api/like.js
import { initMongoose } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import Like from "@/models/Like";
import Post from "@/models/Post";

async function updateLikesCount(postId){
    const post = await Post.findById(postId);
    if (!post) return;
    const likes = await Like.countDocuments({post:postId});
    post.likesCount = likes;
    await post.save();
}

export default async function handle(req, res){
    await initMongoose();
    const { id: postId } = req.body; 
    const session = await getServerSession(req, res, authOptions);
    const userId = session.user.id;
    const existingLike = await Like.findOne({ author: userId, post: postId });
    if (existingLike) {
        await existingLike.deleteOne(); 
        await updateLikesCount(postId);
        return res.json({ isLiked: false });
    } else {
        const like = await Like.create({ author: userId, post: postId });
        await updateLikesCount(postId);
        return res.json({ isLiked: true });
        }
    
}