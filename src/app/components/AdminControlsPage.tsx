import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Pencil, Check, X, Search, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { downloadAsPDF } from '../../utils/pdfExport';
import { downloadAsCSV } from '../../utils/csvExport';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import api from '../../services/api';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';

export function AdminControlsPage() {
    const navigate = useNavigate();
    const [controls, setControls] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [totalItems, setTotalItems] = useState(0);
    const { isDarkMode } = useTheme();

    // Debounce search to prevent excessive API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchControls();
        }, 300);
        return () => clearTimeout(timer);
    }, [currentPage, searchTerm]);

    const fetchControls = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                page_size: itemsPerPage,
                search: searchTerm
            };

            const response = await api.accounts.adminControls.list(params);

            // Robust data handling similar to GenericTable
            let data = [];
            let count = 0;

            if (Array.isArray(response)) {
                data = response;
                count = response.length;
            } else if (response && Array.isArray((response as any).results)) {
                data = (response as any).results;
                count = (response as any).count || data.length;
            } else if (response && Array.isArray((response as any).data)) {
                data = (response as any).data;
                count = (response as any).total || data.length;
            }

            // Sort by ID to ensure stable ordering
            const sortedData = [...data].sort((a: any, b: any) => a.id - b.id);
            setControls(sortedData);
            setTotalItems(count);
        } catch (error) {
            console.error('Failed to fetch admin controls:', error);
            toast.error('Failed to load admin controls');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (control: any) => {
        setEditingId(control.id);
        setEditValue(control.value?.toString() || '');
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditValue('');
    };

    const handleSave = async (id: number) => {
        try {
            const newValue = parseInt(editValue) || 0;
            await (api.accounts.adminControls as any).patch(id, {
                value: newValue
            });

            // Optimistically update local state so row doesn't move
            setControls(prev => prev.map(c => c.id === id ? { ...c, value: newValue } : c));

            toast.success('Value updated successfully');
            setEditingId(null);
            setEditValue('');
        } catch (error) {
            console.error('Failed to update value:', error);
            toast.error('Failed to update value');
        }
    };

    // Server-side pagination: controls contains only the current page data
    // If server returns all data, we fallback to client-side filtering and slicing

    const filteredControls = controls.length > itemsPerPage
        ? controls.filter(c =>
            Object.values(c).some(val =>
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
        : controls;

    const currentData = controls.length > itemsPerPage
        ? filteredControls.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        : filteredControls;

    const totalPages = Math.ceil((controls.length > itemsPerPage ? filteredControls.length : totalItems) / itemsPerPage);

    if (loading && controls.length === 0) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9333ea]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Table Container */}
            <div
                className="rounded-xl overflow-hidden"
                style={{
                    backgroundColor: isDarkMode ? '#16213e' : '#FFF0F5',
                    border: `1px solid ${isDarkMode ? 'rgba(91, 192, 222, 0.2)' : 'rgba(77, 166, 255, 0.2)'}`,
                    boxShadow: isDarkMode ? '0 8px 32px rgb(91 192 222 / 0.2)' : '0 8px 32px rgb(0 127 255 / 0.2)'
                }}
            >
                {/* Unified Top Bar matching GenericTable */}
                <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: isDarkMode ? '#374151' : '#f3f4f6' }}>
                    <h2 className="text-xl font-bold" style={{ color: isDarkMode ? '#e8e8e8' : '#1f2937' }}>Admin Controls</h2>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search..."
                                className={`pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 h-auto ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : ''}`}

                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className={isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600' : ''}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => {
                                    try {
                                        const exportData = controls.map(c => [
                                            c.id,
                                            c.name?.replace(/_/g, ' ') || '-',
                                            c.description || c.descripttion || '-',
                                            String(c.value || 0)
                                        ]);
                                        downloadAsCSV({
                                            title: 'Admin Controls Report',
                                            columns: ['ID', 'NAME', 'DESCRIPTION', 'VALUE'],
                                            data: exportData
                                        });
                                        toast.success('CSV downloaded successfully');
                                    } catch (error) {
                                        console.error('CSV Export Error:', error);
                                        toast.error('Failed to generate CSV');
                                    }
                                }}>
                                    Download as CSV
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                    try {
                                        const exportData = controls.map(c => [
                                            c.id,
                                            c.name?.replace(/_/g, ' ') || '-',
                                            c.description || c.descripttion || '-',
                                            String(c.value || 0)
                                        ]);
                                        downloadAsPDF({
                                            title: 'Admin Controls Report',
                                            columns: ['ID', 'NAME', 'DESCRIPTION', 'VALUE'],
                                            data: exportData,
                                            isDarkMode
                                        });
                                        toast.success('PDF downloaded successfully');
                                    } catch (error) {
                                        console.error('PDF Export Error:', error);
                                        toast.error('Failed to generate PDF');
                                    }
                                }}>
                                    Download as PDF
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Table with Grid lines strictly matching screenshot */}
                <div className="overflow-x-auto border-t border-gray-200">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="text-white divide-x divide-white/20" style={{ backgroundColor: isDarkMode ? '#5BC0DE' : '#4DA6FF' }}>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider w-16">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">NAME</th>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">DESCRIPTION</th>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider w-32">VALUE</th>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider w-24">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className={isDarkMode ? 'bg-[#16213e]' : 'bg-white'}>
                            {currentData.length > 0 ? (
                                currentData.map((control, index) => (
                                    <tr
                                        key={control.id}
                                        className="divide-x divide-gray-300 border-b border-gray-300 transition-colors"
                                        style={{
                                            backgroundColor: index % 2 === 0
                                                ? (isDarkMode ? '#16213e' : '#FFF0F5')
                                                : (isDarkMode ? 'rgba(91, 192, 222, 0.15)' : 'rgba(0, 127, 255, 0.15)')
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(91, 192, 222, 0.1)' : 'rgba(77, 166, 255, 0.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? (isDarkMode ? '#16213e' : '#FFF0F5') : (isDarkMode ? 'rgba(91, 192, 222, 0.15)' : 'rgba(0, 127, 255, 0.15)')}
                                    >
                                        <td className="px-4 py-3 text-sm font-medium" style={{ color: isDarkMode ? '#e8e8e8' : '#374151' }}>
                                            {control.id}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium" style={{ color: isDarkMode ? '#e8e8e8' : '#374151' }}>
                                            {control.name?.replace(/_/g, ' ') || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm italic" style={{ color: isDarkMode ? '#e8e8e8' : '#374151' }}>
                                            {control.description || control.descripttion || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm" style={{ color: isDarkMode ? '#e8e8e8' : '#374151' }}>
                                            {editingId === control.id ? (
                                                <Input
                                                    type="number"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className={`w-full h-8 text-sm focus:ring-purple-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'border-purple-500'}`}
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-[#374151]'}`}>
                                                    {control.value || 0}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {editingId === control.id ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleSave(control.id)}
                                                        className="h-7 bg-green-600 hover:bg-green-700 text-white px-2 py-0 text-[10px]"
                                                    >
                                                        SAVE
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={handleCancel}
                                                        className="h-7 text-red-500 hover:bg-red-50 p-1"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleEdit(control)}
                                                    className={`h-7 flex items-center gap-1 mx-auto text-xs ${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-[#374151] hover:bg-purple-100'}`}
                                                >
                                                    <Pencil className="w-3 h-3" />
                                                    EDIT
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                                        No entries found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Section matching table theme */}
                {totalPages > 1 && (
                    <div
                        className="p-4 border-t flex items-center justify-between text-xs"
                        style={{
                            borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                            backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
                            color: isDarkMode ? '#9ca3af' : '#6b7280'
                        }}
                    >
                        <div>
                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
                        </div>
                        <div className="flex gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className={`h-8 w-8 p-0 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : ''}`}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className={`h-8 w-8 p-0 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : ''}`}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
