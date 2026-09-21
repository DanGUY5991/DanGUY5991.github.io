/**
 * LDMLFN profile + access registry
 * Email is the identity key. Profiles are isolated: only the signed-in
 * email can read/write that profile's dialogue session.
 * The people roster is visible (names/emails not hidden) but does not
 * expose another person's session content.
 */

(function (global) {
  const STORE_KEY = "ldmlfn-profiles-v1";
  const LEGACY_SESSION_KEY = "ldmlfn-microtraining-session-v1";
  const SYNC_ENDPOINT_KEY = "ldmlfn-sync-endpoint";

  function emptyStore() {
    return {
      version: 1,
      currentEmail: null,
      profiles: {},
      accessLog: [],
    };
  }

  function readStore() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return emptyStore();
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return emptyStore();
      parsed.profiles = parsed.profiles || {};
      parsed.accessLog = Array.isArray(parsed.accessLog) ? parsed.accessLog : [];
      return parsed;
    } catch (_) {
      return emptyStore();
    }
  }

  function writeStore(store) {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  }

  function normalizeEmail(email) {
    return String(email || "")
      .trim()
      .toLowerCase();
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function normalizeName(name, email) {
    const cleaned = String(name || "").trim();
    if (cleaned) return cleaned;
    const local = email.split("@")[0] || "Participant";
    return local.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function publicProfile(profile) {
    if (!profile) return null;
    const session = profile.session;
    let status = "not_started";
    if (session?.stage === "close") status = "complete";
    else if (session?.turns?.length) status = "in_progress";

    const bio = profile.bio || null;

    return {
      email: profile.email,
      name: profile.name,
      createdAt: profile.createdAt,
      lastAccessAt: profile.lastAccessAt,
      accessCount: profile.accessCount || 0,
      status,
      stage: session?.stage || null,
      productCount: session?.context?.products?.length || 0,
      role: bio?.role || null,
      relationships: bio?.relationships || null,
      orgContext: bio?.orgContext || null,
      bioComplete: Boolean(bio?.role && bio?.relationships),
    };
  }

  function logAccess(store, profile, action) {
    store.accessLog.push({
      email: profile.email,
      name: profile.name,
      action,
      at: new Date().toISOString(),
    });
    // Keep log bounded
    if (store.accessLog.length > 500) {
      store.accessLog = store.accessLog.slice(-500);
    }
  }

  async function maybeSync(event, payload) {
    const endpoint = localStorage.getItem(SYNC_ENDPOINT_KEY);
    if (!endpoint) return;
    try {
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: "LDMLFN Microtraining",
          event,
          at: new Date().toISOString(),
          ...payload,
        }),
      });
    } catch (_) {
      /* sync is best-effort */
    }
  }

  const Profiles = {
    normalizeEmail,
    isValidEmail,

    getCurrent() {
      const store = readStore();
      if (!store.currentEmail) return null;
      return store.profiles[store.currentEmail] || null;
    },

    getCurrentPublic() {
      return publicProfile(this.getCurrent());
    },

    /** Roster of people — visible metadata only, no session bodies. */
    listPeople() {
      const store = readStore();
      return Object.values(store.profiles)
        .map(publicProfile)
        .sort((a, b) => String(b.lastAccessAt).localeCompare(String(a.lastAccessAt)));
    },

    listAccessLog() {
      return readStore().accessLog.slice().reverse();
    },

    /**
     * Create or continue a profile by email.
     * Never loads another profile's session into the active user.
     */
    signIn({ email, name }) {
      const normalized = normalizeEmail(email);
      if (!isValidEmail(normalized)) {
        throw new Error("Enter a valid email address to continue.");
      }

      const store = readStore();
      const now = new Date().toISOString();
      let action = "continue";
      let profile = store.profiles[normalized];

      if (!profile) {
        action = "create";
        profile = {
          email: normalized,
          name: normalizeName(name, normalized),
          createdAt: now,
          lastAccessAt: now,
          accessCount: 0,
          bio: null,
          session: null,
        };
        store.profiles[normalized] = profile;
      } else if (name && String(name).trim()) {
        profile.name = String(name).trim();
      }

      profile.lastAccessAt = now;
      profile.accessCount = (profile.accessCount || 0) + 1;
      store.currentEmail = normalized;
      logAccess(store, profile, action);
      writeStore(store);

      maybeSync(action === "create" ? "profile_created" : "profile_continued", {
        person: publicProfile(profile),
      });

      return { profile, action, isNew: action === "create" };
    },

    signOut() {
      const store = readStore();
      const current = store.currentEmail ? store.profiles[store.currentEmail] : null;
      if (current) logAccess(store, current, "sign_out");
      store.currentEmail = null;
      writeStore(store);
      maybeSync("sign_out", { person: publicProfile(current) });
    },

    getBio() {
      return this.getCurrent()?.bio || null;
    },

    hasBio() {
      const bio = this.getBio();
      return Boolean(bio?.role && String(bio.role).trim() && bio?.relationships && String(bio.relationships).trim());
    },

    /**
     * Save role / relationship bio used to contextualize later questions.
     */
    updateBio({ role, relationships, orgContext }) {
      const store = readStore();
      const email = store.currentEmail;
      if (!email || !store.profiles[email]) {
        throw new Error("Sign in before saving your role.");
      }
      const cleanedRole = String(role || "").trim();
      const cleanedRel = String(relationships || "").trim();
      if (!cleanedRole) throw new Error("Please share your role or kind of work.");
      if (!cleanedRel) throw new Error("Please share how you relate to others in that work.");

      store.profiles[email].bio = {
        role: cleanedRole,
        relationships: cleanedRel,
        orgContext: String(orgContext || "").trim(),
        updatedAt: new Date().toISOString(),
      };
      store.profiles[email].lastAccessAt = new Date().toISOString();
      logAccess(store, store.profiles[email], "bio_updated");
      writeStore(store);
      maybeSync("bio_updated", { person: publicProfile(store.profiles[email]) });
      return store.profiles[email].bio;
    },

    /** Read session only for the signed-in profile. */
    loadSession() {
      const profile = this.getCurrent();
      return profile?.session ? structuredClone(profile.session) : null;
    },

    /** Write session only for the signed-in profile. */
    saveSession(session) {
      const store = readStore();
      const email = store.currentEmail;
      if (!email || !store.profiles[email]) return false;
      store.profiles[email].session = session;
      store.profiles[email].lastAccessAt = new Date().toISOString();
      writeStore(store);
      return true;
    },

    clearSession() {
      const store = readStore();
      const email = store.currentEmail;
      if (!email || !store.profiles[email]) return false;
      store.profiles[email].session = null;
      store.profiles[email].lastAccessAt = new Date().toISOString();
      logAccess(store, store.profiles[email], "session_reset");
      writeStore(store);
      return true;
    },

    markComplete() {
      const profile = this.getCurrent();
      if (!profile) return;
      const store = readStore();
      logAccess(store, store.profiles[profile.email], "complete");
      writeStore(store);
      maybeSync("dialogue_complete", { person: publicProfile(store.profiles[profile.email]) });
    },

    /**
     * Facilitator export: people + access log only (no other users' transcripts).
     * Own full export still comes from the dialogue export while signed in.
     */
    exportRegistry() {
      return {
        project: "LDMLFN Microtraining",
        kind: "people-and-access-registry",
        exportedAt: new Date().toISOString(),
        people: this.listPeople(),
        accessLog: this.listAccessLog(),
      };
    },

    /** Migrate pre-profile single session into the newly signed-in profile once. */
    adoptLegacySessionIfEmpty() {
      const profile = this.getCurrent();
      if (!profile || profile.session) return false;
      try {
        const raw = localStorage.getItem(LEGACY_SESSION_KEY);
        if (!raw) return false;
        const session = JSON.parse(raw);
        this.saveSession(session);
        localStorage.removeItem(LEGACY_SESSION_KEY);
        return true;
      } catch (_) {
        return false;
      }
    },

    setSyncEndpoint(url) {
      if (!url) localStorage.removeItem(SYNC_ENDPOINT_KEY);
      else localStorage.setItem(SYNC_ENDPOINT_KEY, url);
      return Boolean(localStorage.getItem(SYNC_ENDPOINT_KEY));
    },

    accessUrl() {
      const base = `${window.location.origin}${window.location.pathname.replace(/people\.html$/, "index.html")}`;
      return base.includes("index.html") ? base : `${base}${base.endsWith("/") ? "" : "/"}`;
    },
  };

  global.LDMLFNProfiles = Profiles;
})(window);
