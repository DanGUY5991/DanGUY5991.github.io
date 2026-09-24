(() => {
  const Profiles = window.LDMLFNProfiles;
  if (!Profiles) return;

  const peopleBody = document.getElementById("people-body");
  const accessLog = document.getElementById("access-log");
  const linkEl = document.getElementById("access-link-url");
  const copyBtn = document.getElementById("copy-access-link");
  const exportBtn = document.getElementById("export-registry");
  const refreshBtn = document.getElementById("refresh-people");
  const gate = document.getElementById("facilitator-gate");
  const roster = document.getElementById("roster-panel");
  const facForm = document.getElementById("facilitator-form");
  const facStatus = document.getElementById("facilitator-status");

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

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function showRoster() {
    if (gate) gate.hidden = true;
    if (roster) roster.hidden = false;
    render();
  }

  function render() {
    try {
      const people = Profiles.listPeople();
      if (!people.length) {
        peopleBody.innerHTML = `<tr><td colspan="6">No accounts on this browser yet.</td></tr>`;
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
    } catch (err) {
      peopleBody.innerHTML = `<tr><td colspan="6">${escapeHtml(err.message)}</td></tr>`;
    }
  }

  const accessUrl = Profiles.accessUrl();
  if (linkEl) linkEl.textContent = accessUrl;

  copyBtn?.addEventListener("click", async () => {
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

  exportBtn?.addEventListener("click", () => {
    try {
      const payload = Profiles.exportRegistry();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ldmlfn-people-access-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }
  });

  refreshBtn?.addEventListener("click", render);

  facForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    facStatus.textContent = "";
    const secret = document.getElementById("facilitator-secret")?.value || "";
    try {
      if (!Profiles.hasFacilitatorSecret()) {
        await Profiles.setFacilitatorSecret(secret);
        facStatus.textContent = "Facilitator secret saved on this browser. Roster unlocked.";
      } else {
        const ok = await Profiles.verifyFacilitatorSecret(secret);
        if (!ok) throw new Error("Incorrect facilitator secret.");
        facStatus.textContent = "Unlocked.";
      }
      showRoster();
    } catch (err) {
      facStatus.textContent = err.message || "Could not unlock.";
    }
  });

  if (Profiles.isFacilitatorAuthed()) showRoster();

  window.LDMLFN = {
    setFacilitatorSecret: (s) => Profiles.setFacilitatorSecret(s),
    adminResetPassword: (email, pw, secret) => Profiles.adminResetPassword(email, pw, secret),
  };
})();
