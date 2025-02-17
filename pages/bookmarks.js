import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";
import PostContent from "@/components/PostContent";
import LeftSideBar from "@/components/LeftSideBar";
import RightSideBar from "@/components/RightSideBar";
import useUserInfo from "@/hooks/useUserInfo";

export default function Bookmarks() {
    const router = useRouter();
    const { userInfo } = useUserInfo();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchBookmarks() {
            try {
                const response = await axios.get("/api/bookmarks");
                setBookmarks(response.data.bookmarks || []);
            } catch (error) {
                console.error("Error fetching bookmarks:", error);
                setError("Failed to fetch bookmarks");
            } finally {
                setLoading(false);
            }
        }

        if (userInfo) {
            fetchBookmarks();
        }
    }, [userInfo]); // ✅ Refetch bookmarks when userInfo changes

    if (loading) return <p className="text-white">Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="flex min-h-screen bg-black text-white">
            {/* ✅ Left Sidebar */}
            <LeftSideBar userInfo={userInfo} />

            {/* ✅ Main Content */}
            <div className="flex-1 max-w-2xl mx-auto p-4">
                {/* ✅ Back Button */}
                <div className="flex items-center mb-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center p-2 rounded-full bg-transparent hover:bg-gray-700 transition"
                    >
                        <ArrowLeft size={24} className="text-white" />
                    </button>
                </div>

                <h1 className="text-xl font-bold mb-4">Bookmarks</h1>

                {bookmarks.length > 0 ? (
                    bookmarks.map((post, index) => (
                        <div key={post._id} className="mb-4">
                            <PostContent {...post} />

                            {/* ✅ Show Replies Only if They Have an Author */}
                            {post.replies.length > 0 && (
                                <div className="ml-12 border-l-2 border-gray-700 pl-4 mt-2">
                                    {post.replies
                                        .filter(reply => reply.author) // ✅ Ensure reply has author data
                                        .map((reply) => (
                                            <PostContent key={reply._id} {...reply} />
                                        ))}
                                </div>
                            )}

                            {index < bookmarks.length - 1 && <hr className="my-4 border-gray-700" />}
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400 text-center mt-10">No bookmarks yet.</p>
                )}
            </div>

            {/* ✅ Right Sidebar */}
            <RightSideBar />
        </div>
    );
}
