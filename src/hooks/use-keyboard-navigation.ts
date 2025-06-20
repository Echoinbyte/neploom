import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

function useKeyboardNavigation(shortcutMap: { [key: string]: string }) {
  const router = useRouter();
  const keySequenceRef = useRef<string>("");

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    const handleKeyDown = (e: KeyboardEvent) => {
      keySequenceRef.current += e.key;
      const match = Object.keys(shortcutMap).find((shortcut) =>
        keySequenceRef.current.endsWith(shortcut)
      );
      if (match) {
        e.preventDefault();
        router.replace(shortcutMap[match]);
        keySequenceRef.current = "";
      }
    };

    const handleKeyUp = () => {
      setTimeout(() => {
        keySequenceRef.current = "";
      }, 500);
    };

    document.addEventListener("keydown", handleKeyDown, { signal });
    document.addEventListener("keyup", handleKeyUp, { signal });

    return () => {
      abortController.abort();
    };
  }, [router, shortcutMap]);

  return null;
}

export default useKeyboardNavigation;
