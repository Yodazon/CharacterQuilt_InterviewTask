import { useState, useCallback } from 'react';
import { generateUniqueId, createEmptyRow, sanitizeColumnId } from '../utils/worksheetUtils';

export const useWorksheet = (initialColumns = [], initialRows = [], onChange) => {
  const [columns, setColumns] = useState(initialColumns);
  const [rows, setRows] = useState(initialRows);

  const updateWorksheet = useCallback((newColumns, newRows) => {
    setColumns(newColumns);
    setRows(newRows);
    onChange?.(newColumns, newRows);
  }, [onChange]);

  const addColumn = useCallback((position = 'end', baseColId = null, newColName = '', newColType = 'text') => {
    if (!newColName.trim() && !baseColId) return;
    
    const baseCol = baseColId ? columns.find(c => c.id === baseColId) : null;
    const id = baseCol ? generateUniqueId(baseCol.id, columns.map(c => c.id)) : sanitizeColumnId(newColName);
    const label = baseCol ? `${baseCol.label} (Copy)` : newColName;
    const type = baseCol ? baseCol.type : newColType;
    
    let newColumns;
    if (position === 'end') {
      newColumns = [...columns, { id, label, type }];
    } else if (position === 'left') {
      const idx = columns.findIndex(c => c.id === baseColId);
      newColumns = [...columns.slice(0, idx), { id, label, type }, ...columns.slice(idx)];
    } else if (position === 'right') {
      const idx = columns.findIndex(c => c.id === baseColId);
      newColumns = [...columns.slice(0, idx + 1), { id, label, type }, ...columns.slice(idx + 1)];
    }

    const newRows = rows.map(row => {
      const newRow = { ...row };
      if (baseCol) {
        newRow[id] = row[baseColId] || "";
      } else {
        newRow[id] = "";
      }
      return newRow;
    });

    updateWorksheet(newColumns, newRows);
  }, [columns, rows, updateWorksheet]);

  const removeColumn = useCallback((colId) => {
    const newColumns = columns.filter(col => col.id !== colId);
    const newRows = rows.map(row => {
      const newRow = { ...row };
      delete newRow[colId];
      return newRow;
    });
    updateWorksheet(newColumns, newRows);
  }, [columns, rows, updateWorksheet]);

  const changeColumnType = useCallback((colId, newType) => {
    const newColumns = columns.map(col =>
      col.id === colId ? { ...col, type: newType } : col
    );
    updateWorksheet(newColumns, rows);
  }, [columns, rows, updateWorksheet]);

  const addRow = useCallback(() => {
    const newRow = createEmptyRow(columns);
    updateWorksheet(columns, [...rows, newRow]);
  }, [columns, rows, updateWorksheet]);

  const removeRow = useCallback((rowId) => {
    updateWorksheet(columns, rows.filter(row => row.id !== rowId));
  }, [columns, rows, updateWorksheet]);

  const updateCell = useCallback((rowId, colId, value) => {
    const newRows = rows.map(row =>
      row.id === rowId ? { ...row, [colId]: value } : row
    );
    updateWorksheet(columns, newRows);
  }, [columns, rows, updateWorksheet]);

  const renameColumn = useCallback((colId, newLabel) => {
    const newColumns = columns.map(col =>
      col.id === colId ? { ...col, label: newLabel.trim() || col.label } : col
    );
    updateWorksheet(newColumns, rows);
  }, [columns, rows, updateWorksheet]);

  return {
    columns,
    rows,
    addColumn,
    removeColumn,
    changeColumnType,
    addRow,
    removeRow,
    updateCell,
    renameColumn,
    updateWorksheet
  };
}; 