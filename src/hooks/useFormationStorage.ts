import { useState, useCallback, useEffect } from 'react';
import { SavedFormation, STORAGE_KEY, Player } from '@/types/tactics';

/**
 * useFormationStorage — manages saved formations in localStorage.
 * 
 * Provides:
 * - savedFormations: array of all saved formations
 * - saveFormation: save current players with a name
 * - loadFormation: retrieve a saved formation's players
 * - deleteFormation: remove a saved formation
 * - renameFormation: update a formation's name
 * 
 * All operations persist to localStorage immediately.
 */
export function useFormationStorage() {
  const [savedFormations, setSavedFormations] = useState<SavedFormation[]>([]);

  // Load saved formations from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedFormation[];
        setSavedFormations(parsed);
      }
    } catch (err) {
      console.warn('Failed to load saved formations:', err);
    }
  }, []);

  // Persist to localStorage whenever savedFormations changes
  const persist = useCallback((formations: SavedFormation[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formations));
    } catch (err) {
      console.warn('Failed to persist formations:', err);
    }
  }, []);

  /**
   * Save the current player positions as a named formation.
   * Returns the new formation's ID.
   */
  const saveFormation = useCallback((name: string, players: Player[]): string => {
    const id = `saved-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newFormation: SavedFormation = {
      id,
      name: name.trim() || 'Untitled Formation',
      createdAt: Date.now(),
      players: players.map(p => ({ ...p })), // deep copy
    };

    setSavedFormations(prev => {
      const updated = [newFormation, ...prev];
      persist(updated);
      return updated;
    });

    return id;
  }, [persist]);

  /**
   * Load a saved formation by ID. Returns the players array or null.
   */
  const loadFormation = useCallback((id: string): Player[] | null => {
    const formation = savedFormations.find(f => f.id === id);
    if (!formation) return null;
    return formation.players.map(p => ({ ...p })); // deep copy
  }, [savedFormations]);

  /**
   * Delete a saved formation by ID.
   */
  const deleteFormation = useCallback((id: string) => {
    setSavedFormations(prev => {
      const updated = prev.filter(f => f.id !== id);
      persist(updated);
      return updated;
    });
  }, [persist]);

  /**
   * Rename a saved formation.
   */
  const renameFormation = useCallback((id: string, newName: string) => {
    setSavedFormations(prev => {
      const updated = prev.map(f =>
        f.id === id ? { ...f, name: newName.trim() || f.name } : f
      );
      persist(updated);
      return updated;
    });
  }, [persist]);

  return {
    savedFormations,
    saveFormation,
    loadFormation,
    deleteFormation,
    renameFormation,
  };
}
