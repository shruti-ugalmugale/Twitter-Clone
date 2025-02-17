import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import LeftSideBar from "@/components/LeftSideBar";
import RightSideBar from "@/components/RightSideBar";
import useUserInfo from "@/hooks/useUserInfo";

export default function NewChat() {
    const { userInfo } = useUserInfo();
    const [username, setUsername] = useState("");
    const router = useRouter();
    
    async function startConversation(selectedUsername) {
        if (!selectedUsername) return;
    
        try {
            const response = await axios.post("/api/start-chat", { username: selectedUsername });
            router.push(`/chat/${response.data.conversationId}`); // ✅ Redirect to chat page
        } catch (error) {
            console.error("Error starting conversation:", error);
        }
    }
    

    return (
        <div className="flex min-h-screen bg-black text-white">
            <LeftSideBar userInfo={userInfo} />

            <div className="flex-1 max-w-2xl mx-auto p-4 flex flex-col items-center justify-center text-center">
                <h1 className="text-2xl font-bold mb-4">Start a New Message</h1>
                <input
                    type="text"
                    placeholder="Enter username..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full max-w-md p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={startConversation}
                    className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full text-lg font-semibold hover:bg-blue-600 transition"
                >
                    Start Chat
                </button>
            </div>

            <RightSideBar />
        </div>
    );
}
