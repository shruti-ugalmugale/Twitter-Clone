import { useRouter } from "next/router";
import axios from "axios";
import { Heart, Repeat, MessageCircle, Bookmark, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PostButtons({ likesCount = 0, likedByMe = false, bookmarkedByMe = false, id, authorUsername, repostsCount = 0, repostedByMe = false }) {
    const router = useRouter();
    const [likesCountState, setLikesCount] = useState(likesCount);
    const [repliesCount, setRepliesCount] = useState(0);
    const [isLikedByMe, setLikedByMe] = useState(likedByMe);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isBookmarkedByMe, setIsBookmarkedByMe] = useState(bookmarkedByMe);
    const [isRepostedByMe, setIsRepostedByMe] = useState(repostedByMe);
    const [repostCountState, setRepostCountState] = useState(repostsCount);

    useEffect(() => {
        async function fetchPostData() {
            try {
                const response = await axios.get(`/api/posts?id=${id}`);
                if (response.data.likesCount !== undefined) {
                    setLikesCount(response.data.likesCount);
                }
                setRepliesCount(response.data.post.replies?.length || 0);
                setLikedByMe(response.data.post.likedByMe);
                setIsBookmarkedByMe(response.data.post.bookmarkedByMe);
                setIsRepostedByMe(response.data.post.repostedByMe);
                setRepostCountState(response.data.post.repostsCount || 0);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching post data:", error);
            }
        }
        fetchPostData();
    }, [id]);

    async function toggleLike() {
        try {
            const response = await axios.post("/api/like", { id });
            const isLiked = response.data.isLiked;

            setLikedByMe(isLiked);
            setLikesCount((prev) => (isLiked ? prev + 1 : Math.max(prev - 1, 0)));
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 300);

            if (isLiked) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 1000);
            }
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    }

    async function toggleBookmark() {
        try {
            const response = await axios.post("/api/bookmarks", { id });
            setIsBookmarkedByMe(response.data.isBookmarked);
        } catch (error) {
            console.error("Error toggling bookmark:", error);
        }
    }

    async function toggleRepost() {
        try {
            const response = await axios.post("/api/repost", { id });
            const isReposted = response.data.isReposted;

            setIsRepostedByMe(isReposted);
            setRepostCountState((prev) => (isReposted ? prev + 1 : Math.max(prev - 1, 0)));
        } catch (error) {
            console.error("Error toggling repost:", error);
        }
    }

    function redirectToPost() {
        router.push(`https://twitter-clone-inky-xi.vercel.app/sugalmug/status/${id}`);
    }

    return (
        <div className="w-full py-2">
            <div className="flex justify-between items-center w-full">
                {/* ✅ Reply Button with Correct Redirection */}
                <div className="group flex flex-row items-center cursor-pointer text-gray-500" onClick={redirectToPost}>
                    <div className="p-2 rounded-full group-hover:bg-blue-500/10">
                        <MessageCircle size={24} className="group-hover:text-blue-500" />
                    </div>
                    {repliesCount > 0 && (
                        <span className="text-sm text-gray-400 ml-1 group-hover:text-blue-500">
                            {repliesCount}
                        </span>
                    )}
                </div>

                {/* ✅ Repost Button */}
                <div className="group flex flex-row items-center cursor-pointer text-gray-500" onClick={toggleRepost}>
                    <motion.div
                        className="p-2 rounded-full group-hover:bg-green-500/10"
                        animate={isRepostedByMe ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.2 }}
                    >
                        <Repeat
                            size={24}
                            className={`${
                                isRepostedByMe
                                    ? "text-green-500 fill-green-500"
                                    : "text-gray-500 group-hover:text-green-500"
                            }`}
                        />
                    </motion.div>
                    {repostCountState > 0 && (
                        <span className="text-sm text-gray-400 ml-1 group-hover:text-green-500">
                            {repostCountState}
                        </span>
                    )}
                </div>

                {/* ✅ Like Button with Animation */}
                <div className="relative group flex flex-row items-center cursor-pointer text-gray-500" onClick={toggleLike}>
                    <motion.div
                        className="p-2 rounded-full group-hover:bg-pink-500/10 transition"
                        animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 0.3 }}
                    >
                        {!loading && (
                            <Heart
                                size={24}
                                className={`${
                                    isLikedByMe
                                        ? "text-pink-500 fill-pink-500"
                                        : "text-gray-500 group-hover:text-pink-500"
                                }`}
                            />
                        )}
                    </motion.div>

                    {!loading && likesCountState > 0 && (
                        <span className={`text-sm text-gray-400 ml-1 group-hover:text-pink-500 ${isLikedByMe ? "text-pink-500" : "text-gray-400"}`}>
                            {likesCountState}
                        </span>
                    )}
                </div>

                {/* ✅ Bookmark Button */}
                <div className="group flex flex-col items-center cursor-pointer text-gray-500" onClick={toggleBookmark}>
                    <div className="p-2 rounded-full group-hover:bg-blue-500/10">
                        <Bookmark
                            size={24}
                            className={`${
                                isBookmarkedByMe ? "text-blue-500 fill-blue-500" : "text-gray-500 group-hover:text-blue-500"
                            }`}
                        />
                    </div>
                </div>

                <div className="group flex flex-col items-center cursor-pointer text-gray-500">
                    <div className="p-2 rounded-full group-hover:bg-blue-500/10">
                        <Upload size={24} className="group-hover:text-blue-500" />
                    </div>
                </div>
            </div>
        </div>
    );
}
