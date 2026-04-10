import { useState } from 'react';
import { GROUP_COLORS, MAX_GROUP_NAME_LENGTH } from '@utils/constants';

interface GroupFormProps {
  initialValues?: { name: string; color: string };
  onSubmit: (values: { name: string; color: string }) => void | Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export function GroupForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Sauvegarder',
  isLoading,
}: GroupFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [color, setColor] = useState(initialValues?.color ?? GROUP_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length === 0) {
      setError('Le nom est requis');
      return;
    }
    setError(null);
    await onSubmit({ name: name.trim(), color });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.slice(0, MAX_GROUP_NAME_LENGTH);
    setName(val);
    if (error && val.trim().length > 0) setError(null);
  };

  const errorId = 'group-name-error';

  return (
    <form onSubmit={(e) => { void handleSubmit(e); }} noValidate>
      {/* Name field */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="group-name-input" className="text-sm text-gray-400">Nom</label>
          <span className="text-xs text-gray-500">
            {name.length}/{MAX_GROUP_NAME_LENGTH}
          </span>
        </div>
        <input
          id="group-name-input"
          type="text"
          value={name}
          onChange={handleNameChange}
          placeholder="Nom du groupe"
          maxLength={MAX_GROUP_NAME_LENGTH}
          aria-required="true"
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? 'true' : undefined}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          data-testid="group-name-input"
        />
        {error && (
          <p id={errorId} className="text-red-400 text-xs mt-1" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Color palette */}
      <div className="mb-6">
        <label htmlFor="color-palette" className="text-sm text-gray-400 block mb-2">Couleur</label>
        <div id="color-palette" className="flex items-center gap-2 flex-wrap">
          {GROUP_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full transition-all ${
                color === c
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900'
                  : ''
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Couleur ${c}`}
              aria-pressed={color === c}
              data-testid={`color-swatch-${c}`}
            />
          ))}

          {/* Custom color picker */}
          <label
            className="w-7 h-7 rounded-full border border-white/20 cursor-pointer flex items-center justify-center overflow-hidden"
            title="Couleur personnalisée"
          >
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="opacity-0 absolute w-0 h-0"
              data-testid="color-picker-custom"
            />
            <span className="text-white text-xs pointer-events-none">+</span>
          </label>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="bg-white/10 hover:bg-white/20 text-white rounded-lg px-4 py-2 text-sm transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm transition-colors disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
