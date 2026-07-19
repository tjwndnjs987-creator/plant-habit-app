// Storage utility for plant habit app
// Provides load/save/clear functions using localStorage

const STORAGE_KEY = 'plant_habit_app_state_v1';
const LAST_DAY_ADVANCE_KEY = 'plant_habit_last_day_advance';
const JOURNAL_STORAGE_KEY = 'plant_habit_journal_v1';

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to parse stored app state', err);
    return null;
  }
}

function loadState() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return safeParse(raw);
  } catch (err) {
    console.warn('Failed to load app state from localStorage', err);
    return null;
  }
}

function saveState(state) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const toSave = Object.assign({}, state);
    if (typeof toSave.version === 'undefined') toSave.version = 1;
    toSave.updatedAt = new Date().toISOString();
    // Avoid huge console logs: measure size for warning context if needed
    let size = 0;
    try { size = JSON.stringify(toSave).length; } catch(e) { size = -1; }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    return true;
  } catch (err) {
    console.warn('Failed to save app state to localStorage', { key: STORAGE_KEY, err });
    return false;
  }
}

function clearState() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    console.warn('Failed to clear app state from localStorage', err);
    return false;
  }
}

function getLastDayAdvanceTime() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(LAST_DAY_ADVANCE_KEY);
    return raw ? Number(raw) : null;
  } catch (err) {
    console.warn('Failed to read last day advance time', err);
    return null;
  }
}

function setLastDayAdvanceTime(timestamp) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(LAST_DAY_ADVANCE_KEY, String(timestamp));
  } catch (err) {
    console.warn('Failed to save last day advance time', err);
  }
}

function loadJournalState() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(JOURNAL_STORAGE_KEY);
    if (!raw) return null;
    return safeParse(raw);
  } catch (err) {
    console.warn('Failed to load journal state from localStorage', err);
    return null;
  }
}

function saveJournalState(state) {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    window.localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.warn('Failed to save journal state to localStorage', { key: JOURNAL_STORAGE_KEY, err });
    return false;
  }
}

function clearJournalState() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(JOURNAL_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear journal state from localStorage', err);
  }
}

export {
  STORAGE_KEY,
  loadState,
  saveState,
  clearState,
  getLastDayAdvanceTime,
  setLastDayAdvanceTime,
  loadJournalState,
  saveJournalState,
  clearJournalState,
};
