import React, { useState } from "react";
import { X, Users, Plus, Edit2, Trash2, Check, ShieldCheck, Sparkles, Palette } from "lucide-react";
import { Character } from "../types";

interface CharacterBibleManagerProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  onUpdateCharacters: (characters: Character[]) => void;
}

export const CharacterBibleManager: React.FC<CharacterBibleManagerProps> = ({
  isOpen,
  onClose,
  characters,
  onUpdateCharacters,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formAge, setFormAge] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formAppearance, setFormAppearance] = useState("");
  const [formWardrobe, setFormWardrobe] = useState("");
  const [formPalette, setFormPalette] = useState("");

  if (!isOpen) return null;

  const startEdit = (char: Character) => {
    setEditingId(char.id);
    setFormName(char.name);
    setFormAge(char.age);
    setFormRole(char.role);
    setFormAppearance(char.appearanceDescription);
    setFormWardrobe(char.signatureWardrobe);
    setFormPalette(char.colorPalette);
  };

  const startNew = () => {
    const newId = `char_${Date.now()}`;
    setEditingId(newId);
    setFormName("New Character");
    setFormAge("25");
    setFormRole("Protagonist");
    setFormAppearance("Sharp athletic features, dark messy hair, observant eyes");
    setFormWardrobe("Dark hooded jacket, tactical boots");
    setFormPalette("Charcoal, amber accent");
  };

  const saveCurrent = () => {
    if (!editingId) return;

    const existingIndex = characters.findIndex((c) => c.id === editingId);
    const updatedChar: Character = {
      id: editingId,
      name: formName.trim() || "Unnamed",
      age: formAge.trim() || "Unknown",
      role: formRole.trim() || "Character",
      appearanceDescription: formAppearance.trim(),
      signatureWardrobe: formWardrobe.trim(),
      colorPalette: formPalette.trim(),
      isActive: true,
    };

    if (existingIndex >= 0) {
      const copy = [...characters];
      copy[existingIndex] = updatedChar;
      onUpdateCharacters(copy);
    } else {
      onUpdateCharacters([...characters, updatedChar]);
    }

    setEditingId(null);
  };

  const deleteCharacter = (id: string) => {
    if (confirm("Remove this character from the consistency bible?")) {
      onUpdateCharacters(characters.filter((c) => c.id !== id));
      if (editingId === id) setEditingId(null);
    }
  };

  const toggleActive = (id: string) => {
    onUpdateCharacters(
      characters.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">AI Character Consistency Bible</h2>
              <p className="text-xs text-neutral-400">
                Maintains consistent facial features, wardrobe, and builds across all generated storyboard frames
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="px-6 py-3 bg-amber-950/30 border-b border-amber-800/40 text-amber-200/90 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>AI-Driven Consistency Engine:</strong> When you generate storyboard frames, each character's appearance description and wardrobe tags are automatically injected into the generation prompt.
          </span>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {editingId ? (
            /* Editing / Adding Form */
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  {characters.some((c) => c.id === editingId) ? "Edit Character" : "New Character Profile"}
                </span>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-xs text-neutral-400 hover:text-neutral-200"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                    Character Name
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Maya Chen"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                    Age / Stage
                  </label>
                  <input
                    type="text"
                    value={formAge}
                    onChange={(e) => setFormAge(e.target.value)}
                    placeholder="e.g. 26"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                    Role in Movie
                  </label>
                  <input
                    type="text"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Protagonist / Security Architect"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  Physical Appearance Description (Crucial for AI Face & Hair Continuity)
                </label>
                <textarea
                  value={formAppearance}
                  onChange={(e) => setFormAppearance(e.target.value)}
                  placeholder="e.g. Sharp jawline, dark bob haircut with emerald dyed fringe, fierce observant amber-brown eyes, slender athletic build"
                  rows={2}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2.5 text-xs text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                    Signature Wardrobe & Props
                  </label>
                  <input
                    type="text"
                    value={formWardrobe}
                    onChange={(e) => setFormWardrobe(e.target.value)}
                    placeholder="e.g. Charcoal techwear hoodie, green titanium ring"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                    Signature Color Palette
                  </label>
                  <input
                    type="text"
                    value={formPalette}
                    onChange={(e) => setFormPalette(e.target.value)}
                    placeholder="e.g. Charcoal, neon emerald, teal"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveCurrent}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Character Profile</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Active Cast ({characters.length})
              </span>
              <button
                id="btn-add-character"
                type="button"
                onClick={startNew}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Character</span>
              </button>
            </div>
          )}

          {/* Character Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {characters.map((char) => (
              <div
                key={char.id}
                className={`bg-neutral-950/80 border rounded-xl p-4 transition-all ${
                  char.isActive
                    ? "border-neutral-800 hover:border-neutral-700"
                    : "border-neutral-900 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-neutral-800 border border-amber-500/30 flex items-center justify-center font-bold text-sm text-amber-300">
                      {char.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-neutral-100 flex items-center gap-2">
                        <span>{char.name}</span>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                          {char.age ? `Age ${char.age}` : "Cast"}
                        </span>
                      </div>
                      <div className="text-xs text-amber-400 font-medium">{char.role}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(char)}
                      className="p-1 rounded text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
                      title="Edit character profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteCharacter(char.id)}
                      className="p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-neutral-800"
                      title="Delete character"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                      Appearance (Face / Hair / Build):
                    </span>
                    <p className="text-neutral-300 text-[11px] leading-relaxed line-clamp-2">
                      {char.appearanceDescription}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                      Signature Wardrobe:
                    </span>
                    <p className="text-neutral-300 text-[11px] leading-relaxed">{char.signatureWardrobe}</p>
                  </div>

                  {char.colorPalette && (
                    <div className="flex items-center gap-1.5 pt-1 text-[11px] text-neutral-400">
                      <Palette className="w-3 h-3 text-amber-500/80" />
                      <span>Palette: {char.colorPalette}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {characters.length === 0 && (
            <div className="text-center py-12 border border-dashed border-neutral-800 rounded-xl">
              <Users className="w-8 h-8 mx-auto text-neutral-600 mb-2" />
              <p className="text-xs text-neutral-400">No characters in bible yet.</p>
              <p className="text-[11px] text-neutral-500 mt-1">
                Upload a script to auto-extract cast or click "Add Character" to build one manually.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
