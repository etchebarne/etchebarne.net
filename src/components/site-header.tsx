import { site } from "@/content";

const NAV = [
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "About", href: "#about" },
];

export const SiteHeader = () => (
  <header className="fixed inset-x-0 top-0 z-20 bg-linear-to-b from-background from-40% to-transparent pt-[env(safe-area-inset-top)] pb-6">
    <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
      <a href="#top" className="select-none" aria-label={site.name}>
        {/* The icon alone on phones; the full wordmark from sm up. */}
        <img src="/logo/etchebarne-icon.svg" alt="" className="h-7 w-auto sm:hidden" draggable={false} />
        <img src="/logo/etchebarne-logo.svg" alt="" className="hidden h-7 w-auto sm:block" draggable={false} />
      </a>
      <nav className="flex items-center gap-5 text-sm text-muted-foreground sm:gap-6 sm:text-base">
        {NAV.map((item) => (
          <a key={item.href} href={item.href} className="transition-[color] duration-150 select-none hover:text-foreground">
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  </header>
);
