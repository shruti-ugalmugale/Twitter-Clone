//pages/[username]/index.js
import useUserInfo from "@/hooks/useUserInfo";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import LeftSideBar from "@/components/LeftSideBar";
import RightSideBar from "@/components/RightSideBar";
import Avatar from "@/components/Avatar";
import PostContent from "@/components/PostContent";
import { IoArrowBackOutline } from 'react-icons/io5'; // Import the left arrow icon

export default function ProfilePage() {
    const router = useRouter();
    const { username } = router.query;
    const { userInfo, status: userInfoStatus } = useUserInfo();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [newName, setNewName] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    async function fetchProfile() {
        if (!username) return;
        try {
            const response = await axios.get(`/api/users?username=${username}`);
            setProfile(response.data.user);
            setNewName(response.data.user.name); // Pre-fill name input
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    }

    async function fetchUserPosts() {
        if (!username) return;
        try {
            const response = await axios.get(`/api/posts?username=${username}`);
            setPosts(response.data.posts || []);
        } catch (error) {
            console.error("Error fetching user posts:", error);
        }
    }

    async function saveProfileChanges() {
        const formData = new FormData();
        formData.append("name", newName);
        if (imageFile) {
            formData.append("image", imageFile);
        }
    
        try {
            const response = await axios.put("/api/users", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
    
            console.log("Profile Updated:", response.data);
    
            // ✅ New profile details with cache busting for image
            const updatedImage = response.data.user.image + `?t=${new Date().getTime()}`;
            const updatedName = response.data.user.name;
            const updatedUsername = response.data.user.username;
    
            // ✅ Update profile state with new name & image
            setProfile((prevProfile) => ({
                ...prevProfile,
                name: updatedName,
                username: updatedUsername,
                image: updatedImage,
            }));
    
            // ✅ Update posts and their replies to reflect new name, username, and image
            setPosts((prevPosts) =>
                prevPosts.map((post) => ({
                    ...post,
                    author: {
                        ...post.author,
                        name: updatedName, // ✅ Update name
                        username: updatedUsername, // ✅ Update username
                        image: updatedImage, // ✅ Update profile image
                    },
                    replies: post.replies.map((reply) => ({
                        ...reply,
                        author: {
                            ...reply.author,
                            name: updatedName, // ✅ Update name in replies
                            username: updatedUsername, // ✅ Update username in replies
                            image: updatedImage, // ✅ Update image in replies
                        },
                    })),
                }))
            );
    
            // ✅ Update `userInfo` globally if available
            if (userInfo?.username === updatedUsername) {
                userInfo.image = updatedImage;
                userInfo.name = updatedName;
                userInfo.username = updatedUsername;
            }
    
            setIsEditing(false);
            router.push(`/${updatedUsername}`);
    
        } catch (error) {
            console.error("Error updating profile:", error.response?.data || error);
        }
    }
    

    useEffect(() => {
        if (username) {
            fetchProfile();
            fetchUserPosts();
        }
    }, [username]);

    if (!profile) {
        return <p className="text-white text-center">Loading...</p>;
    }

    return (
        <div className="flex min-h-screen bg-black text-white">
            <LeftSideBar userInfo={userInfo} />

            <main className="w-3/5 p-4">
                <button onClick={() => router.back()} className="p-2 mb-4 text-white rounded-full hover:bg-gray-800">
                    <IoArrowBackOutline className="text-xl"/>
                </button>

                {/* Profile Header */}
                <div className="relative">
                    <div className="bg-gray-800 h-36"></div>
                    <div className="absolute -bottom-16 left-4 border-4 border-black rounded-full">
                        <Avatar src={profile.image} size={120} />
                    </div>
                </div>

                {/* Profile Name and Edit Button */}
                <div className="mt-12 p-4 flex justify-between items-center">
                    <div>
                        {isEditing ? (
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="bg-black border border-gray-700 text-white p-2 rounded-md"
                            />
                        ) : (
                            <h1 className="text-2xl font-bold">{profile.name}</h1>
                        )}
                        <p className="text-gray-400">@{profile.username}</p>
                    </div>

                    {/* Edit Profile Button */}
                    {userInfo?.username === profile.username && (
                        <div className="flex flex-col items-center">
                            {isEditing && (
                                <div className="flex flex-col items-center mt-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setImageFile(e.target.files[0])}
                                        className="mt-2 text-gray-400"
                                    />
                                    {imageFile && (
                                        <img
                                            src={URL.createObjectURL(imageFile)}
                                            alt="Preview"
                                            className="mt-2 w-24 h-24 rounded-full"
                                        />
                                    )}
                                </div>
                            )}
                            <button
                                onClick={isEditing ? saveProfileChanges : () => setIsEditing(true)}
                                className="px-4 py-2 bg-black text-white border border-white rounded-full font-semibold text-lg mt-4">
                                {isEditing ? "Save" : "Edit Profile"}
                            </button>
                        </div>
                    )}
                </div>

                {/* User Posts */}
                <div className="mt-6">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <div key={post._id} className="border-gray-700 border-b pt-2 pb-4">
                                <PostContent {...post} big />
                                {post.replies?.length > 0 && (
                                    <div className="ml-12 border-l-2 border-gray-700 pl-4 mt-2">
                                        {post.replies.map((reply) => (
                                            <PostContent key={reply._id} {...reply} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center">No posts yet.</p>
                    )}
                </div>
            </main>

            <RightSideBar />
        </div>
    );
}
