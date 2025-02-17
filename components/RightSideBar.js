import { useEffect, useState } from "react";
import axios from "axios";

export default function RightSideBar() {
    const [trendingTopics, setTrendingTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);

    useEffect(() => {
        async function fetchTrendingTopics() {
            try {
                const response = await axios.get("/api/trending");
                setTrendingTopics(response.data.trends || []);
            } catch (error) {
                console.error("Error fetching trending topics:", error);
                setTrendingTopics([
                    { topic: "#TrendingTopic", category: "General", count: "12.5K" },
                    { topic: "#AnotherTopic", category: "Tech", count: "8.3K" },
                ]); // Fallback topics
            }
        }

        fetchTrendingTopics();
    }, []);

    return (
        <aside className="w-1/3 p-4 border-l border-gray-700">
            <div className="mt-6 bg-gray-900 p-4 rounded-xl">
                <h2 className="text-xl font-bold mb-4">What’s happening</h2>
                {trendingTopics.length > 0 ? (
                    trendingTopics.map((trend, index) => (
                        <div 
                            key={index} 
                            className="p-3 hover:bg-gray-800 rounded-lg cursor-pointer transition duration-200"
                            onClick={() => setSelectedTopic(trend)}
                        >
                            <p className="text-gray-500 text-xs">{trend.category} · Trending</p>
                            <p className="text-white font-semibold text-lg">{trend.topic}</p>
                            <p className="text-gray-500 text-sm">{trend.count} Tweets</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400">Loading trends...</p>
                )}
            </div>

            {/* ✅ Modal Popup */}
            {selectedTopic && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center p-4">
                    <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full text-white shadow-lg">
                        <h2 className="text-2xl font-bold break-words">{selectedTopic.topic}</h2>
                        <p className="text-gray-500">{selectedTopic.category} · {selectedTopic.count} Tweets</p>

                        {/* ✅ Show full text if available */}
                        {selectedTopic.description && (
                            <p className="mt-4 text-gray-300">{selectedTopic.description}</p>
                        )}

                        {selectedTopic.content && (
                            <p className="mt-2 text-gray-400 text-sm">{selectedTopic.content}</p>
                        )}

                        {/* ✅ Read More Link */}
                        {selectedTopic.url && (
                            <a 
                                href={selectedTopic.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block mt-4 text-blue-400 hover:underline"
                            >
                                Read full article
                            </a>
                        )}

                        <button 
                            onClick={() => setSelectedTopic(null)}
                            className="mt-4 bg-blue-500 px-6 py-2 rounded-lg hover:bg-blue-600 w-full text-center"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </aside>
    );
}
