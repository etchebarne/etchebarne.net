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

const projectsList = document.querySelector("#projects-list");

if (projectsList) {
  for (const project of projects) {
    const item = document.createElement("li");

    if (project.href) {
      const link = document.createElement("a");
      link.href = project.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = project.name;
      item.append(link);
    } else {
      item.append(project.name);
    }

    if (project.description) {
      item.append(` - ${project.description}`);
    }

    projectsList.append(item);
  }
}
