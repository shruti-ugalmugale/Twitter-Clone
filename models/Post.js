//models/Post.js
import mongoose, { Schema, model, models } from "mongoose";

const PostSchema = new Schema({
    author: { type: mongoose.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    likesCount: { type: Number, default: 0 },
    parent: { type: mongoose.Types.ObjectId, ref: 'Post', default: null }, // ✅ Reference to parent post for replies
    replies: [{ type: mongoose.Types.ObjectId, ref: 'Post' }], // ✅ Store replies as an array
    isRepost: { type: Boolean, default: false }, // ✅ New field to track reposts
    repostsCount: { type: Number, default: 0 }, // ✅ Track how many times a post is reposted
}, { timestamps: true });

const Post = models?.Post || model('Post', PostSchema);
export default Post;
