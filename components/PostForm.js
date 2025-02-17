//components/PostForm.js
import { useState } from "react";
import Avatar from "./Avatar";
import useUserInfo from "@/hooks/useUserInfo";
import axios from "axios";

export default function PostForm({ compact = false, parent, placeholder, onPost }) {
    const { userInfo } = useUserInfo();
    const [text, setText] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        if (!text.trim()) return;

        await axios.post("/api/posts", { text, parent });
        setText("");
        if (onPost) onPost();
    }

    const getTimeAgo = () => {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " · " +
            now.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
    };

    return (
        <form onSubmit={handleSubmit} className="border-b border-gray-700 pt-2 pb-4 flex gap-4 items-start w-full">
            <Avatar src={userInfo?.image} />
            <div className="flex flex-col w-full">
                {/* User Info and Timestamp */}
                <div className="flex items-center gap-2 flex-wrap w-full">
                    <span className="font-semibold">{userInfo?.name}</span>
                    <span className="text-gray-400">@{userInfo?.username}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-500">{getTimeAgo()}</span>
                </div>

                {/* Text Input */}
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-black text-white text-lg border-none outline-none placeholder-gray-500 resize-none overflow-hidden p-2"
                    rows="1"
                />

                {/* Submit Button */}
                <div className="w-full flex justify-end mt-2">
                    <button
                        type="submit"
                        className={`px-5 py-2 rounded-full font-bold ${
                            text.trim() ? "bg-white text-black" : "bg-gray-400 cursor-not-allowed text-black"
                        }`}
                        disabled={!text.trim()}>
                        Reply
                    </button>
                </div>
            </div>
        </form>
    );
}
