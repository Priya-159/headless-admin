
export interface CSVExportOptions {
    title: string;
    columns: string[];
    data: (string | number)[][]; // Array of arrays matching columns
    fileName?: string;
}

export const downloadAsCSV = ({ title, columns, data, fileName }: CSVExportOptions) => {
    try {
        // Construct CSV content
        const headerRow = columns.map(col => `"${col.replace(/"/g, '""')}"`).join(',');
        const dataRows = data.map(row =>
            row.map(cell => {
                const cellStr = cell === null || cell === undefined ? '' : String(cell);
                return `"${cellStr.replace(/"/g, '""')}"`;
            }).join(',')
        );

        const csvContent = [headerRow, ...dataRows].join('\n');

        // Create Blob and download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        const finalFileName = fileName || `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;

        link.setAttribute('href', url);
        link.setAttribute('download', finalFileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error('CSV Export Failed:', error);
        throw error;
    }
};
