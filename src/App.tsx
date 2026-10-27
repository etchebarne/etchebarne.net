import { siGithub, siX, siYoutube } from "simple-icons";
import { DitherShader } from "@/lib/dither";
import { projects, site } from "@/content";
import { SiteHeader } from "@/components/site-header";
import { Stage } from "@/components/stage";
import { Experience } from "@/components/experience";
import { COVER_FIELDS } from "@/components/covers";

const YEAR = new Date().getFullYear();

const Hero = () => (
  <section className="relative flex h-svh items-end">
    <h1 className="sr-only">{site.name}</h1>
    <div className="mx-auto w-full max-w-6xl px-6 pb-28 sm:pb-24">
      <p data-hero-copy className="text-3xl/9 tracking-tight sm:text-lg/7 sm:tracking-normal">
        <span className="block text-foreground">{site.author}</span>
        <span className="block text-muted-foreground">{site.role}</span>
      </p>
    </div>
  </section>
);

const Projects = () => (
  <section id="projects" className="scroll-mt-20 py-24 sm:py-32">
    <div className="mx-auto w-full max-w-6xl px-6">
      <h2 className="flex justify-between text-sm text-muted-foreground">
        Projects
        <span className="font-mono text-xs tabular-nums sm:hidden">{String(projects.length).padStart(2, "0")}</span>
      </h2>
      {/* Phones swipe through the projects, the next one peeking in; from sm up it's a grid. */}
      <div className="-mx-6 mt-8 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto overscroll-x-contain px-6 [scrollbar-width:none] sm:mx-0 sm:grid sm:gap-6 sm:overflow-visible sm:px-0 md:grid-cols-2">
        {projects.map((project, index) => (
          <a
            key={project.name}
            href={project.href}
            target="_blank"
            rel="noreferrer"
            // With an odd count, the first entry spans the row so the grid stays even.
            data-wide={projects.length % 2 === 1 && index === 0 ? "" : undefined}
            className="group flex w-[85%] shrink-0 snap-start flex-col border bg-background sm:w-auto transition-[border-color] duration-200 ease-out-strong hover:border-foreground/40 focus-visible:border-foreground focus-visible:outline-none data-wide:md:col-span-2"
          >
            {project.cover && (
              <div className="relative aspect-square overflow-hidden border-b sm:aspect-auto sm:h-80 group-data-wide:sm:h-[26rem]">
                <DitherShader field={COVER_FIELDS[project.cover]} stillTime={6} className="absolute inset-0" />
              </div>
            )}
            <div className="flex flex-1 flex-col gap-3 p-6">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <h3 className="text-2xl font-medium tracking-tight">
                  {project.name}
                  {project.year && <span className="ml-3 text-base font-normal text-muted-foreground">{project.year}</span>}
                </h3>
                <span className="text-sm text-muted-foreground sm:shrink-0">{project.kind}</span>
              </div>
              {project.description && <p className="max-w-prose text-pretty text-muted-foreground">{project.description}</p>}
              {project.href && (
                <span className="mt-auto pt-2 font-mono text-xs text-muted-foreground transition-[color] duration-150 group-hover:text-foreground">
                  {new URL(project.href).host}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  </section>
);

// Official brand marks (Simple Icons), drawn in the theme colour.
const SOCIAL_ICONS: Record<(typeof site.socials)[number]["label"], { path: string }> = {
  X: siX,
  YouTube: siYoutube,
  GitHub: siGithub,
};

const About = () => (
  <section id="about" className="scroll-mt-20 py-24 sm:py-32">
    <div className="mx-auto w-full max-w-6xl px-6">
      <h2 className="text-sm text-muted-foreground">About</h2>

      {/* Who I am on the left, what I believe on the right. Same panel as Experience. */}
      <div className="-mx-6 mt-8 border-y bg-background p-6 sm:mx-0 sm:border sm:p-8">
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
        <div className="space-y-5 text-base/7 text-pretty text-foreground/75 lg:col-span-4 lg:text-lg/8">
          {site.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="space-y-8 text-2xl/snug font-light tracking-tight text-pretty lg:col-span-8 lg:text-3xl/snug">
          {site.philosophy.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>

      <div className="mt-20 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
        <a
          href={`mailto:${site.email}`}
          className="text-lg text-foreground underline decoration-foreground/30 underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-foreground"
        >
          {site.email}
        </a>
        <div className="-mx-2 flex gap-1">
          {site.socials.map((social) => {
            const icon = SOCIAL_ICONS[social.label];
            return (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                title={social.label}
                className="grid size-10 place-items-center text-muted-foreground transition-[color] duration-150 hover:text-foreground focus-visible:text-foreground focus-visible:outline-1 focus-visible:outline-foreground"
              >
                <svg viewBox="0 0 24 24" aria-hidden className="size-5 fill-current">
                  <path d={icon.path} />
                </svg>
              </a>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  </section>
);

// The last screen: the mark reassembles behind this in the field.
const Coda = () => (
  <section id="coda" className="relative flex h-svh items-end">
    <div className="mx-auto w-full max-w-6xl px-6 pb-28 text-sm text-muted-foreground sm:pb-20">
      © {YEAR} {site.name}
    </div>
  </section>
);

export default function App() {
  return (
    <div id="top">
      <Stage />
      <SiteHeader />
      <main>
        <Hero />
        <Projects />
        <Experience />
        <About />
        <Coda />
      </main>
    </div>
  );
}
