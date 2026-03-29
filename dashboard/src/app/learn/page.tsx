"use client";

import { useEffect, useState } from "react";

interface TopicDef {
  name: string;
  category: string;
  description: string;
}

interface APIData {
  skillTree: { topics: Record<string, TopicDef> };
}

const resources: Record<string, { title: string; url: string; type: "docs" | "cheatsheet" | "tool" }[]> = {
  "sql-injection": [
    { title: "PortSwigger — SQL Injection", url: "https://portswigger.net/web-security/sql-injection", type: "docs" },
    { title: "SQL Injection Cheat Sheet", url: "https://portswigger.net/web-security/sql-injection/cheat-sheet", type: "cheatsheet" },
    { title: "OWASP — SQL Injection", url: "https://owasp.org/www-community/attacks/SQL_Injection", type: "docs" },
    { title: "sqlmap", url: "https://github.com/sqlmapproject/sqlmap", type: "tool" },
  ],
  xss: [
    { title: "PortSwigger — XSS", url: "https://portswigger.net/web-security/cross-site-scripting", type: "docs" },
    { title: "XSS Cheat Sheet", url: "https://portswigger.net/web-security/cross-site-scripting/cheat-sheet", type: "cheatsheet" },
    { title: "OWASP — XSS Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html", type: "docs" },
  ],
  authentication: [
    { title: "PortSwigger — Authentication", url: "https://portswigger.net/web-security/authentication", type: "docs" },
    { title: "OWASP Auth Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html", type: "cheatsheet" },
  ],
  "access-control": [
    { title: "PortSwigger — Access Control", url: "https://portswigger.net/web-security/access-control", type: "docs" },
    { title: "OWASP Broken Access Control", url: "https://owasp.org/Top10/A01_2021-Broken_Access_Control/", type: "docs" },
  ],
  "command-injection": [
    { title: "PortSwigger — OS Command Injection", url: "https://portswigger.net/web-security/os-command-injection", type: "docs" },
    { title: "Payload List", url: "https://github.com/payloadbox/command-injection-payload-list", type: "cheatsheet" },
  ],
  "path-traversal": [
    { title: "PortSwigger — Path Traversal", url: "https://portswigger.net/web-security/file-path-traversal", type: "docs" },
  ],
  csrf: [
    { title: "PortSwigger — CSRF", url: "https://portswigger.net/web-security/csrf", type: "docs" },
    { title: "OWASP CSRF Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html", type: "cheatsheet" },
  ],
  ssrf: [
    { title: "PortSwigger — SSRF", url: "https://portswigger.net/web-security/ssrf", type: "docs" },
    { title: "SSRF Payloads", url: "https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Server%20Side%20Request%20Forgery", type: "cheatsheet" },
  ],
  jwt: [
    { title: "PortSwigger — JWT Attacks", url: "https://portswigger.net/web-security/jwt", type: "docs" },
    { title: "jwt.io Debugger", url: "https://jwt.io/", type: "tool" },
  ],
  ssti: [
    { title: "PortSwigger — SSTI", url: "https://portswigger.net/web-security/server-side-template-injection", type: "docs" },
    { title: "SSTI Payloads", url: "https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Server%20Side%20Template%20Injection", type: "cheatsheet" },
    { title: "tplmap", url: "https://github.com/epinna/tplmap", type: "tool" },
  ],
  "http-request-smuggling": [
    { title: "PortSwigger — Request Smuggling", url: "https://portswigger.net/web-security/request-smuggling", type: "docs" },
    { title: "smuggler tool", url: "https://github.com/defparam/smuggler", type: "tool" },
  ],
};

const typeBadge: Record<string, string> = {
  docs: "bg-accent/10 text-accent",
  cheatsheet: "bg-warn/10 text-warn",
  tool: "bg-success/10 text-success",
};

function getTopicUrl(id: string): string {
  const map: Record<string, string> = {
    "dom-based": "dom-xss", "insecure-deserialization": "deserialization",
    "http-host-header": "host-header", "web-llm-attacks": "llm-attacks",
  };
  return `https://portswigger.net/web-security/${map[id] || id}`;
}

export default function LearnPage() {
  const [data, setData] = useState<APIData | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => { fetch("/api/state").then((r) => r.json()).then(setData); }, []);

  if (!data) return <div className="flex items-center justify-center h-full text-muted">Loading...</div>;

  const topics = data.skillTree.topics;
  const filtered = filter === "all"
    ? Object.entries(topics)
    : Object.entries(topics).filter(([, d]) => d.category === filter);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Learn</h1>
          <p className="text-sm text-muted mt-0.5">Resources for each vulnerability class</p>
        </div>
        <div className="flex gap-1.5">
          {["all", "server-side", "client-side", "advanced"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                filter === f ? "bg-accent text-white" : "bg-subtle text-muted hover:text-foreground"
              }`}
            >
              {f === "all" ? "All" : f.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Essential tools */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { title: "Burp Suite", desc: "Web security testing proxy", url: "https://portswigger.net/burp/communitydownload" },
          { title: "Web Security Academy", desc: "Free training from PortSwigger", url: "https://portswigger.net/web-security" },
          { title: "OWASP Top 10", desc: "Critical web security risks", url: "https://owasp.org/www-project-top-ten/" },
        ].map((t) => (
          <a key={t.title} href={t.url} target="_blank" rel="noopener noreferrer"
            className="bg-card rounded-xl p-4 hover:bg-surface-light transition-colors group">
            <h3 className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">{t.title}</h3>
            <p className="text-xs text-muted mt-1">{t.desc}</p>
          </a>
        ))}
      </div>

      {/* Per-topic */}
      <div className="space-y-3">
        {filtered.sort(([, a], [, b]) => a.name.localeCompare(b.name)).map(([id, def]) => {
          const res = resources[id] || [{ title: `${def.name} — PortSwigger`, url: getTopicUrl(id), type: "docs" as const }];
          return (
            <div key={id} className="bg-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-medium text-foreground">{def.name}</h3>
                <span className="text-[10px] text-muted px-2 py-0.5 bg-subtle rounded-full">{def.category.replace("-"," ")}</span>
              </div>
              <p className="text-xs text-muted mb-3">{def.description}</p>
              <div className="flex flex-wrap gap-2">
                {res.map((r) => (
                  <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:opacity-80 transition-opacity ${typeBadge[r.type]}`}>
                    <span className="font-medium uppercase text-[9px]">{r.type === "cheatsheet" ? "Cheat" : r.type}</span>
                    <span>{r.title}</span>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
