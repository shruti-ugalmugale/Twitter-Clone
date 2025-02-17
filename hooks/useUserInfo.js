//hooks/userUserInfo.js
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function useUserInfo() {
    const { data: session, status: sessionStatus } = useSession();
    const [userInfo, setUserInfo] = useState(null);
    const [status, setStatus] = useState("loading");

    function getUserInfo() {
        if (sessionStatus !== "authenticated") {
            setStatus("unauthenticated");
            return;
        }

        const userId = session?.user?.id;
        if (!userId) {
            setStatus("unauthenticated");
            return;
        }

        fetch(`/api/users?id=${userId}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((json) => {
                setUserInfo(json.user);
                setStatus("authenticated");
            })
            .catch((error) => {
                console.error("Error fetching user info:", error);
                setStatus("error");
            });
    }

    useEffect(() => {
        getUserInfo();
    }, [sessionStatus]); 

    return { userInfo, setUserInfo, status };
}
