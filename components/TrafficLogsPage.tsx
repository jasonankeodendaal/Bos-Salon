import React, { useState, useEffect, useMemo } from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, 
    BarChart, Bar, CartesianGrid, Legend, Cell, PieChart, Pie
} from 'recharts';

interface TrafficLog {
    id: number;
    date: string;
    source: string;
    medium?: string;
    campaign?: string;
    referrer?: string;
    userAgent: string;
    browser?: string;
    os?: string;
    deviceType?: string;
    page: string;
}

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#eab308', '#9333ea', '#64748b', '#000000'];

const TrafficLogsPage: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [logs, setLogs] = useState<TrafficLog[]>([]);

    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('traffic_logs') || '[]');
            setLogs(stored.reverse()); // newest first
        } catch {}
    }, []);

    const handlePrint = () => {
        window.print();
    };

    // Calculate Insights
    const metrics = useMemo(() => {
        const totalVisits = logs.length;
        
        // Group by Source
        const sourceMap = new Map<string, number>();
        // Group by Date for timeline
        const dateMap = new Map<string, number>();
        // Group by Device
        const deviceMap = new Map<string, number>();
        // Group by OS
        const osMap = new Map<string, number>();

        logs.forEach(log => {
            // Source
            const src = (log.source || 'Direct').toLowerCase();
            sourceMap.set(src, (sourceMap.get(src) || 0) + 1);

            // Date
            const dateObj = new Date(log.date);
            const dateStr = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`; // short format
            dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);

            // Device
            const dev = log.deviceType || 'Desktop';
            deviceMap.set(dev.charAt(0).toUpperCase() + dev.slice(1), (deviceMap.get(dev.charAt(0).toUpperCase() + dev.slice(1)) || 0) + 1);

            // OS
            const osName = (log.os && log.os !== 'Unknown') ? log.os.split(' ')[0] : 'Other';
            osMap.set(osName, (osMap.get(osName) || 0) + 1);
        });

        // Top Source
        let topSource = { name: 'None', value: 0 };
        sourceMap.forEach((val, key) => {
            if (val > topSource.value) topSource = { name: key, value: val };
        });

        const timelineData = Array.from(dateMap.entries()).map(([date, count]) => ({ date, visits: count })).reverse();
        const sourceData = Array.from(sourceMap.entries()).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 5);
        const deviceData = Array.from(deviceMap.entries()).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
        const osData = Array.from(osMap.entries()).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

        // Generate dynamic intelligence notes
        const insights = [];
        if (totalVisits === 0) {
            insights.push("Insufficient data. Awaiting inbound tracking signals.");
        } else {
            insights.push(`Analytics confirm [${topSource.name.toUpperCase()}] is the primary acquisition vector, driving ${((topSource.value / totalVisits) * 100).toFixed(1)}% of total traffic. Allocate primary marketing spend here.`);
            
            const mobileTraffic = deviceMap.get('Mobile') || 0;
            const mobilePercentage = (mobileTraffic / totalVisits) * 100;
            if (mobilePercentage > 60) {
                insights.push(`High mobile bias detected (${mobilePercentage.toFixed(1)}%). Ensure all conversion funnels and checkout flows are heavily optimized for smaller touch interfaces.`);
            } else if (mobilePercentage < 30) {
                insights.push(`Desktop remains the dominant platform (${(100 - mobilePercentage).toFixed(1)}%). Complex visual layouts and immersive desktop experiences are performing well with your audience.`);
            } else {
                insights.push(`Traffic is evenly split across devices. Responsive parity is critical for maintaining conversion rates.`);
            }

            if (sourceMap.has('instagram') || sourceMap.has('ig')) {
               insights.push('Instagram referral traffic identified. Consider leveraging "Link in Bio" tools to route users directly to high-converting booking pages.');
            }
            if (sourceMap.has('facebook') || sourceMap.has('fb')) {
               insights.push('Facebook traffic detected. Ensure Meta Pixel is installed if running paid acquisition campaigns.');
            }
            if (sourceMap.has('direct') || sourceMap.has('Direct')) {
               const directCount = sourceMap.get('Direct') || sourceMap.get('direct');
               if (directCount && (directCount / totalVisits) > 0.5) {
                   insights.push('High volume of Direct traffic. This indicates strong brand awareness or users returning via bookmarks/autocomplete.');
               }
            }
        }

        return { totalVisits, topSource, timelineData, sourceData, deviceData, osData, insights };
    }, [logs]);

    const exportToCSV = () => {
        const headers = ['Timestamp', 'Source', 'Medium', 'Campaign', 'Page Path', 'Device', 'OS', 'Browser'];
        const csvContent = [
            headers.join(','),
            ...logs.map(log => [
                `"${new Date(log.date).toISOString()}"`,
                `"${log.source || 'Direct'}"`,
                `"${log.medium || ''}"`,
                `"${log.campaign || ''}"`,
                `"${log.page}"`,
                `"${log.deviceType || 'unknown'}"`,
                `"${log.os || 'Unknown'}"`,
                `"${log.browser || 'Unknown'}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `traffic_logs_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-[1000] bg-gray-50 text-gray-900 overflow-auto p-4 sm:p-8">
            <div className="max-w-7xl mx-auto printable-area">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-white shadow-sm p-6 rounded-xl border border-gray-200 print:shadow-none print:border-none print:p-0 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold uppercase tracking-widest text-gray-900 mb-1 font-mono">Traffic Analytics Deck</h1>
                        <p className="text-sm text-gray-500 font-sans">Detailed breakdown of acquisition sources, active campaigns, and user intelligence.</p>
                    </div>
                    <div className="flex gap-4 print:hidden">
                        <button 
                            onClick={exportToCSV}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-green-700 transition shadow"
                        >
                            Export CSV
                        </button>
                        <button 
                            onClick={handlePrint}
                            className="bg-black text-white px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition shadow"
                        >
                            Export PDF
                        </button>
                        <button 
                            onClick={onClose}
                            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-gray-300 transition"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Intelligence Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Monitored Visits</h3>
                        <div className="text-5xl font-mono tracking-tighter text-blue-600">{metrics.totalVisits}</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Top Origin Source</h3>
                        <div className="text-3xl font-mono tracking-tight text-gray-800 capitalize truncate">{metrics.topSource.name}</div>
                        <p className="text-xs text-gray-500 mt-1">{metrics.totalVisits > 0 ? ((metrics.topSource.value / metrics.totalVisits) * 100).toFixed(1) : 0}% of all traffic</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center print:hidden">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">AI Intelligence Notes</h3>
                        <div className="space-y-2">
                            {metrics.insights.map((insight, idx) => (
                                <p key={idx} className="text-xs text-gray-600 font-sans italic leading-relaxed border-l-2 border-blue-500 pl-3">
                                    {insight}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                {metrics.totalVisits > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 print:block">
                        
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 print:mb-8">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b pb-2">Acquisition Sources (Top 5)</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={metrics.sourceData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} width={80} />
                                        <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                            {metrics.sourceData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 print:mb-8">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b pb-2">Device & OS Breakdown</h3>
                            <div className="h-64 flex flex-row">
                                <div className="w-1/2 h-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={metrics.deviceData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} fill="#8884d8" paddingAngle={5} dataKey="value">
                                                {metrics.deviceData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '10px'}} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="w-1/2 h-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={metrics.osData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} fill="#8884d8" paddingAngle={5} dataKey="value">
                                                {metrics.osData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '10px'}} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 print:mb-8 lg:col-span-2">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b pb-2">Traffic Timeline Over Sessions</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={metrics.timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
                                        <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                        <Area type="monotone" dataKey="visits" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>
                )}

                {/* Raw Logs Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-gray-300">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest">Detailed Event Stream</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-white border-b border-gray-200 text-gray-500 uppercase text-[10px] tracking-widest">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Timestamp</th>
                                    <th className="px-6 py-4 font-semibold">Source</th>
                                    <th className="px-6 py-4 font-semibold">Campaign / Medium</th>
                                    <th className="px-6 py-4 font-semibold">Pathname</th>
                                    <th className="px-6 py-4 font-semibold">Environment</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 border-b">
                                            <p className="mb-2">No traffic events captured.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="text-xs text-gray-900 font-mono">{new Date(log.date).toLocaleString()}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    log.source.toLowerCase().includes('facebook') || log.source.toLowerCase().includes('fb') ? 'bg-blue-100 text-blue-800' :
                                                    log.source.toLowerCase().includes('youtube') ? 'bg-red-100 text-red-800' :
                                                    log.source.toLowerCase().includes('tiktok') ? 'bg-black text-white' :
                                                    log.source.toLowerCase().includes('instagram') || log.source.toLowerCase().includes('ig') ? 'bg-pink-100 text-pink-800' :
                                                    log.source.toLowerCase().includes('google') ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {log.source || 'Direct'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {log.campaign || log.medium ? (
                                                    <div className="flex flex-col gap-1">
                                                        {log.campaign && <span className="text-[10px] text-gray-500 font-mono">c: {log.campaign}</span>}
                                                        {log.medium && <span className="text-[10px] text-gray-500 font-mono">m: {log.medium}</span>}
                                                    </div>
                                                ) : <span className="text-gray-300">-</span>}
                                            </td>
                                            <td className="px-6 py-4 text-blue-600 font-mono text-[11px]">
                                                {log.page}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-800 font-medium">{log.deviceType || 'unknown'} / {log.os || log.browser || 'Unknown'}</span>
                                                    <span className="text-[9px] text-gray-400 font-mono max-w-[150px] truncate block" title={log.userAgent}>
                                                        {log.browser}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <style>{`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .printable-area, .printable-area * {
                            visibility: visible;
                        }
                        .printable-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            padding: 0;
                            margin: 0;
                            background: white !important;
                        }
                        .shadow-sm, .rounded-xl {
                            box-shadow: none !important;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default TrafficLogsPage;
