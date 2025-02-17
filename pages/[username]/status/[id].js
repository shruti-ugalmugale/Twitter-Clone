//pages/[username]/status/[id].js
import LeftSideBar from "@/components/LeftSideBar";
import PostContent from "@/components/PostContent";
import RightSideBar from "@/components/RightSideBar";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useUserInfo from "@/hooks/useUserInfo";
import { ArrowLeft } from "lucide-react";
import PostForm from "@/components/PostForm";

export default function PostPage() {
    const router = useRouter();
    const { id } = router.query;
    const [post, setPost] = useState(null);
    const { userInfo, status: userInfoStatus } = useUserInfo();

    async function fetchPost() {
        if (!id) return;
        try {
            const response = await axios.get(`/api/posts?id=${id}`);
            setPost(response.data.post);
        } catch (error) {
            console.error("Error fetching post:", error);
        }
    }

    useEffect(() => {
        if (id) {
            fetchPost();
        }
    }, [id]);

    if (userInfoStatus === "loading") {
        return (
            <div className="flex justify-center items-center h-screen w-full bg-black">
                <img src="/twitter.png" alt="Loading..." className="w-16 h-16 animate-pulse" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-black text-white">
            <LeftSideBar userInfo={userInfo} />
            <main className="w-3/5 p-4">
                <div className="flex items-center gap-6 mb-4">
                    <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-800">
                        <ArrowLeft size={24} />
                    </button>
                    <span className="text-xl font-bold">Post</span>
                </div>

                {post ? (
                    <>
                        <PostContent {...post} big />

                        <PostForm 
                            compact={false} 
                            parent={post._id} 
                            placeholder="Post your reply" 
                            onPost={fetchPost}
                        />

                        {post.replies?.length > 0 && (
                            <div className="mt-4">
                                {post.replies.map((reply) => (
                                    <div key={reply._id} className="border-gray-700 border-b pt-2 pb-4 flex gap-4 items-start">
                                        <PostContent {...reply} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-gray-400 text-center">Post not found.</p>
                )}
            </main>

            <RightSideBar />
        </div>
    );
}
