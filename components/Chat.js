import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";

export default function Chat({ receiver }) {
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState("");
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io();
        setSocket(newSocket);

        newSocket.on("receiveMessage", (newMessage) => {
            setMessages((prev) => [...prev, newMessage]);
        });

        return () => newSocket.close();
    }, []);

    useEffect(() => {
        async function fetchMessages() {
            try {
                const response = await axios.get(`/api/messages?receiver=${receiver}`);
                setMessages(response.data);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        }
        fetchMessages();
    }, [receiver]);

    async function sendMessage() {
        if (!messageText.trim()) return;

        const newMessage = { receiver, text: messageText };

        try {
            const response = await axios.post("/api/messages", newMessage);
            setMessages((prev) => [...prev, response.data]);
            socket.emit("sendMessage", response.data);
            setMessageText("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }

    return (
        <div className="flex flex-col h-96 bg-white border rounded-lg shadow-md p-4">
            <div className="flex-1 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`mb-2 ${msg.sender === receiver ? "text-left" : "text-right"}`}>
                        <span className={`inline-block px-4 py-2 rounded-lg ${msg.sender === receiver ? "bg-gray-200" : "bg-blue-500 text-white"}`}>
                            {msg.text}
                        </span>
                    </div>
                ))}
            </div>

            <div className="flex mt-2">
                <input
                    type="text"
                    className="flex-1 border rounded-lg p-2"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                />
                <button onClick={sendMessage} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg">
                    Send
                </button>
            </div>
        </div>
    );
}
