import { useEffect, useState } from "react";
import { site } from "@/content";

const NAV = [
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "About", href: "#about" },
];

/** The section in the middle of the screen, if it's one of the nav's. */
const useActiveSection = () => {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const sections = NAV.map((item) => document.querySelector(item.href)).filter((el) => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
          else setActive((current) => (current === `#${entry.target.id}` ? null : current));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, []);
  return active;
};

export const SiteHeader = () => {
  const active = useActiveSection();
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-20 bg-linear-to-b from-background from-40% to-transparent pt-[env(safe-area-inset-top)] pb-6">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <a href="#top" className="select-none" aria-label={site.name}>
            {/* The icon alone on phones; the full wordmark from sm up. */}
            <img src="/logo/etchebarne-icon.svg" alt="" className="h-7 w-auto sm:hidden" draggable={false} />
            <img src="/logo/etchebarne-logo.svg" alt="" className="hidden h-7 w-auto sm:block" draggable={false} />
          </a>
          <nav className="hidden items-center gap-6 text-base text-muted-foreground sm:flex">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="transition-[color] duration-150 select-none hover:text-foreground">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Phones: the nav sits at the bottom, under the thumb, and marks where you are. */}
      <nav
        aria-label="Sections"
        className="fixed inset-x-0 bottom-0 z-20 bg-linear-to-t from-background from-55% to-transparent pt-8 pb-[env(safe-area-inset-bottom)] sm:hidden"
      >
        <div className="grid grid-cols-3">
          {NAV.map((item) => {
            const current = active === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={current ? "location" : undefined}
                className="group flex h-14 flex-col items-center justify-center gap-2 text-sm text-muted-foreground transition-[color] duration-150 select-none aria-[current]:text-foreground"
              >
                {item.label}
                <span aria-hidden className="size-1 bg-foreground opacity-0 transition-opacity duration-200 group-aria-[current]:opacity-100" />
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
};
