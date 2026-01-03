import { MessageSquareCodeIcon } from "lucide-react";
import Link from "next/link";

export function Footer() {
  const footerLinks = [
    {
      href: "#",
      label: "Twitter",
    },
    {
      href: "#",
      label: "FaceBook",
    },
    {
      href: "#",
      label: "LinkedIn",
    },
  ];
  return (
    <footer className="border-t border-border p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2">
            <MessageSquareCodeIcon className="size-6 text-primary" />
            <h1 className="text-2xl font-bold">PDF Chat Bot</h1>
          </Link>
        </div>

        <nav className="flex items-center justify-center gap-4">
          {footerLinks.map((d) => (
            <Link href={d.href} key={d.label}>
              <span className="text-sm capitalize hover:text-foreground text-muted-foreground/90 transition-colors duration-300 ease-in-out">
                {d.label}
              </span>
            </Link>
          ))}
        </nav>
        <p className="text-center text-xs text-gray-400">
          &copy; 2026. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
