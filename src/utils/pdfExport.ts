import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PDFExportOptions {
    title: string;
    columns: string[];
    data: any[][];
    fileName?: string;
    isDarkMode?: boolean;
}

export const downloadAsPDF = ({ title, columns, data, fileName, isDarkMode = false }: PDFExportOptions) => {
    console.log(`Starting PDF generation for: ${title}`);
    try {
        const doc = new jsPDF();

        // Background for Dark Mode
        if (isDarkMode) {
            doc.setFillColor(22, 33, 62); // #16213e
            doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
        }

        // Add title
        doc.setFontSize(18);
        doc.setTextColor(isDarkMode ? 232 : 100); // #e8e8e8 or dark gray
        doc.text(title, 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(isDarkMode ? 156 : 100); // #9ca3af or dark gray

        // Add date/time
        const timestamp = new Date().toLocaleString();
        doc.text(`Generated on: ${timestamp}`, 14, 30);

        console.log('Generating table via autoTable...');
        // Generate table using the standard autoTable function
        autoTable(doc, {
            startY: 35,
            head: [columns],
            body: data,
            theme: 'grid',
            headStyles: {
                fillColor: isDarkMode ? [55, 65, 81] : [147, 51, 234], // Gray-700 or Purple
                textColor: 255,
                fontSize: 10,
                fontStyle: 'bold'
            },
            bodyStyles: {
                fontSize: 9,
                textColor: isDarkMode ? 220 : 50,
                fillColor: isDarkMode ? [31, 41, 55] : [255, 255, 255] // Gray-800 or White
            },
            alternateRowStyles: {
                fillColor: isDarkMode ? [22, 33, 62] : [249, 250, 251] // Dark Blue or Light Gray
            },
            margin: { top: 35 }
        });

        // Save the PDF
        const finalFileName = fileName || `${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        console.log(`Saving PDF as: ${finalFileName}`);
        doc.save(finalFileName);
        console.log('PDF saved successfully');
    } catch (error) {
        console.error('CRITICAL: PDF Generation failed in utility:', error);
        throw error;
    }
};
