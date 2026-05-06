import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "etchebarne.net" },
    { name: "description", content: "etchebarne.net project" },
  ];
}

const projects = [
  {
    name: "Kosmos",
    description: "Code editor",
    href: "https://kosmos.etchebarne.net",
  },
  {
    name: "Coming Soon",
  },
];

export default function Home() {
  return (
    <main className="site-shell">
      <section className="text-card" aria-label="etchebarne.net information">
        <img
          src="/logo/etchebarne-logo.svg"
          alt="etchebarne.net"
          className="site-logo"
          draggable={false}
        />

        <p>etchebarne.net is a long-term effort to make Linux a better place for regular users. Linux gives people freedom, performance, and control over their computers, but it can still feel difficult to adopt when essential software lacks polish or approachability. This project aims to close that gap by building friendly, high-quality tools that help people use Linux comfortably in their day-to-day lives.</p>

        <hr />

        <h2>PROJECTS:</h2>

        <ul>
          {projects.map((project) => (
            <li key={project.name}>
              {project.href ? (
                <a href={project.href} target="_blank" rel="noreferrer">
                  {project.name}
                </a>
              ) : (
                project.name
              )}
              {project.description ? ` - ${project.description}` : null}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
