// Utility functions for worksheet operations
export const generateUniqueId = (baseId, existingIds) => {
  let counter = 1;
  let newId = `${baseId}_copy`;
  while (existingIds.some(id => id === newId)) {
    newId = `${baseId}_copy_${counter}`;
    counter++;
  }
  return newId;
};

export const sanitizeColumnId = (name) => {
  return name.toLowerCase().replace(/\s+/g, "_");
};

export const createEmptyRow = (columns) => {
  const newRow = { id: Date.now() };
  columns.forEach(col => {
    newRow[col.id] = "";
  });
  return newRow;
};

export const exportToCSV = (rows, columns) => {
  const csvData = rows.map(row => {
    const out = {};
    columns.forEach(col => {
      out[col.label] = row[col.id];
    });
    return out;
  });
  return csvData;
};

export const exportToExcel = (rows, columns) => {
  const wsData = [columns.map(col => col.label)];
  rows.forEach(row => {
    wsData.push(columns.map(col => row[col.id]));
  });
  return wsData;
};

export const processImportedData = (data, fileType) => {
  if (fileType === "csv") {
    if (!data.meta.fields) return null;
    return {
      columns: data.meta.fields.map(label => ({
        id: sanitizeColumnId(label),
        label,
        type: "text"
      })),
      rows: data.data
        .filter(row => Object.values(row).some(v => v !== undefined && v !== null && v !== ""))
        .map((row, idx) => {
          const out = { id: Date.now() + idx };
          data.meta.fields.forEach(label => {
            out[sanitizeColumnId(label)] = row[label] || "";
          });
          return out;
        })
    };
  } else if (fileType === "xlsx") {
    if (!data.length) return null;
    const header = data[0];
    return {
      columns: header.map(label => ({
        id: sanitizeColumnId(label),
        label,
        type: "text"
      })),
      rows: data.slice(1)
        .filter(row => row.length > 0 && row.some(cell => cell !== undefined && cell !== null && cell !== ""))
        .map((row, idx) => {
          const out = { id: Date.now() + idx };
          header.forEach((label, i) => {
            out[sanitizeColumnId(label)] = row[i] || "";
          });
          return out;
        })
    };
  }
  return null;
}; 