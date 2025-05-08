export default function EnrichModal({
  isOpen,
  onClose,
  columns,
  selectedColumns,
  onColumnSelect,
  prompt,
  onPromptChange,
  onEnrich,
  isLoading,
  error,
  targetColumn
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          disabled={isLoading}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" fill="currentColor" fillOpacity="0.12" />
            <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold mb-2">Enrich Column</h2>
        <p className="mb-2 text-sm text-gray-600">
          Select columns to use as context and enter a prompt to enrich the <b>{targetColumn?.label}</b> column.
        </p>
        
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">Select Context Columns:</div>
          <div className="max-h-32 overflow-y-auto border rounded p-2">
            {columns
              .filter(col => col.id !== targetColumn?.id)
              .map(col => (
                <label key={col.id} className="flex items-center gap-2 py-1 hover:bg-gray-50 px-1 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(col.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onColumnSelect([...selectedColumns, col.id]);
                      } else {
                        onColumnSelect(selectedColumns.filter(id => id !== col.id));
                      }
                    }}
                    className="rounded border-gray-300 text-[#bfa76a] focus:ring-[#bfa76a]"
                  />
                  <span className="text-sm">{col.label}</span>
                </label>
              ))}
          </div>
        </div>

        <textarea
          className="w-full border rounded p-2 mb-2"
          rows={3}
          value={prompt}
          onChange={e => onPromptChange(e.target.value)}
          placeholder="e.g. Generate a summary using the selected columns"
          disabled={isLoading}
        />
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <div className="flex gap-2 justify-end">
          <button
            className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 disabled:opacity-60"
            onClick={() => onEnrich(targetColumn.id, prompt)}
            disabled={isLoading || !prompt.trim() || selectedColumns.length === 0}
          >
            {isLoading ? "Enriching..." : "Enrich"}
          </button>
        </div>
      </div>
    </div>
  );
} 