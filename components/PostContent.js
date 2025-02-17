import Avatar from "./Avatar";
import Link from "next/link";
import PostButtons from "./PostButtons";

export default function PostContent({ text, author, createdAt, _id, likedByMe, likesCount, replies = [] }) {
    const getTimeAgo = (timestamp) => {
        const now = new Date();
        const postDate = new Date(timestamp);
        const diffInSeconds = Math.floor((now - postDate) / 1000);

        if (diffInSeconds < 60) {
            return `${diffInSeconds}s`;
        } else if (diffInSeconds < 3600) {
            return `${Math.floor(diffInSeconds / 60)}m`;
        } else if (diffInSeconds < 86400) {
            return `${Math.floor(diffInSeconds / 3600)}h`;
        } else {
            const options = { day: "2-digit", month: "short" };
            if (postDate.getFullYear() < now.getFullYear()) {
                options.year = "numeric";
            }
            return postDate.toLocaleDateString("en-US", options);
        }
    };

    const fullTimestamp = new Date(createdAt).toLocaleString("en-US", {
        hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short", year: "numeric"
    });

    // ✅ If the post has no author (Deleted User), show fallback UI
    if (!author || !author.name) {
        return (
            <div className="flex gap-2 items-start w-full">
                <Avatar src="/default-avatar.png" /> {/* ✅ Ensure a fallback image */}
                <div className="flex flex-col w-full">
                    <div className="flex items-center gap-2 flex-wrap w-full">
                        <span className="font-semibold text-gray-500">[Deleted User]</span>
                    </div>
                    <div className="mt-1 text-gray-400 text-lg leading-snug w-full">
                        This post is no longer available.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full border-b border-gray-800 p-4">
            <div className="flex gap-2 items-start">
                {/* ✅ Clicking on Avatar redirects to Profile */}
                <Link href={`/${author.username}`}>
                    <Avatar src={author?.image || "/default-avatar.png"} className="cursor-pointer" />
                </Link>

                <div className="flex flex-col w-full">
                    <div className="flex items-center gap-2 flex-wrap w-full">
                        {/* ✅ Clicking on Username redirects to Profile */}
                        <Link href={`/${author.username}`} className="font-semibold hover:underline cursor-pointer">
                            {author.name}
                        </Link>
                        
                        <span className="text-gray-400">@{author.username}</span>
                        <span className="text-gray-400">·</span>

                        {/* ✅ Clicking on timestamp redirects to the post */}
                        <Link href={`/${author.username}/status/${_id}`} className="relative group text-gray-500 hover:underline">
                            {getTimeAgo(createdAt)}
                            <span className="absolute left-1/2 -translate-x-1/2 top-full mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {fullTimestamp}
                            </span>
                        </Link>
                    </div>

                    {/* ✅ Clicking on the text redirects to the post */}
                    <div className="mt-1 text-white text-lg leading-snug w-full">
                        <Link href={`/${author.username}/status/${_id}`} className="hover:underline">
                            {text}
                        </Link>
                    </div>

                    {/* ✅ Post Buttons for Likes, Replies, Retweets, etc. */}
                    <div className="w-full flex">
                        <PostButtons id={_id} likesCount={likesCount} likedByMe={likedByMe} />
                    </div>
                </div>
            </div>

            {/* ✅ Replies are now displayed correctly under the parent post */}
            {replies?.length > 0 && (
                <div className="ml-12 border-l-2 border-gray-700 pl-4 mt-4">
                    {replies.map((reply) => (
                        <PostContent key={reply._id} {...reply} />
                    ))}
                </div>
            )}
        </div>
    );
}
