import Image from "next/image";

export default function Avatar({ src, size = 50 }) {
    return (
        <div className="rounded-full overflow-hidden" style={{ width: size, height: size }}>
            {src ? (
                <Image src={src} alt="Profile" width={size} height={size} className="rounded-full" />
            ) : (
                <div className="bg-gray-700 rounded-full w-full h-full"></div>
            )}
        </div>
    );
}
