"use client";

import { ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TbDeviceDesktopStar } from "react-icons/tb";
import { TbPencilStar } from "react-icons/tb";
import useLoomer from "@/hooks/use-loomer";
import { FaRegBookmark } from "react-icons/fa6";
import { GoScreenFull, GoScreenNormal } from "react-icons/go";
import VerificationBadge from "@/components/shared/VerificationBadge";
import { ImFeed } from "react-icons/im";
import { DEFAULT_LOOMER_DATA } from "@/config/constants/navigation-header";
import { getAbsoluteUrl } from "@/lib/utils";

const LoomerAccountMenu = () => {
  const { loomer, loading, logoutLoomer } = useLoomer();
  const { loomerName, hashId, avatar, role } = loomer || DEFAULT_LOOMER_DATA;

  const [correctLoomerName, setCorrectLoomerName] = useState("");
  async function signOutFromDevice() {
    await signOut();
    logoutLoomer();
  }

  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullscreen(true));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false));
      }
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="overflow-visible">
          <div className="h-auto w-full flex flex-row items-center gap-2">
            {loading ? (
              <>
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse rounded-full bg-muted h-12 w-12"></div>
                </div>
              </>
            ) : (
              <>
                <Avatar className="relative cursor-pointer">
                  <AvatarImage
                    className="unselectable"
                    src={avatar}
                    alt={loomerName + "'s Avatar"}
                  />
                  <AvatarFallback className="unselectable">
                    {loomerName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </>
            )}
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-60" align="end">
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-0.5 leading-none">
              <p className="font-bold text-sm">
                <Link
                  href={getAbsoluteUrl("/profile")}
                  className="h-auto w-full flex flex-row items-center gap-1"
                >
                  <VerificationBadge
                    loomer={loomer}
                    size="14"
                    sizeOfLogo={10}
                    tooltip={true}
                  />
                </Link>
                <Link
                  href={`/loomer/hashId/${hashId}`}
                  className="mt-2 h-auto w-full flex flex-row items-center gap-2"
                >
                  <span className="text-xs font-light max-w-prose text-muted-foreground">
                    #{hashId}
                  </span>
                </Link>
              </p>
            </div>
          </div>

          <DropdownMenuSeparator />

          {role === "admin" ? (
            <DropdownMenuItem asChild>
              <Link
                href={`/admin`}
                className="h-auto w-full flex flex-row items-center gap-2 cursor-pointer"
              >
                <TbDeviceDesktopStar className="text-skin-base-600 dark:text-skin-base-500" />{" "}
                Admin
              </Link>
            </DropdownMenuItem>
          ) : null}

          {role === "admin" || role === "author" ? (
            <DropdownMenuItem asChild>
              <Link
                href={`/author`}
                className="h-auto w-full flex flex-row items-center gap-2 cursor-pointer"
              >
                <TbPencilStar className="text-skin-base-600 dark:text-skin-base-500" />{" "}
                Author
              </Link>
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuItem asChild>
            <Link
              href={`/feed`}
              className="h-auto w-full flex flex-row items-center gap-2 cursor-pointer"
            >
              <ImFeed className="text-skin-base-600 dark:text-skin-base-500" />{" "}
              Feed
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href={`/feed/favourites`}
              className="h-auto w-full flex flex-row items-center gap-2 cursor-pointer"
            >
              <FaRegBookmark className="text-skin-base-600 dark:text-skin-base-500" />{" "}
              Favourites
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <div onClick={toggleFullscreen}>
              <div className="hidden sm:flex h-auto w-full flex-row items-center gap-2 cursor-pointer">
                {isFullscreen ? (
                  <GoScreenNormal className="text-skin-base-600 dark:text-skin-base-500" />
                ) : (
                  <GoScreenFull className="text-skin-base-600 dark:text-skin-base-500" />
                )}
                {isFullscreen ? "Exit Fullscreen" : "Go Fullscreen"}
              </div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="hidden sm:flex" />

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="cursor-pointer text-skin-base-600 dark:text-skin-base-500 w-full border-none"
              >
                Logout
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Are you sure to Logout?</DialogTitle>
                <DialogDescription>
                  {`Type "${loomerName}" to Logout from this device.`}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="loomerName" className="text-right">
                    LoomerName
                  </Label>
                  <Input
                    id="loomerName"
                    className="col-span-3"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setCorrectLoomerName(e.target.value)
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={() => signOutFromDevice()}
                  disabled={correctLoomerName !== loomerName}
                >
                  Logout
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default LoomerAccountMenu;
