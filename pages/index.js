// pages/index.js
import UsernameForm from "@/components/UsernameForm";
import useUserInfo from "@/hooks/useUserInfo";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import PostContent from "@/components/PostContent";
import Avatar from "@/components/Avatar";
import LeftSideBar from "@/components/LeftSideBar";
import RightSideBar from "@/components/RightSideBar";
import { useRouter } from "next/router";

export default function Home() {
    const { userInfo, setUserInfo, status: userInfoStatus } = useUserInfo();
    const [text, setText] = useState("");
    const [posts, setPosts] = useState([]);
    const [idsLikedByMe, setIdsLikedByMe] = useState([]);
    const router = useRouter();

    async function fetchPosts() {
        try {
            const response = await axios.get("/api/posts");
            // ✅ Only fetch parent posts
            const parentPosts = response.data.posts.filter(post => !post.parent);

            setPosts(parentPosts);
            setIdsLikedByMe(response.data.idsLikedByMe);
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    }

    useEffect(() => {
        if (userInfo) {
            fetchPosts();
        }
    }, [userInfo]);

    useEffect(() => {
        if (!userInfo && userInfoStatus !== "loading") {
            router.push("/login");
        }
    }, [userInfo, userInfoStatus, router]);

    if (userInfo && !userInfo?.username) {
        return <UsernameForm />;
    }

    if (!userInfo) {
        return null;
    }

    async function handlePostSubmit(e) {
        e.preventDefault();
        await axios.post("/api/posts", { text });
        setText("");
        fetchPosts();
    }

    return (
        <div className="flex min-h-screen bg-black text-twitterWhite px-10">
        <LeftSideBar userInfo={userInfo} setUserInfo={setUserInfo} setPosts={setPosts} />

            <form className="w-1/2 p-4" onSubmit={handlePostSubmit}>
                <div className="border-b border-gray-700 pb-4 mb-4">
                    <div className="flex gap-4">
                        <Avatar src={userInfo?.image} />
                        <div className="grow pl-2">
                            <textarea
                                className="w-full p-2 bg-black text-twitterWhite text-xl focus:outline-none focus:ring-0 overflow-hidden resize-none"
                                value={text}
                                onChange={(e) => {
                                    setText(e.target.value);
                                    e.target.style.height = "auto";
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                }}
                                placeholder="What is happening?!"
                                rows="1"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end mt-2">
                        <button
                            className={`px-5 py-2 rounded-full font-bold text-black ${
                                text.trim() ? "bg-white" : "bg-gray-400 cursor-not-allowed"
                            }`}
                            disabled={!text.trim()}
                        >
                            Post
                        </button>
                    </div>
                </div>

                {/* ✅ Display only top-level posts. Replies are handled inside PostContent.js */}
                <div>
                    {posts.length > 0 &&
                        posts.map((post) => (
                            <div key={post._id} className="border-gray-700 border-b pt-4 pb-4">
                                <PostContent {...post} likedByMe={idsLikedByMe.includes(post._id)} />
                            </div>
                        ))}
                </div>
            </form>

            <RightSideBar />
        </div>
    );
}
