import axios from "axios";

export default async function handler(req, res) {
    try {
        const apiKey = process.env.NEWS_API_KEY; // ✅ Get API key from .env.local
        const response = await axios.get(
            `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`
        );

        // ✅ Generate random engagement counts
        function randomCount() {
            return (Math.floor(Math.random() * 50) + 5).toFixed(1) + "K"; 
        }

        // ✅ Format news articles into trending topics
        const trends = response.data.articles.slice(0, 5).map(article => ({
            topic: `#${article.title.split(" ").slice(0, 3).join("")}`, // Create a hashtag
            category: article.source.name || "News",
            count: randomCount(),
            description: article.description || "",
            content: article.content || "",
            url: article.url || "",
        }));

        res.status(200).json({ trends });
    } catch (error) {
        console.error("Error fetching trending topics:", error);
        res.status(500).json({ error: "Failed to fetch trends" });
    }
}
