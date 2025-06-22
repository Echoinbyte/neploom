import { useEffect } from "react";
import { useRouter } from "next/navigation";

function useKeyboardNavigation(shortcutMap: { [key: string]: string }) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey) {
        const shortcut = `shift+${e.key.toLowerCase()}`;
        if (shortcutMap[shortcut]) {
          e.preventDefault();
          router.replace(shortcutMap[shortcut]);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [router, shortcutMap]);

  return null;
}

export default useKeyboardNavigation;
