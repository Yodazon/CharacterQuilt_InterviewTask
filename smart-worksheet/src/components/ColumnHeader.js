import { useState, useRef, useEffect } from 'react';
import { columnTypes } from '../constants/columnTypes';

export default function ColumnHeader({ 
  column, 
  columnColor, 
  onRename, 
  onTypeChange, 
  onColorChange, 
  onRemove,
  onDuplicate,
  onInsertLeft,
  onInsertRight,
  onEnrich,
  isEnrichable = true
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(column.label);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleRename = () => {
    onRename(column.id, renameValue);
    setIsRenaming(false);
  };

  return (
    <th 
      className="px-3 py-2 border border-gray-300 text-left font-semibold w-[200px] shadow-sm relative group"
      style={{ backgroundColor: columnColor[column.id] || '#f8f9fa' }}
    >
      <div className="flex items-center gap-2">
        <button
          className="flex-1 text-left hover:bg-gray-100 rounded px-1 py-0.5"
          onClick={() => setDropdownOpen(true)}
        >
          {isRenaming ? (
            <input
              className="w-full border px-1 rounded text-sm bg-white"
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onBlur={handleRename}
              onKeyDown={e => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") {
                  setIsRenaming(false);
                  setRenameValue(column.label);
                }
              }}
              autoFocus
            />
          ) : (
            column.label
          )}
        </button>
        {dropdownOpen && (
          <div 
            ref={dropdownRef}
            className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20"
          >
            <div className="py-1">
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                onClick={() => {
                  setIsRenaming(true);
                  setDropdownOpen(false);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="text-gray-500">
                  <path d="M11 3H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M14 2l4 4-4 4M18 6H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Rename Column
              </button>
              {isEnrichable && (
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                  onClick={() => {
                    onEnrich(column.id);
                    setDropdownOpen(false);
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="text-gray-500">
                    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M15 5l-5 5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Enrich Column
                </button>
              )}
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                onClick={() => {
                  onDuplicate(column.id);
                  setDropdownOpen(false);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="text-gray-500">
                  <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Duplicate Column
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                onClick={() => {
                  onInsertLeft(column.id);
                  setDropdownOpen(false);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="text-gray-500">
                  <path d="M4 10h12M10 4v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Insert Column Left
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                onClick={() => {
                  onInsertRight(column.id);
                  setDropdownOpen(false);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="text-gray-500">
                  <path d="M4 10h12M10 4v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Insert Column Right
              </button>
              <div className="px-4 py-2">
                <div className="text-xs text-gray-500 mb-1">Column Color</div>
                <div className="flex gap-1">
                  {['#f8f9fa', '#e2e8f0', '#fef3c7', '#dbeafe', '#f3e8ff', '#fce7f3'].map(color => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => onColorChange(column.id, color)}
                    />
                  ))}
                </div>
              </div>
              <div className="px-4 py-2">
                <div className="text-xs text-gray-500 mb-1">Column Type</div>
                <div className="grid grid-cols-1 gap-1 max-h-[200px] overflow-y-auto pr-1">
                  {columnTypes.map(type => (
                    <button
                      key={type.value}
                      className={`text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 flex items-center gap-2 ${
                        column.type === type.value ? 'bg-gray-100 font-medium' : ''
                      }`}
                      onClick={() => {
                        onTypeChange(column.id, type.value);
                        setDropdownOpen(false);
                      }}
                    >
                      {type.icon} {type.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                onClick={() => {
                  onRemove(column.id);
                  setDropdownOpen(false);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="text-red-500">
                  <circle cx="10" cy="10" r="9" fill="currentColor" fillOpacity="0.12"/>
                  <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Delete Column
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="text-xs text-gray-400 px-1">{column.type}</div>
    </th>
  );
} 