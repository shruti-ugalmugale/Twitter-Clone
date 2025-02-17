import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import Chatbot from "@/components/Chatbot";

export default function App({ Component, pageProps: {session, ...pageProps} }) {
  return (
    <SessionProvider session={session}>
    <div className="bg-black text-white min-h-screen">
      <Component {...pageProps} />
      <Chatbot />
    </div>
    </SessionProvider>
  );
}
