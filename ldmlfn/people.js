(() => {
  const Profiles = window.LDMLFNProfiles;
  if (!Profiles) return;

  const peopleBody = document.getElementById("people-body");
  const accessLog = document.getElementById("access-log");
  const linkEl = document.getElementById("access-link-url");
  const copyBtn = document.getElementById("copy-access-link");
  const exportBtn = document.getElementById("export-registry");
  const refreshBtn = document.getElementById("refresh-people");

  const statusLabel = {
    not_started: "Signed in",
    in_progress: "In progress",
    complete: "Complete",
  };

  function formatWhen(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString();
    } catch (_) {
      return iso;
    }
  }

  function render() {
    const people = Profiles.listPeople();
    if (!people.length) {
      peopleBody.innerHTML = `<tr><td colspan="6">No one has signed in on this browser yet. Share the access link to begin.</td></tr>`;
    } else {
      peopleBody.innerHTML = people
        .map(
          (p) => `
        <tr>
          <td>${escapeHtml(p.name)}</td>
          <td>${escapeHtml(p.email)}</td>
          <td>${escapeHtml(p.role || "—")}</td>
          <td><span class="status-pill status-pill--${p.status}">${statusLabel[p.status] || p.status}</span></td>
          <td>${p.accessCount}</td>
          <td>${escapeHtml(formatWhen(p.lastAccessAt))}</td>
        </tr>`
        )
        .join("");
    }

    const log = Profiles.listAccessLog().slice(0, 40);
    if (!log.length) {
      accessLog.innerHTML = "<li>No access events yet.</li>";
    } else {
      accessLog.innerHTML = log
        .map(
          (e) =>
            `<li><strong>${escapeHtml(e.name)}</strong> · ${escapeHtml(e.email)} · ${escapeHtml(e.action)} · <span>${escapeHtml(formatWhen(e.at))}</span></li>`
        )
        .join("");
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  const accessUrl = (() => {
    const url = new URL("index.html", window.location.href);
    return url.href;
  })();
  linkEl.textContent = accessUrl;

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(accessUrl);
      copyBtn.textContent = "Copied";
      setTimeout(() => {
        copyBtn.textContent = "Copy link";
      }, 1600);
    } catch (_) {
      copyBtn.textContent = "Copy failed";
    }
  });

  exportBtn.addEventListener("click", () => {
    const payload = Profiles.exportRegistry();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ldmlfn-people-access-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  refreshBtn.addEventListener("click", render);
  render();
})();
