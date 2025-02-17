import mongoose, { Schema, model, models } from "mongoose";

const BookmarkSchema = new Schema({
    user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    post: { type: mongoose.Types.ObjectId, ref: "Post", required: true }
}, { timestamps: true });

const Bookmark = models.Bookmark || model("Bookmark", BookmarkSchema);

export default Bookmark;
