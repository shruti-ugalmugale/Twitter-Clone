import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router"; 
import { signOut } from "next-auth/react";
import Image from "next/image";
import { Home as HomeIcon, Mail, Bookmark, User, X } from "lucide-react";
import Avatar from "./Avatar"; 
import axios from "axios";

export default function LeftSideBar({ userInfo, setUserInfo, setPosts }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [text, setText] = useState("");
  const menuRef = useRef(null);
  const router = useRouter();

  async function handleLogout() {
    setUserInfo(null);
    await signOut({ redirect: false });
    router.push("/login");
  }

  async function handlePostSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;

    try {
        const response = await axios.post("/api/posts", { text });

        // ✅ Manually add the new post to the state with the correct author
        const newPost = {
            ...response.data, // Contains _id, text, createdAt, etc.
            author: {
                _id: userInfo.id, // ✅ Attach correct user data
                name: userInfo.name,
                username: userInfo.username,
                image: userInfo.image,
            },
            replies: [],
        };

        // ✅ Update state immediately to avoid missing author issue
        setPosts((prevPosts) => [newPost, ...prevPosts]);
        setText("");
    } catch (error) {
        console.error("Error submitting post:", error);
    }
}



  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showPostModal) {
      document.body.classList.add("overflow-hidden"); // ✅ Prevent scrolling when modal is open
    } else {
      document.body.classList.remove("overflow-hidden"); // ✅ Re-enable scrolling when closed
    }
  }, [showPostModal]);

  return (
    <aside className="w-1/4 p-4 border-r border-gray-700 relative">
      <ul className="space-y-4">
        <div className="mb-6">
          <Image src="/twitter.png" alt="Twitter X Logo" width={50} height={50} />
        </div>

        <li>
          <button 
            onClick={() => router.push("/")} 
            className="w-auto flex items-center gap-2 text-left px-4 py-2 rounded-full hover:bg-gray-900 text-white text-xl"
          >
            <HomeIcon size={20} /> Home
          </button>
        </li>

        <li>
          <button onClick={() => router.push("/messages")} className="w-auto flex items-center gap-2 text-left px-4 py-2 rounded-full hover:bg-gray-900 text-white text-xl">
            <Mail size={20} /> Messages
          </button>
        </li>

        <li>
          <button onClick={() => router.push("/bookmarks")} 
          className="w-auto flex items-center gap-2 text-left px-4 py-2 rounded-full hover:bg-gray-900 text-white text-xl">
            <Bookmark size={20} /> Bookmarks
          </button>
        </li>

        <li>
          <button className="w-auto flex items-center gap-2 text-left px-4 py-2 rounded-full hover:bg-gray-900 text-white text-xl" onClick={() => router.push(`/${userInfo?.username}`)}>
            <User size={20} /> Profile
          </button>
        </li>
      </ul>

      {/* ✅ Post Button Opens Popup */}
      <button 
        onClick={() => setShowPostModal(true)} 
        className="mt-6 w-40 bg-white py-2 rounded-full text-xl text-black font-bold">
        Post
      </button>

      {/* Profile Button with Logout Dropdown */}
      <div className="hover:bg-gray-800 rounded-full relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-full mt-6 py-2 px-4 rounded-full text-lg flex items-center gap-3 hover:bg-gray-800 transition relative"
        >
          <Avatar src={userInfo?.image} />
          <div className="flex flex-col text-left">
            <span className="font-semibold">{userInfo?.name}</span>
            <span className="text-gray-400">@{userInfo?.username}</span>
          </div>
        </button>

        {/* Logout Menu */}
        {menuOpen && (
          <div className="flex flex-row w-full absolute bottom-16 left-0 w-60 bg-black text-white text-xl shadow-md rounded-xl">
            <div className="absolute left-5 top-full w-7 h-7 bg-black rotate-45"></div>
            <button 
              onClick={handleLogout}
              className="flex flex-row w-full items-center gap-1 truncate text-left py-3 px-4 hover:bg-gray-800 rounded-xl font-semibold">
              Log out @{userInfo?.username}
            </button>
          </div>
        )}
      </div>

      {/* ✅ Post Modal Popup */}
      {showPostModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-90 z-50">
          <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full text-white shadow-lg relative">
            {/* Close Button */}
            <button 
              onClick={() => setShowPostModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold mb-4">Create Post</h2>

            <div className="flex gap-4">
              <Avatar src={userInfo?.image} />
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What's happening?"
                className="w-full bg-black text-white text-lg border-none outline-none placeholder-gray-500 resize-none overflow-hidden p-2"
                rows="3"
              />
            </div>

            {/* Post Button */}
            <div className="w-full flex justify-end mt-4">
              <button
                onClick={handlePostSubmit}
                className={`px-6 py-2 rounded-full font-bold ${
                  text.trim() ? "bg-white text-black" : "bg-gray-400 cursor-not-allowed text-black"
                }`}
                disabled={!text.trim()}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
