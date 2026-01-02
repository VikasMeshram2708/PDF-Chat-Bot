import { FileIcon, MenuIcon } from "lucide-react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Button } from "./ui/button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export default function Header() {
  const navLinks = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "About",
      href: "/about",
    },

    {
      label: "Chat",
      href: "/chat",
    },
  ];
  return (
    <header className="p-4 sticky top-0 bg-background z-50 border-b">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <FileIcon className="size-6 text-primary" />
            <h1 className="text-2xl font-bold">PDF Chat Bot</h1>
          </Link>
        </div>
        <nav className="hidden lg:flex items-center gap-3">
          {navLinks.map((item) => (
            <Link href={item.href} key={item.label}>
              <Button variant={"ghost"} className="w-full justify-start">
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-2">
          <SignedOut>
            <Button type="button" asChild>
              <SignInButton />
            </Button>
            <Button type="button" asChild variant={"ghost"}>
              <SignUpButton />
            </Button>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>

        {/* Mobile */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant={"ghost"} type="button">
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>
                  <Link href="/" className="flex items-center gap-2">
                    <FileIcon className="size-6 text-primary" />
                    <h1 className="text-2xl font-bold">PDF Chat Bot</h1>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav>
                {navLinks.map((item) => (
                  <Link href={item.href} key={item.label}>
                    <Button variant={"ghost"} className="w-full justify-start">
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
              <SheetFooter>
                <SignedIn>
                  <UserButton />
                </SignedIn>
                <SignedOut>
                  <Button type="button" asChild>
                    <SignInButton />
                  </Button>
                  <Button type="button" asChild>
                    <SignUpButton />
                  </Button>
                </SignedOut>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
