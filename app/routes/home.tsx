import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "etchebarne.net" },
    { name: "description", content: "etchebarne.net" },
  ];
}

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen px-6">
      <img src="/logo/etchebarne-logo.svg" alt="etchebarne.net" className="w-full max-w-xs select-none pointer-events-none" draggable={false} />
    </div>
  );
}
