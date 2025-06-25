"use client";

import Link from "next/link";
import MaxWidthWrapper from "@/components/shared/MaxWidthWrapper";
import MobileNav from "@/components/navigation/MobileNavbar";
import LoomerAccountMenu from "@/components/navigation/LoomerAccountMenu";
import { useEffect, useRef, useState } from "react";
import SwitchTheme from "@/design/theme/ThemeToggle";
import Image from "next/image";
import { IoNavigate } from "react-icons/io5";

// Centralized image imports
import { nepLoomRedLogo } from "@/config/imageImports";
import { FaSearch } from "react-icons/fa";
import CommandBox from "@/components/navigation/CommandMenu";
import useLoomer from "@/hooks/use-loomer";
import { buttonVariants } from "@/components/ui/button";
import { cn, getAbsoluteUrl } from "@/lib/utils";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";
import useKeyboardNavigation from "@/hooks/use-keyboard-navigation";

const Navbar = () => {
  const { loomer } = useLoomer();
  const [menuVisible, setMenuVisible] = useState(false);

  const menuWrapperRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(menuWrapperRef as React.RefObject<HTMLElement>, () =>
    setMenuVisible(false)
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && e.ctrlKey) {
        e.preventDefault();
        setMenuVisible((prev) => !prev);
      } else if (e.key === "Escape") {
        setMenuVisible(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const closeMenu = () => {
    setMenuVisible(false);
  };

  useKeyboardNavigation({
    "shift+a": "/authentication",
    "shift+l": "/",
    "shift+u": `/loomer/hashId=`,
    "shift+h": "/home",
  });

  return (
    <>
      <div
        className={cn(
          "sticky z-[1502] top-0 inset-x-0 h-14 navbar bg-background dark:bg-background"
        )}
      >
        <header className="relative">
          <MaxWidthWrapper>
            <div className="border-b border-white/20 dark:border-white/10">
              <div className="flex h-14 items-center">
                <MobileNav />

                <div className="ml-4 flex lg:ml-0">
                  <Link href={getAbsoluteUrl("/")}>
                    <Image
                      priority
                      alt="NepLoom Abstract Logo"
                      src={nepLoomRedLogo}
                      width={96}
                      height={96}
                      className="h-24 w-24"
                      placeholder="blur"
                      blurDataURL="/NepLoomRed.svg"
                    />
                  </Link>
                </div>

                <div className="ml-auto flex items-center gap-6">
                  <div
                    className="w-full flex-1 md:w-auto md:flex-none"
                    ref={menuWrapperRef}
                  >
                    <button
                      onClick={() => setMenuVisible((prev) => !prev)}
                      className="inline-flex items-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground px-4 py-2 relative h-8 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64 cursor-pointer"
                    >
                      <span className="hidden lg:inline-flex items-center gap-2">
                        <IoNavigate />
                        NepLoom...
                      </span>
                      <span className="inline-flex lg:hidden">
                        <FaSearch />
                      </span>
                      <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                        <span className="text-xs">Ctrl</span>K
                      </kbd>
                    </button>
                    {menuVisible && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-[1501]">
                        <CommandBox closeMenu={closeMenu} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-row items-center justify-center gap-2 lg:gap-6">
                    <SwitchTheme />
                    <span
                      className={cn(
                        loomer?.isVerified ? "flex" : "hidden",
                        "lg:flex h-6 w-px bg-gray-200"
                      )}
                      aria-hidden="true"
                    />
                    <div className="flex flex-1 lg:items-center lg:justify-end lg:space-x-6">
                      {loomer?.isVerified ? (
                        <LoomerAccountMenu />
                      ) : (
                        <Link
                          href={getAbsoluteUrl("/authentication")}
                          className={cn(
                            buttonVariants({
                              variant: "ghost",
                            }),
                            "hidden lg:inline-flex"
                          )}
                        >
                          Be Smart &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </MaxWidthWrapper>
        </header>
      </div>
    </>
  );
};

export default Navbar;
