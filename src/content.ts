// Draft copy: edit freely. Add new work to `projects`; newest first.
export const site = {
  name: "etchebarne.net",
  author: "Martin Etchebarne",
  role: "Design Engineer",
  description: "Martin Etchebarne, design engineer. A collection of what I build.",
  // Written by Martin. One string per paragraph.
  philosophy: [
    "Software should mold to the people using it, not the other way around. When I started using Linux, I couldn’t help but make my own plugins and apps to adjust it to my liking, and the same thing happened when I switched to Neovim for programming. Freedom has been the thread through everything I’ve built since.",
    "Anyone can build anything now. What’s rare is knowing what’s worth building, what belongs and what’s enough. I care about the details, and about making things people can trust.",
  ],
  intro: [
    "I’m Martin Etchebarne, a design engineer from Buenos Aires. I started as a freelancer in 2020, moved into a full-time position later and went on to become a frontend team leader. Today I work on the line between aesthetics and technology.",
    "Outside of client work I’m the co-founder of Amekz, an indie game studio. I’m also studying UX/UI design at UTN on the side.",
  ],
  email: "martin@etchebarne.net",
  socials: [
    { label: "X", href: "https://x.com/etchebarne" },
    { label: "YouTube", href: "https://www.youtube.com/@etchebarne" },
    { label: "GitHub", href: "https://github.com/etchebarne" },
  ],
} as const;

/** Dithered covers available for projects. Add a field in src/components/covers. */
export type Cover = "mark" | "peaks" | "levels";

export interface Project {
  name: string;
  /** What it is, in a word or two. */
  kind: string;
  description?: string;
  href?: string;
  year?: number;
  cover?: Cover;
}

export const projects: Project[] = [
  {
    name: "Amekz",
    kind: "Game studio",
    description: "An independent game studio.",
    href: "https://amekz.com",
    cover: "mark",
  },
  {
    name: "Elevintia",
    kind: "Digital communities",
    description: "Strategy, design and technology for online communities, since 2017.",
    href: "https://elevintia.com",
    cover: "peaks",
  },
  {
    name: "Vintia",
    kind: "Discord app",
    description: "Highly configurable and innovative Discord app.",
    href: "https://vintia.elevintia.com",
    cover: "levels",
  },
];

export interface Role {
  title: string;
  /** "YYYY-MM" */
  start: string;
  /** "YYYY-MM", or omit while it's current. */
  end?: string;
}

export interface Job {
  company: string;
  type: string;
  roles: Role[];
}

// From the resume (github.com/etchebarne/resume), plus Afterimage. Shown in this order.
export const experience: Job[] = [
  {
    company: "BetFrame",
    type: "Full-time",
    roles: [
      { title: "Design Engineer", start: "2026-01" },
      { title: "Lead Frontend Developer", start: "2024-09", end: "2025-12" },
      { title: "Frontend Developer", start: "2022-06", end: "2024-08" },
    ],
  },
  {
    company: "Afterimage",
    type: "Contractor",
    roles: [{ title: "Design Engineer", start: "2026-09" }],
  },
  {
    company: "No Standing",
    type: "Contractor",
    roles: [{ title: "Fullstack Developer", start: "2025-01", end: "2026-02" }],
  },
];
