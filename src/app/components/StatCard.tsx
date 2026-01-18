import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader } from './ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface StatCardProps {
    title: string;
    value: string | number;
    description: string;
    icon: LucideIcon;
    iconColor: string;
    iconBgColor: string;
    growth?: number;
    growthLabel?: string;
    onClick?: () => void;
}

export function StatCard({
    title,
    value,
    description,
    icon: Icon,
    iconColor,
    iconBgColor,
    growth,
    growthLabel = 'from last week',
    onClick
}: StatCardProps) {
    const isPositive = growth !== undefined && growth >= 0;
    const { isDarkMode } = useTheme();

    return (
        <Card
            className={`hover:shadow-lg transition-all duration-200 ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
            onClick={onClick}
        >
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardDescription className="text-sm font-medium mb-1" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                            {title}
                        </CardDescription>
                    </div>
                    <div
                        className="rounded-lg p-3"
                        style={{ backgroundColor: iconBgColor }}
                    >
                        <Icon className="w-6 h-6" style={{ color: iconColor }} />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="text-3xl font-bold" style={{ color: isDarkMode ? '#e8e8e8' : '#111827' }}>
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </div>
                    <p className="text-sm" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                        {description}
                    </p>
                    {growth !== undefined && (
                        <div className="flex items-center gap-1 text-sm">
                            {isPositive ? (
                                <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-red-500" />
                            )}
                            <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                                {isPositive ? '+' : ''}{growth.toFixed(1)}%
                            </span>
                            <span style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}>{growthLabel}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
