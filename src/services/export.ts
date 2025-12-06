
export const exportToCSV = <T>(
  data: T[],
  columns: { header: string; key: keyof T | ((item: T) => string | number) }[],
  filename: string
) => {
  if (!data || data.length === 0) {
    alert("Não há dados para exportar.");
    return;
  }

  // 1. Prepare Headers (semicolon separated for Brazilian Excel compatibility)
  const headers = columns.map(c => c.header).join(';');

  // 2. Prepare Rows
  const rows = data.map(item => {
    return columns.map(col => {
      let value;
      if (typeof col.key === 'function') {
        value = col.key(item);
      } else {
        value = item[col.key as keyof T];
      }
      
      // Handle null/undefined
      if (value === null || value === undefined) value = '';

      // Convert to string and sanitize
      const stringValue = String(value);

      // Escape quotes and wrap in quotes if necessary (standard CSV rule)
      // We also replace line breaks to keep row integrity
      const escaped = stringValue.replace(/"/g, '""').replace(/\n/g, ' ');
      
      return `"${escaped}"`;
    }).join(';');
  });

  // 3. Combine with BOM for UTF-8 correctly in Excel
  const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n');

  // 4. Trigger Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
