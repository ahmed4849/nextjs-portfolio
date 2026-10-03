"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Award,
  Braces,
  Check,
  Code2,
  GraduationCap,
  Layers3,
  MapPin,
  Menu,
  Pause,
  Play,
  Send,
  Terminal,
  X,
} from "lucide-react";
import { background, type Profile, type Project } from "../lib/content";
import { ParticleSculpture } from "../components/portfolio/particle-sculpture";
import { ProjectGallery } from "../components/portfolio/project-gallery";
import { ContactForm } from "../components/portfolio/contact-form";
import { useMotion, useReveals } from "../components/portfolio/use-motion";
import "./portfolio.css";

const NAVIGATION = [
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "journey", label: "Journey" },
];

function SectionHeading({
  number,
  label,
  children,
}: {
  number: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="section-title" data-reveal>
      <p className="eyebrow">
        <span>{number}</span>
        {label}
      </p>
      <h2>{children}</h2>
    </div>
  );
}

export default function Portfolio({
  initialProfile: profile,
  initialProjects: projects,
}: {
  initialProfile: Profile;
  initialProjects: Project[];
}) {
  const root = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [skillTab, setSkillTab] = useState("Engineering");
  const { paused, toggle } = useMotion();
  useReveals(root);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const distance =
        document.documentElement.scrollHeight - window.innerHeight;
      if (progress.current)
        progress.current.style.transform = `scaleX(${distance > 0 ? window.scrollY / distance : 0})`;
      frame = 0;
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll);
    update();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActiveSection(entry.target.id);
      },
      { rootMargin: "-15% 0px -65% 0px" },
    );
    root.current
      ?.querySelectorAll("section[id]")
      .forEach((section) => observer.observe(section));

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", scroll);
      observer.disconnect();
    };
  }, []);

  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("");
  const skills = profile.skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
  const visibleSkills = skills.filter((skill) => {
    const frontend =
      /angular|typescript|html|css|three|tailwind|bootstrap/i.test(skill);
    const exploration = /\bAI\b|generative|n8n|agent/i.test(skill);
    return skillTab === "Interface"
      ? frontend
      : skillTab === "Exploration"
        ? exploration
        : !frontend && !exploration;
  });
  const headline = profile.headline.split("\n");

  return (
    <div
      ref={root}
      className="portfolio"
      data-motion={paused ? "paused" : "running"}
    >
      <a className="skip" href="#main">
        Skip to content
      </a>
      <div className="reading-progress" ref={progress} aria-hidden="true" />
      <header className="site-header">
        <div className="header-inner container">
          <a
            className="brand"
            href="#home"
            aria-label={`${profile.name}, home`}
          >
            <span className="brand-symbol">
              {initials}
              <i />
            </span>
            <span>
              {profile.name}
              <small>{profile.role}</small>
            </span>
          </a>
          <nav
            className={`desktop-nav ${menuOpen ? "menu-open" : ""}`}
            id="portfolio-navigation"
            aria-label="Main navigation"
            onKeyDown={(event) => {
              if (event.key === "Escape") setMenuOpen(false);
            }}
          >
            {NAVIGATION.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={activeSection === item.id ? "active" : ""}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
                <span />
              </a>
            ))}
            <a
              className="nav-cta"
              href="#contact"
              onClick={() => setMenuOpen(false)}
            >
              Let’s build something <ArrowUpRight size={16} />
            </a>
          </nav>
          <button
            className="mobile-menu-button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="portfolio-navigation"
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <main id="main">
        <section className="hero-section container" id="home">
          <div className="hero-copy">
            <p className="availability">
              <span />
              {profile.available
                ? "AVAILABLE FOR NEW OPPORTUNITIES"
                : "DEVELOPER / CREATOR"}
            </p>
            <p className="hero-kicker">
              <span>HELLO, I’M {profile.name.toUpperCase()}</span>
              <span className="hero-kicker-line" />
            </p>
            <h1>
              {headline.map((line, index) => (
                <span
                  className={index === 0 ? "headline-first" : "headline-accent"}
                  key={index}
                >
                  {line}
                </span>
              ))}
            </h1>
            <p className="hero-description">
              I turn complex problems into considered digital experiences. From
              robust .NET backends to interfaces that feel effortless.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#work">
                Explore my work <ArrowUpRight size={19} />
              </a>
              <a className="button text-button" href="#contact">
                Let’s talk <ArrowRight size={18} />
              </a>
            </div>
            <div className="hero-location">
              <MapPin size={14} />
              {background.location}
              <span>·</span>
              <span>Building for everywhere.</span>
            </div>
          </div>
          <div className="hero-stage">
            <div className="stage-grid" aria-hidden="true" />
            <div className="stage-orbit" aria-hidden="true" />
            <ParticleSculpture paused={paused} />
            <div className="floating-code">
              <div className="window-dots">
                <i />
                <i />
                <i />
                <span>ahmad.dev / build</span>
              </div>
              <div>
                <span className="code-purple">const</span> developer = {"{"}
                <br />
                <span className="code-indent">
                  focus: <span className="code-peach">"full-stack"</span>,
                </span>
                <br />
                <span className="code-indent">
                  craft: <span className="code-cyan">"every detail"</span>
                </span>
                <br />
                {"}"};
              </div>
              <p>
                <Check size={12} /> Built with intention.
              </p>
            </div>
            <div className="floating-system">
              <span className="system-icon">
                <Layers3 size={21} />
              </span>
              <div>
                <strong>Architecture to interface</strong>
                <span>One connected experience</span>
              </div>
              <span className="system-dot" />
            </div>
            <span className="stage-coordinate">3D / CREATIVE ENGINEERING</span>
            <div className="stage-controls">
              <span className="pointer-hint">MOVE YOUR CURSOR TO EXPLORE</span>
              <button
                onClick={toggle}
                aria-label={paused ? "Resume animations" : "Pause animations"}
                aria-pressed={paused}
              >
                {paused ? <Play size={13} /> : <Pause size={13} />}
                {paused ? "Motion paused" : "Motion on"}
              </button>
            </div>
          </div>
          <div className="hero-footnote">
            <span>ENGINEERING PRECISION. CREATIVE INSTINCT.</span>
            <a href="#work">
              THE WORK <ArrowDown size={16} />
            </a>
          </div>
        </section>

        <div className="technology-marquee" aria-label="Core technologies">
          <div className="marquee-track" aria-hidden="true">
            {[0, 1].map((copy) => (
              <div className="marquee-set" key={copy}>
                {[
                  "C# / .NET",
                  "ASP.NET CORE",
                  "ANGULAR",
                  "SQL SERVER",
                  "CLEAN ARCHITECTURE",
                  "CREATIVE DEVELOPMENT",
                ].map((technology) => (
                  <span key={technology}>
                    {technology}
                    <i>✦</i>
                  </span>
                ))}
              </div>
            ))}
          </div>
          <span className="sr-only">
            C#, .NET, ASP.NET Core, Angular, SQL Server, Clean Architecture,
            Creative Development
          </span>
        </div>

        <section id="work" className="work-section section container">
          <div className="section-heading">
            <SectionHeading number="01" label="SELECTED WORK">
              Ideas, brought
              <br />
              <em>into the real world.</em>
            </SectionHeading>
            <div className="section-aside" data-reveal>
              <span className="section-count">
                {String(projects.length).padStart(2, "0")}
              </span>
              <p>
                Projects across systems,
                <br />
                interfaces, and experiences.
              </p>
            </div>
          </div>
          <ProjectGallery projects={projects} paused={paused} />
        </section>

        <section id="about" className="about-section section">
          <div className="container">
            <div className="about-grid">
              <div className="about-identity" data-reveal>
                <p className="eyebrow">
                  <span>02</span> THE PERSON BEHIND THE PIXELS
                </p>
                <h2>
                  A builder’s mind.
                  <br />
                  <em>A creator’s eye.</em>
                </h2>
                <div className="identity-art" aria-hidden="true">
                  <span className="identity-initials">{initials}</span>
                  <div className="identity-orbit" />
                  <div className="identity-orbit second" />
                  <div className="identity-caption">
                    <Braces size={19} />
                    <span>LOGIC × IMAGINATION</span>
                  </div>
                </div>
              </div>
              <div className="about-story" data-reveal>
                <p className="about-intro">
                  {profile.role}
                  <span> / {background.location}</span>
                </p>
                {profile.bio
                  .split("\n\n")
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                <div className="working-principles">
                  <div>
                    <Code2 />
                    <span>Built to work.</span>
                    <p>Thoughtful architecture and dependable systems.</p>
                  </div>
                  <div>
                    <Layers3 />
                    <span>Designed to feel.</span>
                    <p>
                      Clear interfaces with attention to the smallest details.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="skills-panel" data-reveal>
              <div>
                <p className="eyebrow">MY TOOLKIT</p>
                <h3>
                  Different tools.
                  <br />
                  <em>One considered result.</em>
                </h3>
              </div>
              <div>
                <div className="skill-tabs" aria-label="Skill categories">
                  {["Engineering", "Interface", "Exploration"].map((tab) => (
                    <button
                      key={tab}
                      className={skillTab === tab ? "selected" : ""}
                      aria-pressed={skillTab === tab}
                      onClick={() => setSkillTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="skill-chips" role="status">
                  {visibleSkills.length ? (
                    visibleSkills.map((skill) => (
                      <span key={skill}>
                        <span className="chip-dot" />
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p>More skills coming soon.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="journey" className="journey-section section container">
          <div className="section-heading">
            <SectionHeading number="03" label="THE JOURNEY">
              Always building.
              <br />
              <em>Always becoming.</em>
            </SectionHeading>
            <p className="section-aside" data-reveal>
              A foundation in computer science.
              <br />A curiosity that keeps moving.
            </p>
          </div>
          <div className="journey-grid">
            <div className="career-timeline">
              <p className="column-label">
                <Terminal size={17} /> EXPERIENCE
              </p>
              {background.experience.map((item, index) => (
                <article
                  className="career-entry"
                  key={item.company}
                  data-reveal
                >
                  <span className="timeline-node" />
                  <div className="career-meta">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span>{item.period}</span>
                  </div>
                  <h3>{item.role}</h3>
                  <p className="career-company">
                    {item.company}
                    <ArrowUpRight size={16} />
                  </p>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
            <div className="education-column">
              <p className="column-label">
                <GraduationCap size={19} /> EDUCATION
              </p>
              {background.education.map((item) => (
                <article
                  className="education-card"
                  key={item.title}
                  data-reveal
                >
                  <span>{item.period}</span>
                  <h3>{item.title}</h3>
                  <p>{item.institution}</p>
                  <GraduationCap
                    className="education-watermark"
                    aria-hidden="true"
                  />
                </article>
              ))}
              <div className="certificate-panel" data-reveal>
                <p className="column-label">
                  <Award size={17} /> CONTINUOUS LEARNING
                </p>
                {background.certifications.map((item, index) => (
                  <div key={item}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <p>{item}</p>
                    <ArrowUpRight size={15} />
                  </div>
                ))}
                <p className="language-note">
                  I speak {background.languages.replace(",", " &")}.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="contact-section section">
          <div className="contact-glow" aria-hidden="true" />
          <div className="container">
            <p className="eyebrow" data-reveal>
              <span>04</span> WHAT’S NEXT?
            </p>
            <div className="contact-grid">
              <div className="contact-copy" data-reveal>
                <h2>
                  Good things
                  <br />
                  start with
                  <br />
                  <em>a conversation.</em>
                </h2>
                <p>
                  Have a project in mind, a role to discuss,
                  <br />
                  or an idea worth exploring? Let’s connect.
                </p>
                {profile.email && (
                  <a className="contact-email" href={`mailto:${profile.email}`}>
                    {profile.email}
                    <ArrowUpRight size={21} />
                  </a>
                )}
                <div className="contact-socials">
                  {profile.github && (
                    <a
                      href={profile.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub
                      <ArrowUpRight size={16} />
                    </a>
                  )}
                  {profile.linkedin && (
                    <a
                      href={profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LinkedIn
                      <ArrowUpRight size={16} />
                    </a>
                  )}
                  <a href="tel:+923147809083">
                    Call me
                    <ArrowUpRight size={16} />
                  </a>
                </div>
              </div>
              <div className="contact-form-panel" data-reveal>
                <div className="form-panel-header">
                  <Send size={20} />
                  <span>Let’s make something meaningful.</span>
                </div>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer container">
        <a href="#home" className="footer-signature">
          {profile.name}
          <span>.</span>
        </a>
        <div>
          <span>© {new Date().getFullYear()} · Crafted with intention.</span>
          <a href="/admin">
            Manage portfolio
            <ArrowUpRight size={13} />
          </a>
        </div>
        <a className="back-top" href="#home" aria-label="Back to top">
          <ArrowUp size={21} />
        </a>
      </footer>
    </div>
  );
}
