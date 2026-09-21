/**
 * Product module registry.
 * Each Microsoft product is a modular section with its own key initial questions.
 */

(function (global) {
  const LENSES = {
    culture:
      "workplace or community culture around how knowledge, work, and decisions move",
    relationships:
      "relationships between people who create, hold, review, depend on, or are affected by the work",
    indigenous:
      "Indigenous understanding of the situation — relational accountability, care for knowledge, place, and who is affected — without appropriating ceremony",
  };

  const SELECTED_KEY = "ldmlfn-selected-module";

  /** @type {ProductModule[]} */
  const modules = [];

  function register(module) {
    if (!module?.id) throw new Error("Module requires an id");
    const existing = modules.findIndex((m) => m.id === module.id);
    const normalized = {
      deepLenses: ["culture", "relationships", "indigenous"],
      status: "available",
      ...module,
    };
    if (existing >= 0) modules[existing] = normalized;
    else modules.push(normalized);
    return normalized;
  }

  function list() {
    return modules.slice().sort((a, b) => (a.order || 99) - (b.order || 99));
  }

  function get(id) {
    return modules.find((m) => m.id === id) || null;
  }

  function getSelectedId() {
    return localStorage.getItem(SELECTED_KEY) || list()[0]?.id || null;
  }

  function setSelected(id) {
    const mod = get(id);
    if (!mod) return null;
    localStorage.setItem(SELECTED_KEY, id);
    return mod;
  }

  function getSelected() {
    return get(getSelectedId()) || list()[0] || null;
  }

  /** @deprecated use getSelected — kept for older app.js call sites */
  function getActiveGoal() {
    return getSelected();
  }

  function getGoal(id) {
    return get(id) || getSelected();
  }

  function lensText(module) {
    return (module?.deepLenses || [])
      .map((key) => LENSES[key] || key)
      .join("; ");
  }

  global.LDMLFNModules = {
    LENSES,
    register,
    list,
    get,
    getSelected,
    getSelectedId,
    setSelected,
  };

  // Back-compat alias used by clarify.js / older code
  global.LDMLFNSurveyGoals = {
    get GOALS() {
      return list();
    },
    LENSES,
    getActiveGoal,
    getGoal,
    lensText,
    listModules: list,
    setSelectedModule: setSelected,
  };
})(window);
