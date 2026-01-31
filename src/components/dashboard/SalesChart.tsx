'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { TrendingUp, ChevronDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';

interface SalesData {
    month: string;
    value: number;
    count: number;
}

interface SalesChartProps {
    data: SalesData[];
    period: string;
    onPeriodChange: (period: string) => void;
}

export default function SalesChart({ data, period, onPeriodChange }: SalesChartProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const maxValue = Math.max(...data.map(d => d.value), 1000);

    // Calculate points
    const points = useMemo(() => {
        return data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - (d.value / maxValue) * 100;
            return { x, y, ...d };
        });
    }, [data, maxValue]);

    // Create Smooth Path
    const createPath = (points: { x: number; y: number }[], closePath = false) => {
        if (points.length === 0) return '';
        const first = points[0];
        let d = `M ${first.x},${first.y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = i > 0 ? points[i - 1] : points[0];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = i !== points.length - 2 ? points[i + 2] : p2;
            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = p1.y + (p2.y - p0.y) / 6;
            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = p2.y - (p3.y - p1.y) / 6;
            d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
        }
        if (closePath) {
            d += ` L 100,100 L 0,100 Z`;
        }
        return d;
    };

    const linePath = createPath(points);
    const areaPath = createPath(points, true);

    // Smart Tooltip Layout logic
    const getTooltipStyles = (index: number) => {
        // Last item (Right align)
        if (index === data.length - 1) {
            return {
                container: {
                    right: 0,
                    left: 'auto',
                    transform: 'translateY(-130%)',
                    top: `${points[index].y}%`
                },
                arrow: {
                    right: '4px', // Align with point (approx centered in padding)
                    left: 'auto',
                    transform: 'translateX(0)'
                }
            };
        }

        // First item (Left align)
        if (index === 0) {
            return {
                container: {
                    left: 0,
                    transform: 'translateY(-130%)',
                    top: `${points[index].y}%`
                },
                arrow: {
                    left: '4px',
                    transform: 'translateX(0)'
                }
            };
        }

        // Middle items (Center align)
        return {
            container: {
                left: `${points[index].x}%`,
                transform: 'translateX(-50%) translateY(-130%)',
                top: `${points[index].y}%`
            },
            arrow: {
                left: '50%',
                transform: 'translateX(-50%)'
            }
        };
    };

    return (
        <Card className="bg-[#121218] border-white/5 overflow-visible shadow-2xl relative z-0">
            {/* Blue & Cyan Ambient Glows */}
            <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[200px] h-[200px] bg-cyan-600/10 rounded-full blur-[80px] pointer-events-none" />

            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5 bg-white/[0.02]">
                <div>
                    <CardTitle className="text-xl text-white font-bold tracking-tight">Histórico de Vendas</CardTitle>
                    <p className="text-xs text-gray-400 mt-1">Performance geral</p>
                </div>

                {/* Period Filter (Blue Theme) */}
                <div className="relative z-20">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-all"
                    >
                        {period === '6months' ? 'Últimos 6 meses' : period}
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>

                    <AnimatePresence>
                        {isFilterOpen && (
                            <m.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 top-full mt-2 w-40 bg-[#1e1e24] border border-white/10 rounded-xl shadow-xl overflow-hidden"
                            >
                                {['6months', '2026', '2025', '2024'].map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => {
                                            onPeriodChange(p);
                                            setIsFilterOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-xs hover:bg-white/5 transition-colors ${period === p ? 'text-cyan-400 font-bold bg-cyan-500/10' : 'text-gray-300'}`}
                                    >
                                        {p === '6months' ? 'Últimos 6 meses' : p}
                                    </button>
                                ))}
                            </m.div>
                        )}
                    </AnimatePresence>
                </div>
            </CardHeader>
            <CardContent className="p-6 relative z-10">
                <div className="h-[220px] w-full relative group">
                    <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-600 pointer-events-none select-none">
                        {[100, 75, 50, 25, 0].map((p) => (
                            <div key={p} className="flex w-full items-center">
                                <span className="w-8 text-right opacity-0 md:opacity-50 mr-2">
                                    {(maxValue * (p / 100) / 1000).toFixed(0)}k
                                </span>
                                <div className="h-[1px] flex-1 bg-white/5" />
                            </div>
                        ))}
                    </div>

                    <div className="absolute inset-0 ml-0 md:ml-10 mt-2 mb-6">
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                            <defs>
                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" /> {/* Sky Blue */}
                                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                                </linearGradient>
                                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#0ea5e9" /> {/* Sky Blue */}
                                    <stop offset="100%" stopColor="#22d3ee" /> {/* Cyan */}
                                </linearGradient>
                            </defs>

                            <path d={areaPath} fill="url(#areaGradient)" className="transition-all duration-1000 ease-out" />
                            <path d={linePath} fill="none" stroke="url(#lineGradient)" strokeWidth="0.8" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(14,165,233,0.3)]" />

                            {hoveredIndex !== null && (
                                <line
                                    x1={points[hoveredIndex].x}
                                    y1={points[hoveredIndex].y}
                                    x2={points[hoveredIndex].x}
                                    y2="100"
                                    stroke="url(#lineGradient)"
                                    strokeWidth="0.5"
                                    strokeDasharray="2 2"
                                    className="opacity-50 transition-all duration-300"
                                />
                            )}

                            {points.map((point, i) => (
                                <g key={i}>
                                    <rect
                                        x={point.x - 5}
                                        y="0"
                                        width="10"
                                        height="100"
                                        fill="transparent"
                                        onMouseEnter={() => setHoveredIndex(i)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        className="cursor-crosshair"
                                    />
                                    <circle
                                        cx={point.x}
                                        cy={point.y}
                                        r={hoveredIndex === i ? 2.5 : 0}
                                        fill="#fff"
                                        className="transition-all duration-300 pointer-events-none"
                                    />
                                    <circle
                                        cx={point.x}
                                        cy={point.y}
                                        r={hoveredIndex === i ? 5 : 0}
                                        fill="none"
                                        stroke="#0ea5e9"
                                        strokeWidth="0.5"
                                        className="transition-all duration-300 opacity-50 pointer-events-none"
                                    />
                                </g>
                            ))}
                        </svg>

                        {/* Smart Tooltip (Blue Theme) */}
                        <AnimatePresence>
                            {hoveredIndex !== null && (() => {
                                const styles = getTooltipStyles(hoveredIndex);
                                return (
                                    <m.div
                                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                        className="absolute top-0 pointer-events-none z-50 w-auto"
                                        style={styles.container as any}
                                    >
                                        <div className="bg-gradient-to-br from-blue-600 to-cyan-700 text-white rounded-xl px-4 py-2 shadow-2xl shadow-blue-500/30 whitespace-nowrap min-w-[120px]">
                                            <p className="font-semibold text-[10px] text-blue-100 opacity-80 uppercase tracking-wide mb-1 text-center">
                                                {data[hoveredIndex].month}
                                            </p>
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-xs font-normal opacity-90">Vendas</span>
                                                <span className="font-bold text-sm">R$ {data[hoveredIndex].value.toLocaleString('pt-BR')}</span>
                                            </div>
                                        </div>
                                        {/* Triangle */}
                                        <div
                                            className="absolute top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-cyan-700 -mt-[1px]"
                                            style={{ left: styles.arrow.left, transform: 'translateX(-50%)' }}
                                        />
                                    </m.div>
                                );
                            })()}
                        </AnimatePresence>

                        <div className="absolute left-0 right-0 bottom-[-25px] h-6 pointer-events-none">
                            {points.map((point, i) => (
                                <div
                                    key={i}
                                    className={`absolute text-xs font-medium transition-colors duration-300 transform -translate-x-1/2 ${hoveredIndex === i ? 'text-cyan-400 font-bold' : 'text-gray-500'}`}
                                    style={{ left: `${point.x}%` }}
                                >
                                    {point.month}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
