import type { PlanningBaseState } from '../domain/types'
import { createInitialState } from '../domain/state'
import { openDB, type IDBPDatabase } from 'idb'

export const DB_NAME = 'control-puntos-db'
export const STATE_OBJECT_STORE_NAME = 'baseState'
const STATE_KEY = 'singleton'
const DB_VERSION = 7 // New CoverageRule structure
const LEGACY_LOCALSTORAGE_KEY = 'control-puntos:v1'

// Check if we're in a browser environment with IndexedDB support
const isBrowser =
  typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined'

/**
 * Opens the IndexedDB database, creating or upgrading it if necessary.
 */
export function openDatabase(): Promise<IDBPDatabase> {
  if (!isBrowser) {
    // Return a mock object for SSR environments.
    const mockDb: any = {
      get: () => Promise.resolve(undefined),
      put: () => Promise.resolve(undefined),
      clear: () => Promise.resolve(undefined),
      close: () => {},
    }
    return Promise.resolve(mockDb as IDBPDatabase)
  }

  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains(STATE_OBJECT_STORE_NAME)) {
        db.createObjectStore(STATE_OBJECT_STORE_NAME)
      }
      // For version 7, the CoverageRule model has changed.
      // The loadState logic will handle creating a new initial state
      // if the loaded version is old, so no specific migration is needed here.
    },
  })
}

/**
 * Migrate data from localStorage to IndexedDB if it exists.
 */
async function migrateFromLocalStorage(): Promise<void> {
  if (!isBrowser || typeof window.localStorage === 'undefined') {
    return
  }

  try {
    const stored = localStorage.getItem(LEGACY_LOCALSTORAGE_KEY)
    if (!stored) {
      return
    }

    // Since the data model is now completely different, we just discard legacy data.
    localStorage.removeItem(LEGACY_LOCALSTORAGE_KEY)
    console.log('Legacy localStorage data discarded due to new data model.')
  } catch (error) {
    console.error('Failed to clear legacy localStorage:', error)
    // Attempt to remove it anyway to prevent looping
    try {
      localStorage.removeItem(LEGACY_LOCALSTORAGE_KEY)
    } catch (e) {
      // ignore
    }
  }
}

/**
 * Load state from IndexedDB.
 */
export async function loadState(): Promise<PlanningBaseState | null> {
  if (!isBrowser) {
    return null;
  }

  try {
    // This is a one-time operation that will only run if legacy data exists.
    await migrateFromLocalStorage()

    const db = await openDatabase()
    let state: PlanningBaseState | undefined = await db.get(
      STATE_OBJECT_STORE_NAME,
      STATE_KEY
    )
    db.close();

    if (!state) {
      return null;
    }

    // --- Data Integrity & Migration ---
    // Ensure all top-level arrays exist to prevent crashes on older states.
    state.incidents ??= [];
    state.historyEvents ??= [];
    state.auditLog ??= [];
    state.swaps ??= [];
    state.specialSchedules ??= [];
    state.coverageRules ??= [];
    state.representatives ??= [];

    // If state is invalid or version is outdated, we'll handle it in the store's initialize.
    // Here, we just load what we have.

    return state
  } catch (error) {
    console.error(
      'Failed to load state from IndexedDB, returning null:',
      error
    )
    return null
  }
}

/**
 * Save state to IndexedDB.
 * This function is now type-safe and only accepts a pure PlanningBaseState object.
 */
export async function saveState(state: PlanningBaseState): Promise<void> {
  if (!isBrowser) return

  try {
    const db = await openDatabase()
    // No need to clone here, the object received is a pure data snapshot.
    await db.put(STATE_OBJECT_STORE_NAME, state, STATE_KEY)
    db.close();
  } catch (error) {
    console.error('Failed to save state to IndexedDB:', error)
    throw error
  }
}

/**
 * Clear all main state storage.
 */
export async function clearStorage(): Promise<void> {
  if (!isBrowser) return

  try {
    const db = await openDatabase()
    await db.clear(STATE_OBJECT_STORE_NAME)
    db.close();
  } catch (error) {
    console.error('Failed to clear storage:', error)
  }
}
