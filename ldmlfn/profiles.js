/**
 * LDMLFN profile + password auth
 * Email + password accounts. Answers for each profile are encrypted at rest
 * with a key derived from that password so other accounts cannot open them.
 * Facilitator secret gates AI endpoint config and people roster.
 *
 * Note: this is browser-side protection for a static GitHub Pages app.
 * It stops casual cross-account access. It is not a full server auth system.
 */

(function (global) {
  const STORE_KEY = "ldmlfn-profiles-v2";
  const LEGACY_STORE_KEY = "ldmlfn-profiles-v1";
  const LEGACY_SESSION_KEY = "ldmlfn-microtraining-session-v1";
  const SYNC_ENDPOINT_KEY = "ldmlfn-sync-endpoint";
  const AI_ENDPOINT_KEY = "ldmlfn-ai-endpoint";
  const FACILITATOR_HASH_KEY = "ldmlfn-facilitator-secret-hash";
  const FACILITATOR_SESSION_KEY = "ldmlfn-facilitator-ok";
  const PBKDF2_ITERATIONS = 120000;

  /** @type {CryptoKey|null} */
  let sessionKey = null;

  function emptyStore() {
    return {
      version: 2,
      currentEmail: null,
      profiles: {},
      accessLog: [],
    };
  }

  function readStore() {
    try {
      migrateV1IfNeeded();
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

  function migrateV1IfNeeded() {
    if (localStorage.getItem(STORE_KEY)) return;
    const legacy = localStorage.getItem(LEGACY_STORE_KEY);
    if (!legacy) return;
    try {
      const parsed = JSON.parse(legacy);
      parsed.version = 2;
      parsed.currentEmail = null; // force re-login with password
      Object.values(parsed.profiles || {}).forEach((p) => {
        p.passwordRequired = true;
        p.auth = null;
        p.sessionEncrypted = null;
        p.session = null; // drop plaintext legacy session until password set via register/reset
      });
      localStorage.setItem(STORE_KEY, JSON.stringify(parsed));
    } catch (_) {
      /* ignore */
    }
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

  function bytesToBase64(bytes) {
    let binary = "";
    bytes.forEach((b) => {
      binary += String.fromCharCode(b);
    });
    return btoa(binary);
  }

  function base64ToBytes(b64) {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  async function sha256Hex(text) {
    const data = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function deriveBits(password, saltBytes) {
    const baseKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits", "deriveKey"]
    );
    return crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: saltBytes, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
      baseKey,
      256
    );
  }

  async function deriveAesKey(password, saltBytes) {
    const baseKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: saltBytes, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async function hashPassword(password, saltBytes) {
    const bits = await deriveBits(password, saltBytes);
    return bytesToBase64(new Uint8Array(bits));
  }

  async function encryptJson(key, obj) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plain = new TextEncoder().encode(JSON.stringify(obj));
    const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain);
    return {
      iv: bytesToBase64(iv),
      data: bytesToBase64(new Uint8Array(cipher)),
    };
  }

  async function decryptJson(key, payload) {
    if (!payload?.iv || !payload?.data) return null;
    const iv = base64ToBytes(payload.iv);
    const data = base64ToBytes(payload.data);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
    return JSON.parse(new TextDecoder().decode(plain));
  }

  function publicProfile(profile) {
    if (!profile) return null;
    const hasAnswers = Boolean(profile.sessionEncrypted || profile.session);
    let status = "not_started";
    if (profile.lastStage === "close") status = "complete";
    else if (hasAnswers || profile.lastStage) status = "in_progress";

    const bio = profile.bio || null;

    return {
      email: profile.email,
      name: profile.name,
      createdAt: profile.createdAt,
      lastAccessAt: profile.lastAccessAt,
      accessCount: profile.accessCount || 0,
      status,
      stage: profile.lastStage || null,
      role: bio?.role || null,
      relationships: bio?.relationships || null,
      orgContext: bio?.orgContext || null,
      bioComplete: Boolean(bio?.role && bio?.relationships),
      hasPassword: Boolean(profile.auth?.hash),
    };
  }

  function logAccess(store, profile, action) {
    store.accessLog.push({
      email: profile.email,
      name: profile.name,
      action,
      at: new Date().toISOString(),
    });
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
      /* best-effort */
    }
  }

  function requirePassword(password) {
    const pw = String(password || "");
    if (pw.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }
    return pw;
  }

  const Profiles = {
    normalizeEmail,
    isValidEmail,

    isSignedIn() {
      return Boolean(this.getCurrent() && sessionKey);
    },

    getCurrent() {
      const store = readStore();
      if (!store.currentEmail) return null;
      return store.profiles[store.currentEmail] || null;
    },

    getCurrentPublic() {
      return publicProfile(this.getCurrent());
    },

    listPeople() {
      if (!this.isFacilitatorAuthed()) {
        throw new Error("Facilitator access required to view the people roster.");
      }
      const store = readStore();
      return Object.values(store.profiles)
        .map(publicProfile)
        .sort((a, b) => String(b.lastAccessAt).localeCompare(String(a.lastAccessAt)));
    },

    listAccessLog() {
      if (!this.isFacilitatorAuthed()) {
        throw new Error("Facilitator access required.");
      }
      return readStore().accessLog.slice().reverse();
    },

    accountExists(email) {
      const normalized = normalizeEmail(email);
      return Boolean(readStore().profiles[normalized]);
    },

    /**
     * Create a new account with email + password.
     */
    async register({ email, name, password }) {
      const normalized = normalizeEmail(email);
      if (!isValidEmail(normalized)) {
        throw new Error("Enter a valid email address.");
      }
      const pw = requirePassword(password);
      const store = readStore();
      if (store.profiles[normalized]?.auth?.hash) {
        throw new Error("An account with this email already exists. Sign in instead.");
      }

      const salt = crypto.getRandomValues(new Uint8Array(16));
      const hash = await hashPassword(pw, salt);
      const key = await deriveAesKey(pw, salt);
      const now = new Date().toISOString();

      const existing = store.profiles[normalized];
      const profile = existing || {
        email: normalized,
        name: normalizeName(name, normalized),
        createdAt: now,
        lastAccessAt: now,
        accessCount: 0,
        bio: null,
        lastStage: null,
      };

      if (name && String(name).trim()) profile.name = String(name).trim();
      profile.auth = {
        salt: bytesToBase64(salt),
        hash,
        iterations: PBKDF2_ITERATIONS,
      };
      profile.session = null;
      profile.sessionEncrypted = null;
      profile.lastAccessAt = now;
      profile.accessCount = (profile.accessCount || 0) + 1;

      store.profiles[normalized] = profile;
      store.currentEmail = normalized;
      sessionKey = key;
      logAccess(store, profile, "register");
      writeStore(store);
      maybeSync("profile_registered", { person: publicProfile(profile) });

      return { profile, action: "create", isNew: true };
    },

    /**
     * Sign in with email + password. Loads only this account's encrypted answers.
     */
    async login({ email, password }) {
      const normalized = normalizeEmail(email);
      if (!isValidEmail(normalized)) {
        throw new Error("Enter a valid email address.");
      }
      const pw = String(password || "");
      if (!pw) throw new Error("Enter your password.");

      const store = readStore();
      const profile = store.profiles[normalized];
      if (!profile?.auth?.hash || !profile.auth.salt) {
        throw new Error("No account found for this email. Create an account first.");
      }

      const salt = base64ToBytes(profile.auth.salt);
      const hash = await hashPassword(pw, salt);
      if (hash !== profile.auth.hash) {
        logAccess(store, profile, "login_failed");
        writeStore(store);
        throw new Error("Incorrect email or password.");
      }

      sessionKey = await deriveAesKey(pw, salt);
      profile.lastAccessAt = new Date().toISOString();
      profile.accessCount = (profile.accessCount || 0) + 1;
      store.currentEmail = normalized;
      logAccess(store, profile, "login");
      writeStore(store);
      maybeSync("profile_login", { person: publicProfile(profile) });

      return { profile, action: "continue", isNew: false };
    },

    signOut() {
      const store = readStore();
      const current = store.currentEmail ? store.profiles[store.currentEmail] : null;
      if (current) logAccess(store, current, "sign_out");
      store.currentEmail = null;
      sessionKey = null;
      writeStore(store);
      maybeSync("sign_out", { person: publicProfile(current) });
    },

    /**
     * Facilitator-only password reset. Clears encrypted answers for that account
     * (old ciphertext cannot be opened with the new password).
     */
    async adminResetPassword(email, newPassword, facilitatorSecret) {
      const ok = await this.verifyFacilitatorSecret(facilitatorSecret);
      if (!ok) throw new Error("Facilitator secret incorrect.");

      const normalized = normalizeEmail(email);
      const store = readStore();
      const profile = store.profiles[normalized];
      if (!profile) throw new Error("No account found for that email.");

      const pw = requirePassword(newPassword);
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const hash = await hashPassword(pw, salt);
      profile.auth = {
        salt: bytesToBase64(salt),
        hash,
        iterations: PBKDF2_ITERATIONS,
      };
      profile.session = null;
      profile.sessionEncrypted = null;
      profile.lastStage = null;
      profile.lastAccessAt = new Date().toISOString();
      logAccess(store, profile, "password_reset");
      writeStore(store);

      if (store.currentEmail === normalized) sessionKey = null;
      return true;
    },

    getBio() {
      return this.getCurrent()?.bio || null;
    },

    hasBio() {
      const bio = this.getBio();
      return Boolean(bio?.role && String(bio.role).trim() && bio?.relationships && String(bio.relationships).trim());
    },

    updateBio({ role, relationships, orgContext }) {
      if (!this.isSignedIn()) throw new Error("Sign in before saving your role.");
      const store = readStore();
      const email = store.currentEmail;
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

    async loadSession() {
      if (!this.isSignedIn() || !sessionKey) return null;
      const profile = this.getCurrent();
      if (!profile) return null;
      if (profile.sessionEncrypted) {
        try {
          return await decryptJson(sessionKey, profile.sessionEncrypted);
        } catch (_) {
          throw new Error("Could not open your saved answers. Try signing in again.");
        }
      }
      return profile.session ? structuredClone(profile.session) : null;
    },

    async saveSession(session) {
      if (!this.isSignedIn() || !sessionKey) return false;
      const store = readStore();
      const email = store.currentEmail;
      if (!email || !store.profiles[email]) return false;
      store.profiles[email].sessionEncrypted = await encryptJson(sessionKey, session);
      store.profiles[email].session = null; // never keep plaintext answers
      store.profiles[email].lastStage = session?.stage || null;
      store.profiles[email].lastAccessAt = new Date().toISOString();
      writeStore(store);
      return true;
    },

    async clearSession() {
      if (!this.isSignedIn()) return false;
      const store = readStore();
      const email = store.currentEmail;
      if (!email || !store.profiles[email]) return false;
      store.profiles[email].session = null;
      store.profiles[email].sessionEncrypted = null;
      store.profiles[email].lastStage = null;
      store.profiles[email].lastAccessAt = new Date().toISOString();
      logAccess(store, store.profiles[email], "session_reset");
      writeStore(store);
      return true;
    },

    markComplete() {
      const profile = this.getCurrent();
      if (!profile || !this.isSignedIn()) return;
      const store = readStore();
      store.profiles[profile.email].lastStage = "close";
      logAccess(store, store.profiles[profile.email], "complete");
      writeStore(store);
      maybeSync("dialogue_complete", { person: publicProfile(store.profiles[profile.email]) });
    },

    exportRegistry() {
      if (!this.isFacilitatorAuthed()) {
        throw new Error("Facilitator access required.");
      }
      return {
        project: "LDMLFN Microtraining",
        kind: "people-and-access-registry",
        exportedAt: new Date().toISOString(),
        people: this.listPeople(),
        accessLog: this.listAccessLog(),
      };
    },

    adoptLegacySessionIfEmpty() {
      return false;
    },

    /* —— Facilitator / AI gates —— */

    async setFacilitatorSecret(secret) {
      const cleaned = String(secret || "").trim();
      if (cleaned.length < 8) throw new Error("Facilitator secret must be at least 8 characters.");
      const hash = await sha256Hex(`ldmlfn-facilitator:${cleaned}`);
      localStorage.setItem(FACILITATOR_HASH_KEY, hash);
      sessionStorage.setItem(FACILITATOR_SESSION_KEY, "1");
      return true;
    },

    hasFacilitatorSecret() {
      return Boolean(localStorage.getItem(FACILITATOR_HASH_KEY));
    },

    async verifyFacilitatorSecret(secret) {
      const stored = localStorage.getItem(FACILITATOR_HASH_KEY);
      if (!stored) return false;
      const hash = await sha256Hex(`ldmlfn-facilitator:${String(secret || "").trim()}`);
      const ok = hash === stored;
      if (ok) sessionStorage.setItem(FACILITATOR_SESSION_KEY, "1");
      return ok;
    },

    isFacilitatorAuthed() {
      return sessionStorage.getItem(FACILITATOR_SESSION_KEY) === "1";
    },

    clearFacilitatorAuth() {
      sessionStorage.removeItem(FACILITATOR_SESSION_KEY);
    },

    /**
     * AI endpoint may only be configured by a facilitator.
     * Never expose a provider API key in page source — use a proxy URL.
     */
    setAiEndpoint(url) {
      if (!this.isFacilitatorAuthed()) {
        throw new Error("Sign in as facilitator before setting the AI endpoint.");
      }
      if (!url) localStorage.removeItem(AI_ENDPOINT_KEY);
      else localStorage.setItem(AI_ENDPOINT_KEY, String(url));
      return Boolean(localStorage.getItem(AI_ENDPOINT_KEY));
    },

    getAiEndpoint() {
      if (!this.isSignedIn()) return null;
      return localStorage.getItem(AI_ENDPOINT_KEY);
    },

    setSyncEndpoint(url) {
      if (!this.isFacilitatorAuthed()) {
        throw new Error("Facilitator access required.");
      }
      if (!url) localStorage.removeItem(SYNC_ENDPOINT_KEY);
      else localStorage.setItem(SYNC_ENDPOINT_KEY, url);
      return Boolean(localStorage.getItem(SYNC_ENDPOINT_KEY));
    },

    accessUrl() {
      if (typeof window !== "undefined" && window.location.hostname.endsWith("github.io")) {
        return `${window.location.origin}/ldmlfn/`;
      }
      const base = `${window.location.origin}${window.location.pathname.replace(/people\.html$/, "index.html")}`;
      return base.includes("index.html") ? base : `${base}${base.endsWith("/") ? "" : "/"}`;
    },
  };

  global.LDMLFNProfiles = Profiles;
})(window);
