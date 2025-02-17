//components/RUsernameForm.js
import { useEffect, useState } from "react";
import Image from "next/image";
import useUserInfo from "@/hooks/useUserInfo";
import { useRouter } from "next/router";

export default function UsernameForm() {
    const { userInfo, status } = useUserInfo();
    const [username, setUsername] = useState("");
    const router = useRouter();
    useEffect(() => {
        if (status === "loading") return;
        
        if (username === "" && userInfo?.email) {
            const defaultUsername = userInfo.email.split("@")[0];
            setUsername(defaultUsername.replace(/[^a-z0-9]+/gi, ''));
        }
    }, [status, userInfo]); 

    function handleFormSubmit(e) {
        e.preventDefault();
        fetch('api/users', {
            method: "PUT",
            headers: {'content-type':'application/json'},
            body: JSON.stringify({username})
        })
        router.reload();
    }
    
    if (status === "loading") {
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4">
            {/* Twitter X Logo */}
            <div className="mb-6">
                <Image src="/twitter.png" alt="Twitter X Logo" width={50} height={50} />
            </div>
            
            {/* Heading */}
            <h1 className="text-3xl font-bold mb-2">What should we call you?</h1>
            <p className="text-gray-400 mb-6">Your @username is unique. You can always change it later.</p>
            
            {/* Username Input Form */}
            <form onSubmit={handleFormSubmit} className="w-full max-w-md">
                <label className="block text-gray-400 text-sm mb-1">Username</label>
                <div className="relative border border-blue-500 rounded-md p-2 flex items-center bg-black">
                    <span className="text-gray-400">@</span>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="your username"
                        className="bg-black text-white outline-none ml-1 flex-1"
                    />
                    <button type="submit" className="text-green-500">✔</button>
                </div>
            </form>
        </div>
    );
}
