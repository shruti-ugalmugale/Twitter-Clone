//pages/login.js
import { getProviders, signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function LoginPage({ providers }) {
    const {data,status} = useSession();
    const router = useRouter();
    
    if (data) {
        router.push('/');
    }
    
    if (status === "loading") {
        return null;
    }
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
            {/* Twitter "X" Logo */}
            <div className="mb-8">
                <Image src="/twitter.png" alt="Twitter X Logo" width={100} height={100} />
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold mb-10">Sign in to X</h1>

            {/* Login Buttons */}
            <div className="w-full max-w-xs space-y-4">
                {providers &&
                    Object.values(providers).map((provider) => (
                        <button
                            key={provider.id}
                            onClick={() => signIn(provider.id)}
                            className="w-full flex items-center justify-center px-4 py-2 border border-white rounded-full shadow-sm text-black bg-white hover:bg-gray-300 focus:outline-none"
                        >
                            {/* Google Logo */}
                            {provider.id === "google" && (
                                <Image 
                                    src="/google.png"
                                    alt="Google Logo"
                                    width={20}
                                    height={20}
                                    className="mr-2"
                                />
                            )}
                            Sign in with {provider.name}
                        </button>
                    ))}
            </div>
        </div>
    );
}

export async function getServerSideProps() {
    const providers = await getProviders();
    return {
        props: { providers },
    };
}
