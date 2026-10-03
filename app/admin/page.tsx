"use client";
import "./admin.css";
import { useEffect, useState } from "react";
import { ArrowUpRight, Asterisk, LogOut } from "lucide-react";
import type { Profile, Project } from "../../lib/content";
type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  read: number;
  createdAt: number;
};
type Data = { profile: Profile; projects: Project[]; messages: Message[] };
const newProject: Project = {
  id: "",
  title: "",
  category: "",
  description: "",
  stack: "",
  url: "",
  theme: "orbit",
};
async function api<T = Record<string, unknown>>(
  path: string,
  method = "GET",
  input?: unknown,
) {
  const response = await fetch(path, {
    method,
    headers: input ? { "Content-Type": "application/json" } : undefined,
    body: input ? JSON.stringify(input) : undefined,
  });
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok)
    throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}
export default function Admin() {
  const [auth, setAuth] = useState<boolean | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [tab, setTab] = useState("profile");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<Project>(newProject);
  useEffect(() => {
    let active = true;
    api<{ authorized: boolean }>("/api/session")
      .then((v) => {
        if (active) setAuth(v.authorized);
      })
      .catch((e) => {
        if (active) {
          setStatus(e.message);
          setAuth(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (auth) void load();
  }, [auth]);
  async function load() {
    try {
      setData(await api<Data>("/api/admin"));
      return true;
    } catch (e) {
      setStatus(
        e instanceof Error ? e.message : "Could not load your portfolio.",
      );
      return false;
    }
  }
  async function act(fn: () => Promise<unknown>, success: string) {
    setBusy(true);
    setStatus("");
    try {
      await fn();
      const refreshed = await load();
      setStatus(
        refreshed
          ? success
          : "Saved, but the workspace could not refresh. Please reload to see your changes.",
      );
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setStatus("");
    try {
      await api("/api/session", "POST", {
        password: new FormData(form).get("password"),
      });
      form.reset();
      setAuth(true);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }
  if (auth === null)
    return (
      <main className="admin-wrap loading" role="status">
        Opening your workspace…
      </main>
    );
  if (!auth)
    return (
      <main className="admin-wrap">
        <a className="wordmark" href="/">
          <Asterisk size={24} />
          Back to portfolio
        </a>
        <section className="admin-panel login">
          <p className="eyebrow">YOUR PRIVATE WORKSPACE</p>
          <h2>Make it yours.</h2>
          <p className="admin-note">
            Sign in to edit your profile, publish your projects, and read
            contact messages.
          </p>
          <form className="admin-form" onSubmit={login}>
            <label>
              Admin access key
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                placeholder="Enter your private access key"
              />
            </label>
            <button type="submit" className="button accent" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
              <ArrowUpRight size={16} />
            </button>
          </form>
          <p role="status" className="form-status">
            {status}
          </p>
        </section>
      </main>
    );
  return (
    <main className="admin-wrap">
      <header className="admin-header">
        <div>
          <p className="eyebrow">PORTFOLIO WORKSPACE</p>
          <h1>Your work. Your story.</h1>
        </div>
        <div className="actions">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="button secondary"
          >
            View portfolio <ArrowUpRight size={14} />
          </a>
          <button
            className="button secondary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await api("/api/session", "DELETE");
                setAuth(false);
                setData(null);
                setStatus("");
              } catch (e) {
                setStatus(
                  e instanceof Error ? e.message : "Could not sign out.",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </header>
      <nav className="admin-tabs" aria-label="Workspace sections">
        {["profile", "projects", "inbox"].map((item) => (
          <button
            className={tab === item ? "active" : ""}
            key={item}
            onClick={() => {
              setTab(item);
              setStatus("");
            }}
          >
            {item[0].toUpperCase() + item.slice(1)}
            {item === "inbox" && data
              ? ` (${data.messages.filter((m) => !m.read).length})`
              : ""}
          </button>
        ))}
      </nav>
      <p role="status" className="form-status">
        {status}
      </p>
      {!data ? (
        <section className="admin-panel">
          <p>We couldn’t load your workspace yet.</p>
          <button className="button accent" onClick={() => void load()}>
            Reload workspace
          </button>
        </section>
      ) : (
        <>
          {tab === "profile" && (
            <section className="admin-panel">
              <form
                className="admin-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  void act(
                    () => api("/api/admin", "PUT", data.profile),
                    "Profile saved. Your portfolio is updated.",
                  );
                }}
              >
                <h2>Introduce yourself</h2>
                <div className="admin-grid">
                  {(
                    [
                      ["name", "Your name"],
                      ["role", "Professional role"],
                      ["email", "Public email (optional)"],
                      ["skills", "Skills (separated by commas)"],
                      ["github", "GitHub URL (optional)"],
                      ["linkedin", "LinkedIn URL (optional)"],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key}>
                      {label}
                      <input
                        type={
                          key === "email"
                            ? "email"
                            : key === "github" || key === "linkedin"
                              ? "url"
                              : "text"
                        }
                        value={data.profile[key]}
                        maxLength={key === "skills" ? 1000 : 1000}
                        required={key === "name" || key === "role"}
                        onChange={(e) =>
                          setData({
                            ...data,
                            profile: { ...data.profile, [key]: e.target.value },
                          })
                        }
                      />
                    </label>
                  ))}
                </div>
                <label>
                  Main headline (use a new line for emphasis)
                  <textarea
                    rows={2}
                    required
                    maxLength={160}
                    value={data.profile.headline}
                    onChange={(e) =>
                      setData({
                        ...data,
                        profile: { ...data.profile, headline: e.target.value },
                      })
                    }
                  />
                </label>
                <label>
                  Your story
                  <textarea
                    rows={5}
                    maxLength={3000}
                    value={data.profile.bio}
                    onChange={(e) =>
                      setData({
                        ...data,
                        profile: { ...data.profile, bio: e.target.value },
                      })
                    }
                  />
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={data.profile.available}
                    onChange={(e) =>
                      setData({
                        ...data,
                        profile: {
                          ...data.profile,
                          available: e.target.checked,
                        },
                      })
                    }
                  />
                  Show that I’m open to opportunities
                </label>
                <br />
                <button className="button accent" disabled={busy}>
                  Save profile <ArrowUpRight size={16} />
                </button>
              </form>
            </section>
          )}
          {tab === "projects" && (
            <div className="admin-grid">
              <section>
                <h2 style={{ fontSize: 23, marginBottom: 24 }}>
                  Selected work
                </h2>
                {data.projects.map((p) => (
                  <article className="admin-list" key={p.id}>
                    <h3>{p.title}</h3>
                    <p>{p.category}</p>
                    <div className="actions">
                      <button
                        className="secondary"
                        onClick={() => {
                          setDraft(p);
                          setStatus("");
                        }}
                      >
                        Edit project
                      </button>
                      <button
                        className="secondary danger"
                        disabled={busy}
                        onClick={() => {
                          if (window.confirm(`Delete “${p.title}”?`))
                            void act(
                              () =>
                                api("/api/admin", "DELETE", {
                                  id: p.id,
                                  type: "project",
                                }),
                              "Project deleted.",
                            );
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
                {!data.projects.length && (
                  <p className="admin-note">
                    Add your first project to start your collection.
                  </p>
                )}
                <button
                  className="button secondary"
                  onClick={() => setDraft({ ...newProject })}
                >
                  New project
                </button>
              </section>
              <section className="admin-panel">
                <form
                  className="admin-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void act(async () => {
                      await api("/api/admin", "POST", draft);
                      setDraft({ ...newProject });
                    }, "Project saved. Your portfolio is updated.");
                  }}
                >
                  <h2>{draft.id ? "Edit project" : "Add a project"}</h2>
                  <label>
                    Project title
                    <input
                      required
                      maxLength={120}
                      value={draft.title}
                      onChange={(e) =>
                        setDraft({ ...draft, title: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Category
                    <input
                      required
                      maxLength={160}
                      placeholder="Web application · 2026"
                      value={draft.category}
                      onChange={(e) =>
                        setDraft({ ...draft, category: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Project story
                    <textarea
                      rows={4}
                      required
                      maxLength={3000}
                      value={draft.description}
                      onChange={(e) =>
                        setDraft({ ...draft, description: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Tools & skills (separated by commas)
                    <input
                      maxLength={500}
                      value={draft.stack}
                      onChange={(e) =>
                        setDraft({ ...draft, stack: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Project link (optional)
                    <input
                      type="url"
                      maxLength={1000}
                      value={draft.url}
                      onChange={(e) =>
                        setDraft({ ...draft, url: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Cover design
                    <select
                      value={draft.theme}
                      onChange={(e) =>
                        setDraft({ ...draft, theme: e.target.value })
                      }
                    >
                      <option value="orbit">Workspace / pale green</option>
                      <option value="form">Editorial / sage</option>
                    </select>
                  </label>
                  <button className="button accent" disabled={busy}>
                    Save project <ArrowUpRight size={16} />
                  </button>
                </form>
              </section>
            </div>
          )}
          {tab === "inbox" && (
            <section className="admin-panel">
              <div className="admin-header">
                <h2 style={{ fontSize: 23 }}>Contact inbox</h2>
                <button
                  className="secondary"
                  disabled={busy}
                  onClick={() => void load()}
                >
                  Refresh inbox
                </button>
              </div>
              <p className="admin-note">
                Messages are saved here. The latest 200 are shown. Email
                notifications are not enabled.
              </p>
              {data.messages.map((m) => (
                <article className="admin-list" key={m.id}>
                  <h3>
                    {m.name} {!m.read && <small>· New</small>}
                  </h3>
                  <a className="text-link" href={`mailto:${m.email}`}>
                    {m.email}
                  </a>
                  <p>{m.message}</p>
                  <small>{new Date(m.createdAt).toLocaleString()}</small>
                  <div className="actions">
                    {!m.read && (
                      <button
                        disabled={busy}
                        className="secondary"
                        onClick={() =>
                          void act(
                            () => api("/api/admin", "PATCH", { id: m.id }),
                            "Marked as read.",
                          )
                        }
                      >
                        Mark as read
                      </button>
                    )}
                    <button
                      className="secondary danger"
                      disabled={busy}
                      onClick={() => {
                        if (window.confirm("Delete this message?"))
                          void act(
                            () =>
                              api("/api/admin", "DELETE", {
                                id: m.id,
                                type: "message",
                              }),
                            "Message deleted.",
                          );
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
              {!data.messages.length && (
                <p className="empty-state">
                  No messages yet. New conversations will appear here.
                </p>
              )}
            </section>
          )}
        </>
      )}
    </main>
  );
}
