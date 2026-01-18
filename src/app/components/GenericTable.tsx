import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { downloadAsPDF } from '../../utils/pdfExport';
import { downloadAsCSV } from '../../utils/csvExport';
import AnalyticsChart from './RealTimeAnalytics';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from './ui/button';
import { useTheme } from '../../contexts/ThemeContext';

interface Column {
    header: string;
    accessor: string;
    render?: (row: any) => React.ReactNode;
    className?: string;
}

interface GenericTableProps {
    title: string;
    columns: Column[];
    fetchData: (params?: any) => Promise<any>;
    onAdd?: () => void;
    onEdit?: (item: any) => void;
    onDelete?: (item: any) => void;
    onRowClick?: (item: any) => void;
    searchPlaceholder?: string;
    showAnalytics?: boolean;
    analyticsContext?: 'users' | 'trips' | 'notifications' | 'revenue';
    paginationMode?: 'client' | 'server';
}

const GenericTable: React.FC<GenericTableProps> = ({
    title,
    columns,
    fetchData,
    onAdd,
    onEdit,
    onDelete,
    onRowClick,
    searchPlaceholder = "Search...",
    showAnalytics = true,
    analyticsContext,
    paginationMode = 'client'
}) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    const [totalServerItems, setTotalServerItems] = useState(0);
    const { isDarkMode } = useTheme();
    const tableRef = React.useRef<HTMLDivElement>(null);

    // Determine analytics context based on title if not provided
    const getAnalyticsContext = () => {
        if (analyticsContext) return analyticsContext;
        const t = title.toLowerCase();

        // Detailed Mapping based on user request
        if (t.includes('api usage')) return 'api-usage';
        if (t.includes('free request')) return 'free-requests';
        if (t.includes('subscription')) return 'revenue';
        if (t.includes('trip usage')) return 'trip-usage';
        if (t.includes('scheduled campaign')) return 'scheduled-campaigns';
        if (t.includes('log book')) return 'logbooks';
        if (t.includes('fuel price')) return 'fuel-prices';
        if (t.includes('user vehicle')) return 'vehicles';

        // General fallback
        if (t.includes('user') || t.includes('account')) return 'users';
        if (t.includes('trip') || t.includes('vehicle') || t.includes('log') || t.includes('remind')) return 'trips';
        if (t.includes('notification') || t.includes('campaign') || t.includes('message')) return 'notifications';
        return 'revenue';
    };

    useEffect(() => {
        // Reset to page 1 when search changes in server mode
        if (paginationMode === 'server') {
            setCurrentPage(1);
        }
    }, [searchTerm, title]);

    useEffect(() => {
        loadData();
    }, [title, currentPage, itemsPerPage, searchTerm, paginationMode]);

    const loadData = async () => {
        const hasData = data.length > 0;
        try {
            // In server mode, we always show loading on page/search change if purely relying on network
            // But with cache, it might be fast.
            if (!hasData || paginationMode === 'server') setLoading(true);

            let params: any = {};
            if (paginationMode === 'server') {
                params = {
                    page: currentPage,
                    page_size: itemsPerPage,
                    search: searchTerm
                };
            }

            const result = await fetchData(params);

            // Robust data unwrapping
            let items: any[] = [];
            let totalCount = 0;

            if (Array.isArray(result)) {
                items = result;
                totalCount = result.length;
            } else if (result && Array.isArray((result as any).results)) {
                items = (result as any).results;
                totalCount = (result as any).count || items.length;
            } else if (result && Array.isArray((result as any).data)) {
                items = (result as any).data;
                totalCount = (result as any).total || items.length;
            }

            setData(items);
            if (paginationMode === 'server') {
                setTotalServerItems(totalCount);
            }
        } catch (err: any) {
            console.error("Failed to load data:", err);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // Client-side filtering (only if client mode)
    // Client-side filtering (applied if client mode OR if server returns full dataset)
    const shouldFilterLocally = paginationMode === 'client' || (paginationMode === 'server' && data.length > itemsPerPage);

    const filteredData = shouldFilterLocally
        ? data.filter(item =>
            Object.values(item).some(val =>
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
        : data;

    // Pagination logic
    const totalPages = shouldFilterLocally
        ? Math.ceil(filteredData.length / itemsPerPage)
        : Math.ceil(totalServerItems / itemsPerPage);

    const currentData = shouldFilterLocally
        ? filteredData.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        )
        : data;

    return (
        <div className="space-y-6" ref={tableRef}>
            {/* Real-time Analysis Graph */}
            {showAnalytics && <AnalyticsChart context={getAnalyticsContext()} />}

            <div
                className="rounded-xl overflow-hidden"
                style={{
                    backgroundColor: isDarkMode ? '#16213e' : '#FFF0F5',
                    border: `1px solid ${isDarkMode ? 'rgba(91, 192, 222, 0.2)' : 'rgba(77, 166, 255, 0.2)'} `,
                    boxShadow: isDarkMode ? '0 8px 32px rgb(91 192 222 / 0.2)' : '0 8px 32px rgb(0 127 255 / 0.2)'
                }}
            >
                <div className="p-4 sm:p-6 border-b flex flex-row items-center justify-between gap-2 sm:gap-4" style={{ borderColor: isDarkMode ? '#374151' : '#f3f4f6' }}>
                    <h2 className="text-base sm:text-xl font-bold truncate" style={{ color: isDarkMode ? '#e8e8e8' : '#1f2937' }}>{title}</h2>

                    <div className="flex items-center gap-3">
                        <div className="relative flex-grow sm:flex-grow-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 sm:w-64 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : ''}`}
                            />
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className={`items-center ${isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600' : ''}`}>
                                        <Download className="w-4 h-4 sm:mr-2" />
                                        <span className="hidden sm:inline">Download</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => {
                                        try {
                                            const exportData = filteredData.map(row =>
                                                columns.map(col => {
                                                    const val = row[col.accessor as keyof typeof row];
                                                    return typeof val === 'object' ? JSON.stringify(val) : (val === null || val === undefined ? '' : String(val));
                                                })
                                            );
                                            downloadAsCSV({
                                                title,
                                                columns: columns.map(c => c.header),
                                                data: exportData
                                            });
                                        } catch (error) {
                                            console.error('CSV Export Error:', error);
                                            alert('Failed to generate CSV. Please try again.');
                                        }
                                    }}>
                                        Download as CSV
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                        try {
                                            const exportData = filteredData.map(row =>
                                                columns.map(col => {
                                                    const val = row[col.accessor as keyof typeof row];
                                                    return typeof val === 'object' ? JSON.stringify(val) : String(val || '-');
                                                })
                                            );
                                            downloadAsPDF({
                                                title,
                                                columns: columns.map(c => c.header),
                                                data: exportData,
                                                isDarkMode
                                            });
                                        } catch (error) {
                                            console.error('PDF Export Error:', error);
                                            alert('Failed to generate PDF. Please try again.');
                                        }
                                    }}>
                                        Download as PDF
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {onAdd && (
                                <button
                                    onClick={onAdd}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add New
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto overflow-y-auto max-h-[70vh] border-2 border-gray-500 rounded-lg">
                    <table className="w-full text-left border-collapse">
                        <thead style={{ backgroundColor: isDarkMode ? '#5BC0DE' : '#4DA6FF' }}>
                            <tr>
                                {columns.map((col, idx) => (
                                    <th key={idx} className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider border-r-2 last:border-r-0 text-white ${col.className || ''}`} style={{ borderColor: isDarkMode ? 'rgba(91, 192, 222, 0.6)' : 'rgba(77, 166, 255, 0.6)' }}>
                                        {col.header}
                                    </th>
                                ))}
                                {(onEdit || onDelete) && (
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right border-l-2 text-white" style={{ borderColor: isDarkMode ? 'rgba(91, 192, 222, 0.6)' : 'rgba(77, 166, 255, 0.6)' }}>
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-gray-500">
                            {loading && data.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="px-6 py-12 text-center text-gray-400">
                                        Loading data...
                                    </td>
                                </tr>
                            ) : currentData.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="px-6 py-12 text-center text-gray-400">
                                        No records found
                                    </td>
                                </tr>
                            ) : (
                                currentData.map((row, rowIdx) => (
                                    <tr
                                        key={rowIdx}
                                        className={`transition - colors ${onRowClick ? 'cursor-pointer' : ''} `}
                                        style={{
                                            backgroundColor: rowIdx % 2 === 0
                                                ? (isDarkMode ? '#16213e' : '#FFF0F5')
                                                : (isDarkMode ? 'rgba(91, 192, 222, 0.15)' : 'rgba(0, 127, 255, 0.15)'),
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(91, 192, 222, 0.1)' : 'rgba(77, 166, 255, 0.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = rowIdx % 2 === 0 ? (isDarkMode ? '#16213e' : '#FFF0F5') : (isDarkMode ? 'rgba(91, 192, 222, 0.15)' : 'rgba(0, 127, 255, 0.15)')}
                                        onClick={() => onRowClick?.(row)}
                                    >
                                        {columns.map((col, colIdx) => (
                                            <td key={colIdx} className={`px-6 py-4 text-sm border-r-2 border-gray-500 last:border-r-0 font-medium ${col.className || ''}`} style={{ color: isDarkMode ? '#e8e8e8' : '#374151' }}>
                                                {col.render ? col.render(row) : (row[col.accessor as keyof typeof row] || '-')}
                                            </td>
                                        ))}
                                        {(onEdit || onDelete) && (
                                            <td className="px-6 py-4 text-right flex justify-end gap-2 border-l-2 border-gray-500">
                                                {onEdit && (
                                                    <button
                                                        onClick={() => onEdit(row)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button
                                                        onClick={() => onDelete(row)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Always show pagination if there are pages, even while loading (buttons will be disabled via disabled prop if needed, or we just let them stay but they won't trigger if loading is handled elsewhere, or user just wants them visible) */}
                {(totalPages > 1 || loading) && (
                    <div
                        className="p-4 border-t flex items-center justify-between"
                        style={{
                            borderColor: isDarkMode ? '#374151' : '#f3f4f6',
                            color: isDarkMode ? '#9ca3af' : '#6b7280'
                        }}
                    >
                        <div className="text-sm">
                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, paginationMode === 'server' ? totalServerItems : filteredData.length)} of {paginationMode === 'server' ? totalServerItems : filteredData.length} entries
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1 || loading}
                                className={`p-2 border rounded-lg disabled:opacity-50 transition-colors ${isDarkMode
                                    ? 'border-gray-700 hover:bg-gray-700 text-gray-300'
                                    : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                    }`}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || loading}
                                className={`p-2 border rounded-lg disabled:opacity-50 transition-colors ${isDarkMode
                                    ? 'border-gray-700 hover:bg-gray-700 text-gray-300'
                                    : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                    }`}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GenericTable;
