import Navbar from "@/components/navigation/Navbar";
import { LoomerProvider } from "@/context/LoomerContext";
import SessionProvider from "@/providers/SessionProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <LoomerProvider>
        <Navbar />
        {children}
      </LoomerProvider>
    </SessionProvider>
  );
}
