import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import useUserInfo from "@/hooks/useUserInfo";
import LeftSideBar from "@/components/LeftSideBar";
import RightSideBar from "@/components/RightSideBar";
import Image from "next/image";
import moment from "moment";
import { Camera, Smile, Send, Image as ImageIcon } from "lucide-react"; // ✅ Icons for chat input

export default function ChatPage() {
    const router = useRouter();
    const { id: receiverId } = router.query;
    const { userInfo } = useUserInfo();
    const [messages, setMessages] = useState([]);
    const [receiver, setReceiver] = useState(null); // ✅ Store recipient details
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMessages() {
            if (!receiverId) return;

            try {
                // ✅ Fetch recipient details
                const userRes = await axios.get(`/api/users?id=${receiverId}`);
                setReceiver(userRes.data.user);

                // ✅ Fetch messages
                const msgRes = await axios.get(`/api/chat?receiver=${receiverId}`);
                setMessages(msgRes.data || []);
            } catch (error) {
                console.error("Error fetching messages:", error);
                setMessages([]);
            } finally {
                setLoading(false);
            }
        }
        fetchMessages();
    }, [receiverId]);

    async function sendMessage() {
        if (!text.trim()) return;

        try {
            const response = await axios.post("/api/chat", { receiver: receiverId, text });
            setMessages([...messages, response.data]);
            setText("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }

    return (
        <div className="flex min-h-screen bg-black text-white">
            <LeftSideBar userInfo={userInfo} />

            <div className="flex-1 max-w-2xl mx-auto flex flex-col">
                {/* ✅ Recipient Profile Header */}
                {receiver && (
                    <div className="flex items-center gap-3 p-4 border-b border-gray-800 bg-black">
                        <Image
                            src={receiver.image || "/default-avatar.png"}
                            alt="Profile"
                            width={50}
                            height={50}
                            className="rounded-full"
                        />
                        <div>
                            <p className="text-lg font-bold">{receiver.name}</p>
                            <p className="text-gray-500">@{receiver.username}</p>
                        </div>
                    </div>
                )}

                {/* ✅ Chat Messages Section */}
                <div className="flex-1 overflow-y-auto bg-black p-4">
                    {loading ? (
                        <p>Loading...</p>
                    ) : messages.length === 0 ? (
                        <p className="text-gray-400 text-center mt-10">Start the conversation by sending a message.</p>
                    ) : (
                        messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex items-end mb-4 ${
                                    msg.sender._id === userInfo?.id ? "justify-end" : "justify-start"
                                }`}
                            >
                                {msg.sender._id !== userInfo?.id && (
                                    <Image
                                        src={msg.sender.image || "/default-avatar.png"}
                                        alt="Profile"
                                        width={30}
                                        height={30}
                                        className="rounded-full mr-2"
                                    />
                                )}

                                <div className="flex flex-col">
                                    <div
                                        className={`px-4 py-2 max-w-xs rounded-2xl ${
                                            msg.sender._id === userInfo?.id
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-700 text-white"
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {moment(msg.createdAt).format("h:mm A")} • Sent
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* ✅ Chat Input Box */}
                <div className="p-4 border-t border-gray-800 flex items-center bg-black">
                    <button className="p-2 hover:bg-gray-800 rounded-full">
                        <ImageIcon size={24} className="text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-800 rounded-full">
                        <Camera size={24} className="text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-800 rounded-full">
                        <Smile size={24} className="text-gray-400" />
                    </button>

                    <input
                        type="text"
                        className="flex-1 mx-2 p-3 bg-gray-900 text-white rounded-full border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Start a new message"
                    />

                    <button onClick={sendMessage} className="p-2 bg-blue-500 rounded-full hover:bg-blue-600">
                        <Send size={24} className="text-white" />
                    </button>
                </div>
            </div>

            <RightSideBar />
        </div>
    );
}
