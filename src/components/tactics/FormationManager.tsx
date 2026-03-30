import React, { useState, useCallback } from 'react';
import {
  Player,
  FormationPreset,
  SavedFormation,
  PRESET_FORMATIONS,
  formationToPlayers,
} from '@/types/tactics';
import { useFormationStorage } from '@/hooks/useFormationStorage';

interface FormationManagerProps {
  players: Player[];
  onLoadFormation: (players: Player[]) => void;
}

/**
 * FormationManager — sidebar panel for managing tactical formations.
 * 
 * Sections:
 * 1. Save Current — name input + save button
 * 2. Preset Formations — clickable cards for 4-4-2, 4-3-3, 3-5-2, 4-2-3-1
 * 3. Saved Formations — list of user-saved formations with load/delete
 */
const FormationManager: React.FC<FormationManagerProps> = ({ players, onLoadFormation }) => {
  const {
    savedFormations,
    saveFormation,
    deleteFormation,
  } = useFormationStorage();

  const [saveName, setSaveName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string>(PRESET_FORMATIONS[0].id);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // ─── Save current formation ─────────────────────────────────────
  const handleSave = useCallback(() => {
    if (!saveName.trim()) return;
    saveFormation(saveName, players);
    setSaveName('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  }, [saveName, players, saveFormation]);

  const handleSaveKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
  }, [handleSave]);

  // ─── Load preset formation ──────────────────────────────────────
  const handleLoadPreset = useCallback((preset: FormationPreset) => {
    setActivePresetId(preset.id);
    onLoadFormation(formationToPlayers(preset));
  }, [onLoadFormation]);

  // ─── Load saved formation ──────────────────────────────────────
  const handleLoadSaved = useCallback((formation: SavedFormation) => {
    setActivePresetId('');
    onLoadFormation(formation.players.map(p => ({ ...p })));
  }, [onLoadFormation]);

  // ─── Delete saved formation ─────────────────────────────────────
  const handleDelete = useCallback((id: string) => {
    if (confirmDeleteId === id) {
      deleteFormation(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      // Auto-cancel confirm after 3 seconds
      setTimeout(() => setConfirmDeleteId(prev => prev === id ? null : prev), 3000);
    }
  }, [confirmDeleteId, deleteFormation]);

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Panel header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Formation Manager
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* ─── Save Current Section ─────────────────────────── */}
        <div className="px-4 py-3 border-b border-gray-100">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Save Current
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              onKeyDown={handleSaveKeyDown}
              placeholder="Formation name..."
              className="flex-1 min-w-0 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors bg-gray-50"
              maxLength={40}
            />
            <button
              onClick={handleSave}
              disabled={!saveName.trim()}
              className="px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save
            </button>
          </div>
          {/* Save success feedback */}
          {saveSuccess && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 animate-in fade-in">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Formation saved successfully!
            </div>
          )}
        </div>

        {/* ─── Preset Formations ────────────────────────────── */}
        <div className="px-4 py-3 border-b border-gray-100">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Preset Formations
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_FORMATIONS.map(preset => (
              <PresetCard
                key={preset.id}
                preset={preset}
                isActive={activePresetId === preset.id}
                onClick={() => handleLoadPreset(preset)}
              />
            ))}
          </div>
        </div>

        {/* ─── Saved Formations ─────────────────────────────── */}
        <div className="px-4 py-3">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Saved Formations
            {savedFormations.length > 0 && (
              <span className="ml-1.5 text-gray-400">({savedFormations.length})</span>
            )}
          </label>

          {savedFormations.length === 0 ? (
            <div className="py-6 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <p className="text-xs text-gray-400">No saved formations yet.</p>
              <p className="text-xs text-gray-400">Name and save your current setup above.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {savedFormations.map(formation => (
                <SavedFormationRow
                  key={formation.id}
                  formation={formation}
                  isConfirmingDelete={confirmDeleteId === formation.id}
                  onLoad={() => handleLoadSaved(formation)}
                  onDelete={() => handleDelete(formation.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────

/** Miniature formation diagram for preset cards */
const MiniFormation: React.FC<{ positions: { x: number; y: number }[]; color: string }> = React.memo(({ positions, color }) => (
  <svg viewBox="0 0 100 140" className="w-full h-full">
    {/* Mini field */}
    <rect x="5" y="5" width="90" height="130" rx="2" fill="none" stroke="#D1D5DB" strokeWidth="1" />
    <line x1="5" y1="70" x2="95" y2="70" stroke="#D1D5DB" strokeWidth="0.8" />
    <circle cx="50" cy="70" r="12" fill="none" stroke="#D1D5DB" strokeWidth="0.8" />
    {/* Player dots */}
    {positions.map((pos, i) => (
      <circle
        key={i}
        cx={5 + pos.x * 90}
        cy={5 + pos.y * 65}
        r={3.5}
        fill={color}
        opacity={0.9}
      />
    ))}
  </svg>
));
MiniFormation.displayName = 'MiniFormation';

/** Preset formation card */
const PresetCard: React.FC<{
  preset: FormationPreset;
  isActive: boolean;
  onClick: () => void;
}> = React.memo(({ preset, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`relative flex flex-col items-center p-2 rounded-lg border-2 transition-all duration-150 text-left group ${
      isActive
        ? 'border-emerald-500 bg-emerald-50 shadow-sm'
        : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white'
    }`}
  >

    {/* Active indicator */}
    {isActive && (
      <div className="absolute top-1 right-1">
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      </div>
    )}
    {/* Mini diagram */}
    <div className="w-full aspect-[5/7] mb-1">
      <MiniFormation
        positions={preset.positions}
        color={isActive ? '#059669' : '#6B7280'}
      />
    </div>
    <span className={`text-xs font-bold ${isActive ? 'text-emerald-700' : 'text-gray-700'}`}>
      {preset.shortName}
    </span>
    <span className="text-[10px] text-gray-400 leading-tight text-center mt-0.5 hidden sm:block">
      {preset.name.replace(preset.shortName, '').trim()}
    </span>
  </button>
));
PresetCard.displayName = 'PresetCard';

/** Saved formation row with load/delete */
const SavedFormationRow: React.FC<{
  formation: SavedFormation;
  isConfirmingDelete: boolean;
  onLoad: () => void;
  onDelete: () => void;
}> = React.memo(({ formation, isConfirmingDelete, onLoad, onDelete }) => {
  const date = new Date(formation.createdAt);
  const timeStr = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="group flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
      {/* Formation icon */}
      <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <circle cx="15.5" cy="8.5" r="1.5" />
          <circle cx="12" cy="15.5" r="1.5" />
          <circle cx="8.5" cy="15.5" r="1.5" />
          <circle cx="15.5" cy="15.5" r="1.5" />
        </svg>
      </div>

      {/* Name + date */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{formation.name}</p>
        <p className="text-[10px] text-gray-400">{timeStr}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onLoad}
          className="p-1.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
          title="Load formation"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className={`p-1.5 rounded-md transition-colors ${
            isConfirmingDelete
              ? 'text-red-600 bg-red-50 hover:bg-red-100'
              : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
          }`}
          title={isConfirmingDelete ? 'Click again to confirm delete' : 'Delete formation'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
});
SavedFormationRow.displayName = 'SavedFormationRow';

export default FormationManager;
