"use client";

import { useRef, useState, type PointerEvent } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Code2,
  Layers3,
  Search,
  ShieldCheck,
  ShoppingBag,
  Terminal,
  Workflow,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import type { Project } from "../../lib/content";

const FILTERS = ["All work", "Full stack", "Backend", "Frontend"] as const;
type Filter = (typeof FILTERS)[number];

function category(project: Project): Filter {
  const value = project.category.toLowerCase();
  if (value.includes("frontend")) return "Frontend";
  if (value.includes("backend")) return "Backend";
  return "Full stack";
}

function ProjectPreview({ project }: { project: Project }) {
  if (["estore", "ecommerce", "xprice"].includes(project.id)) {
    return (
      <div className="commerce-preview">
        <div className="preview-nav">
          <span>{project.title}</span>
          <ShoppingBag size={16} />
        </div>
        <div className="commerce-title">
          {project.id === "xprice" ? (
            <>
              Find the one.
              <br />
              <em>At the right price.</em>
            </>
          ) : (
            <>
              The everyday,
              <br />
              <em>elevated.</em>
            </>
          )}
        </div>
        <div className="product-pedestals">
          <div>
            <div className="product-object object-one" />
          </div>
          <div>
            <div className="product-object object-two" />
          </div>
          <div>
            <div className="product-object object-three" />
          </div>
        </div>
        <div className="preview-footer">
          <span>
            {project.id === "xprice"
              ? "COMPARE · DISCOVER · DECIDE"
              : "EXPLORE THE COLLECTION"}
          </span>
          <ArrowRight size={15} />
        </div>
      </div>
    );
  }

  if (project.id === "interactive-portfolio") {
    return (
      <div className="dimension-preview">
        <div className="dimension-orbit" />
        <div className="dimension-orbit orbit-alt" />
        <div className="dimension-core">
          MA<span>DEVELOPER / CREATOR</span>
        </div>
        <span className="dimension-label">ANOTHER DIMENSION.</span>
      </div>
    );
  }

  if (category(project) === "Backend" || project.id.includes("api")) {
    return (
      <div className="api-preview">
        <div className="terminal-bar">
          <span />
          <span />
          <span />
          <p>{project.title.replaceAll(" ", "-").toLowerCase()}.cs</p>
        </div>
        <div className="code-lines">
          <span>
            <i>01</i>
            <b>public class</b>{" "}
            {project.title.split(" ")[0].replaceAll("-", "")}Controller
          </span>
          <span>
            <i>02</i>
            {"{"}
          </span>
          <span>
            <i>03</i> <em>[HttpGet]</em>
          </span>
          <span>
            <i>04</i> <b>public async</b> Task&lt;IActionResult&gt;
          </span>
          <span>
            <i>05</i> GetAll()
          </span>
          <span>
            <i>06</i> {"{"}
          </span>
          <span>
            <i>07</i> <b>return</b> Ok(await service.GetAll());
          </span>
          <span>
            <i>08</i> {"}"}
          </span>
          <span>
            <i>09</i>
            {"}"}
          </span>
        </div>
        <div className="api-status">
          <ShieldCheck size={15} />
          <span>AUTHENTICATION · BUSINESS LOGIC · DATA</span>
        </div>
      </div>
    );
  }

  return (
    <div className="platform-preview">
      <div className="platform-rail">
        <Layers3 size={22} />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="platform-main">
        <div className="preview-nav">
          <span>{project.title}</span>
          <span className="preview-avatar">MA</span>
        </div>
        <div className="platform-heading">
          <span>YOUR WORKSPACE</span>
          <strong>
            People. Process.
            <br />
            Progress.
          </strong>
        </div>
        <div className="platform-chart">
          {[28, 48, 38, 63, 56, 86, 73, 98, 82, 100].map((height, index) => (
            <span key={index} style={{ height: `${height}%` }} />
          ))}
        </div>
        <div className="platform-flow">
          <span>
            <Workflow size={12} /> Draft
          </span>
          <ArrowRight size={12} />
          <span>Submit</span>
          <ArrowRight size={12} />
          <span>Review</span>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  index,
  paused,
}: {
  project: Project;
  index: number;
  paused: boolean;
}) {
  const card = useRef<HTMLElement>(null);
  const kind = category(project);
  const theme = ["estore", "ecommerce", "xprice"].includes(project.id)
    ? "peach"
    : project.id === "interactive-portfolio"
      ? "violet"
      : kind === "Backend"
        ? "slate"
        : "cyan";

  function tilt(event: PointerEvent<HTMLElement>) {
    if (paused || event.pointerType !== "mouse" || !card.current) return;
    const rectangle = card.current.getBoundingClientRect();
    card.current.style.setProperty(
      "--rx",
      `${((event.clientY - rectangle.top) / rectangle.height - 0.5) * -5}deg`,
    );
    card.current.style.setProperty(
      "--ry",
      `${((event.clientX - rectangle.left) / rectangle.width - 0.5) * 5}deg`,
    );
  }

  function resetTilt() {
    card.current?.style.setProperty("--rx", "0deg");
    card.current?.style.setProperty("--ry", "0deg");
  }

  return (
    <Dialog>
      <article
        ref={card}
        className={`project-card theme-${theme}`}
        onPointerMove={tilt}
        onPointerLeave={resetTilt}
        style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
      >
        <DialogTrigger asChild>
          <button
            className="project-cover"
            aria-label={`Explore ${project.title}`}
          >
            <span className="cover-top">
              <span>
                {String(index + 1).padStart(2, "0")} / {kind.toUpperCase()}
              </span>
              <span>INTERFACE CONCEPT</span>
            </span>
            <div className="project-art">
              <ProjectPreview project={project} />
            </div>
            <span className="cover-bottom">
              <span>{project.stack.split(",")[0]}</span>
              <span className="cover-arrow">
                <ArrowUpRight size={22} />
              </span>
            </span>
          </button>
        </DialogTrigger>
        <div className="project-info">
          <p>{project.category}</p>
          <div>
            <h3>{project.title}</h3>
            <DialogTrigger asChild>
              <button
                className="project-detail-button"
                aria-label={`View ${project.title} case study`}
              >
                <ArrowUpRight size={21} />
              </button>
            </DialogTrigger>
          </div>
          <p className="project-summary">{project.description}</p>
          <div className="project-tags">
            {project.stack
              .split(",")
              .slice(0, 3)
              .map((tag) => (
                <span key={tag}>{tag.trim()}</span>
              ))}
          </div>
        </div>
      </article>
      <DialogContent className="project-dialog">
        <div className={`dialog-art theme-${theme}`} aria-hidden="true">
          <ProjectPreview project={project} />
        </div>
        <p className="eyebrow">{kind.toUpperCase()} / PROJECT OVERVIEW</p>
        <DialogTitle>{project.title}</DialogTitle>
        <DialogDescription>{project.description}</DialogDescription>
        <h3>Built with</h3>
        <div className="project-tags">
          {project.stack.split(",").map((tag) => (
            <span key={tag}>{tag.trim()}</span>
          ))}
        </div>
        {project.url && (
          <a
            className="button primary"
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit live project <ArrowUpRight size={18} />
          </a>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ProjectGallery({
  projects,
  paused,
}: {
  projects: Project[];
  paused: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("All work");
  const [search, setSearch] = useState("");
  const visible = projects.filter(
    (project) =>
      (filter === "All work" || category(project) === filter) &&
      `${project.title} ${project.stack} ${project.description}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );

  return (
    <>
      <div className="work-controls">
        <div className="filter-tabs" aria-label="Filter projects">
          {FILTERS.map((item) => (
            <button
              key={item}
              aria-pressed={filter === item}
              className={filter === item ? "selected" : ""}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <label className="project-search">
          <Search size={17} />
          <input
            aria-label="Search projects"
            placeholder="Find a project or technology"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>
      <p className="results-count" role="status">
        {visible.length} project{visible.length === 1 ? "" : "s"} /{" "}
        {filter.toLowerCase()}
      </p>
      <div className="project-grid">
        {visible.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
            paused={paused}
          />
        ))}
      </div>
      {!visible.length && (
        <div className="empty-projects">
          <Code2 size={30} />
          <h3>No matching projects.</h3>
          <p>Try another technology or clear the filters.</p>
          <button
            className="button secondary"
            onClick={() => {
              setSearch("");
              setFilter("All work");
            }}
          >
            Show all work
          </button>
        </div>
      )}
    </>
  );
}
