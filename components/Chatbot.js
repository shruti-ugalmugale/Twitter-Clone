import { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import axios from "axios";

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! How can I assist you?", sender: "bot" }
    ]);
    const [input, setInput] = useState("");

    async function handleSendMessage() {
        if (!input.trim()) return;

        const userMessage = { text: input, sender: "user" };
        setMessages([...messages, userMessage]);

        setInput("");

        try {
            const response = await axios.post("/api/chatbot", { message: input });
            const botReply = { text: response.data.reply, sender: "bot" };
            setMessages((prev) => [...prev, botReply]);
        } catch (error) {
            console.error("Chatbot Error:", error);
            setMessages((prev) => [...prev, { text: "Error getting response.", sender: "bot" }]);
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chatbot Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition"
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-gray-900 text-white w-80 h-96 p-4 rounded-lg shadow-xl absolute bottom-14 right-0 flex flex-col">
                    <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                        <h2 className="text-lg font-bold">Chatbot</h2>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`p-2 rounded-lg max-w-xs ${
                                    msg.sender === "user"
                                        ? "bg-blue-500 text-white ml-auto"
                                        : "bg-gray-800 text-gray-300"
                                }`}
                            >
                                {msg.text}
                            </div>
                        ))}
                    </div>

                    {/* Input Box */}
                    <div className="flex items-center border-t border-gray-700 pt-2">
                        <input
                            type="text"
                            className="flex-1 p-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                        />
                        <button onClick={handleSendMessage} className="ml-2 p-2 bg-blue-500 rounded-lg hover:bg-blue-600">
                            <Send size={20} className="text-white" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
