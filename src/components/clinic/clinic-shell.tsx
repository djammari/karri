"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Dog,
  Home,
  Menu,
  Plug,
  Users,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "cn";

const links = [
  { href: "/yfirlit", label: "Yfirlit", icon: Home },
  { href: "/vidskiptavinir", label: "Viðskiptavinir", icon: Users },
  { href: "/hundar", label: "Hundar", icon: Dog },
  { href: "/bokkanir", label: "Bókanir", icon: CalendarDays },
  { href: "/samthattingar", label: "Samþættingar", icon: Plug },
];

export function ClinicShell({
  children,
  staffName,
}: {
  children: React.ReactNode;
  staffName: string;
}) {
  const pathname = usePathname();

  const nav = (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm tracking-wide uppercase",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-[#101c12] p-4 md:flex md:flex-col">
        <Brand />
        <Separator className="my-4" />
        {nav}
        <div className="mt-auto pt-6 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">{staffName}</p>
          <p>Sjúkraskrár — trúnaðarmál</p>
          <form action={logoutAction} className="mt-3">
            <Button type="submit" variant="outline" size="sm">
              Útskrá
            </Button>
          </form>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-[#101c12] px-4 py-3 md:hidden">
          <Brand />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="size-4" />
                <span className="sr-only">Valmynd</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-[#101c12]">
              <SheetHeader>
                <SheetTitle>Óstöðvandi</SheetTitle>
              </SheetHeader>
              <div className="px-2">{nav}</div>
              <form action={logoutAction} className="mt-6 px-4">
                <Button type="submit" variant="outline" size="sm">
                  Útskrá
                </Button>
              </form>
            </SheetContent>
          </Sheet>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/yfirlit" className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/ostodvandi-mark.png"
        alt="Óstöðvandi"
        className="size-9 rounded-full bg-[#1d2b20] object-contain p-1"
      />
      <div>
        <p className="font-display text-sm leading-none text-foreground">
          Óstöðvandi
        </p>
        <p className="mt-1 text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
          Sjúkraþjálfun
        </p>
      </div>
    </Link>
  );
}
