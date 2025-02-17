import { useState, useEffect } from "react"; 
import { useRouter } from "next/router";
import axios from "axios";
import LeftSideBar from "@/components/LeftSideBar";
import RightSideBar from "@/components/RightSideBar";
import useUserInfo from "@/hooks/useUserInfo";
import Image from "next/image";

export default function NewChat() {
    const { userInfo } = useUserInfo();
    const [username, setUsername] = useState("");
    const [suggestions, setSuggestions] = useState([]); // Stores username suggestions
    const router = useRouter();

    useEffect(() => {
        async function fetchSuggestions() {
            if (username.trim().length === 0) {
                setSuggestions([]);
                return;
            }

            try {
                const response = await axios.get(`/api/search-users?query=${username}`);
                setSuggestions(response.data.users);
            } catch (error) {
                console.error("Error fetching user suggestions:", error);
            }
        }

        const delayDebounce = setTimeout(fetchSuggestions, 300); // Debounce API calls

        return () => clearTimeout(delayDebounce); // Cleanup timeout
    }, [username]);

    async function startConversation(selectedUsername) {
        if (!selectedUsername) return;

        try {
            const response = await axios.post("/api/start-chat", { username: selectedUsername });
            router.push(`/chat/${response.data.conversationId}`);
        } catch (error) {
            console.error("Error starting conversation:", error);
        }
    }

    return (
        <div className="flex min-h-screen bg-black text-white">
            <LeftSideBar userInfo={userInfo} />

            <div className="flex-1 max-w-2xl mx-auto p-4 flex flex-col items-center justify-center text-center">
                <h1 className="text-2xl font-bold mb-4">Start a New Message</h1>

                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Enter username..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full max-w-md p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Suggestions Dropdown */}
                {suggestions.length > 0 && (
                    <div className="w-full max-w-md bg-gray-800 border border-gray-600 rounded-lg mt-2 shadow-lg">
                        {suggestions.map((user) => (
                            <div
                                key={user.id}
                                className="p-2 cursor-pointer hover:bg-gray-700 flex items-center gap-3"
                                onClick={() => startConversation(user.username)}
                            >
                                {/* ✅ Display Profile Picture */}
                                <Image
                                    src={user.image || "/default-avatar.png"}
                                    alt="Profile"
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                />

                                <div className="flex flex-col text-left">
                                    <span className="text-white font-semibold">{user.name}</span>
                                    <span className="text-gray-400">@{user.username}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Start Chat Button */}
                <button
                    onClick={() => startConversation(username)}
                    className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full text-lg font-semibold hover:bg-blue-600 transition"
                >
                    Start Chat
                </button>
            </div>

            <RightSideBar />
        </div>
    );
}
