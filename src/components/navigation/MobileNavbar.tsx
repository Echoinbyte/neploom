"use client";

import { CREATION_CATEGORIES } from "@/config/constants/navigation-header";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { User as Loomer } from "next-auth";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";
import { getAbsoluteUrl } from "@/lib/utils";

const MobileNav = () => {
  const { data: session } = useSession();
  const loomer: Loomer = session?.user;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const mobileNavRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(mobileNavRef as React.RefObject<HTMLElement>, () =>
    setIsOpen(false)
  );

  // whenever we click an item in the menu and navigate away, we want to close the menu
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // when we click the path we are currently on, we still want the mobile menu to close,
  // however we cant rely on the pathname for it because that won't change (we're already there)
  const closeOnCurrent = (href: string) => {
    if (pathname === href) {
      setIsOpen(false);
    }
  };

  // remove second scrollbar when mobile menu is open
  useEffect(() => {
    if (isOpen) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
  }, [isOpen]);

  if (!isOpen)
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="lg:hidden relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-skin-muted-400 dark:text-skin-muted-500"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>
    );

  return (
    <div>
      <div className="relative z-40 lg:hidden">
        <div className="fixed inset-0 bg-black bg-opacity-25" />
      </div>{" "}
      <div className="fixed overflow-y-scroll overscroll-y-none inset-0 z-40 flex">
        <div className="w-4/5" ref={mobileNavRef}>
          <div className="relative flex w-full max-w-sm flex-col overflow-y-auto bg-white dark:bg-black pb-12 shadow-xl">
            <div className="flex px-4 pb-2 pt-5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-skin-muted-400 dark:text-skin-muted-500"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-2">
              <ul>
                {CREATION_CATEGORIES.map((category) => (
                  <li
                    key={category.label}
                    className="space-y-10 px-4 pb-8 pt-10"
                  >
                    <div className="border-b border-gray-200 dark:border-gray-800">
                      <div className="-mb-px flex">
                        <p className="border-transparent flex-1 whitespace-nowrap border-b-2 py-4 text-base font-medium">
                          {category.label}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-10 gap-x-4">
                      {category.featured.map((item) => (
                        <div key={item.name} className="group relative text-sm">
                          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
                            <Image
                              priority
                              fill
                              src={item.imageSrc}
                              alt={`${item.name} - ${category.label} - Category Image`}
                              className="object-cover object-center"
                              placeholder="blur"
                              blurDataURL={item.imageSrc || "/placeholder.svg"}
                            />
                          </div>
                          <Link
                            href={item.href}
                            className="mt-6 block font-medium"
                          >
                            {item.name}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {loomer ? null : (
              <div className="space-y-6 border-t border-gray-200  dark:border-gray-800 px-4 py-6">
                <div className="flow-root">
                  <Link
                    onClick={() =>
                      closeOnCurrent(getAbsoluteUrl("/authentication"))
                    }
                    href={getAbsoluteUrl("/authentication")}
                    className="-m-2 block p-2 font-medium"
                  >
                    Authenticate
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
