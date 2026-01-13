"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LabelList
} from 'recharts'
import { 
  getDashboardBundle,
  Stats,
  Building,
  Room,
  Cctv,
  ProductionTrend,
  UnitPerformance
} from '@/lib/api'
import { handleApiError, formatDateString } from '@/lib/enhanced-utils'

interface DateRange {
  start: string
  end: string
}

// Add metadata for the page

export default function Home() {
  const router = useRouter()
  const [stats, setStats] = useState({
    total_buildings: 0,
    total_rooms: 0,
    total_cctvs: 0
  });
  const [productionTrends, setProductionTrends] = useState<ProductionTrend[]>([]);
  const [unitPerformance, setUnitPerformance] = useState<UnitPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{start: string, end: string}>(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  });
  
  // State to track if we've initialized the date range based on actual data
  const [isDateRangeInitialized, setIsDateRangeInitialized] = useState(false);
  
  const [icons, setIcons] = useState<any>({});
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [liveTrends, setLiveTrends] = useState<any[]>([]);
  const [liveUnitPerf, setLiveUnitPerf] = useState<any[]>([]);
  const [oscillator, setOscillator] = useState(0);

  // Device detection for responsive charts
  useEffect(() => {
    setMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Load icons dynamically to avoid HMR issues with Turbopack
  useEffect(() => {
    let isMounted = true;
    
    const loadIcons = async () => {
      try {
        const lucide = await import('lucide-react');
        // Only update state if component is still mounted
        if (isMounted) {
          setIcons({
            Zap: lucide.Zap,
            BarChart3: lucide.BarChart3,
            Activity: lucide.Activity,
          });
        }
      } catch (error) {
        console.warn('Failed to load icons:', error);
        // Set empty icons object to prevent errors
        if (isMounted) {
          setIcons({});
        }
      }
    };
    
    loadIcons();
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, []);

  // ULTRA-DYNAMIC: Heartbeat Monitor (EKG) Oscillator
  useEffect(() => {
    if (!productionTrends.length && !unitPerformance.length) return;

    const jitterInterval = setInterval(() => {
      setOscillator(prev => prev + 0.3); // Faster pulse rate

      setLiveTrends(productionTrends.map((item, idx) => {
        // HYPER-DYNAMIC: Four independent heartbeats with distinct rhythms
        // 1. Volume: Intense, medium-speed heartbeat
        const pulseVol = Math.pow(Math.sin(oscillator * 1.2 + (idx * 0.5)), 14);
        // 2. Efficiency: Faster, lighter pulse
        const pulseProd = Math.pow(Math.sin(oscillator * 1.8 + (idx * 0.3)), 12);
        // 3. Optimization: Slower, deep rhythmic beat
        const pulseGreen = Math.pow(Math.cos(oscillator * 0.7 + (idx * 0.8)), 16);
        // 4. Speed: High-frequency diagnostic flicker
        const pulseSpeed = Math.pow(Math.sin(oscillator * 2.2 + (idx * 1.2)), 10);
        
        // Base liquid movement so it's never static
        const liquid = Math.sin(oscillator * 0.5 + idx) * 5;

        return {
          ...item,
          traffic_volume: (item.traffic_volume || 0) + (pulseVol * 1200) + liquid * 10,
          production: Math.min(100, Math.max(0, (item.production || 0) + (pulseProd * 25) + liquid)),
          green_wave_efficiency: Math.min(100, Math.max(0, (item.green_wave_efficiency || 0) + (pulseGreen * 20) + liquid)),
          average_speed: (item.average_speed || 0) + (pulseSpeed * 12) + liquid,
        };
      }));

      setLiveUnitPerf(unitPerformance.map((item, idx) => {
        // Decoupled wave oscillators: each bar moves at its own rhythm
        const waveEff = 0.5 + (Math.sin(oscillator + (idx * 1.5)) * 0.5);
        const waveDen = 0.5 + (Math.cos(oscillator + (idx * 0.8)) * 0.5);
        const waveOpt = 0.5 + (Math.sin(oscillator * 1.2 + (idx * 2)) * 0.5);
        
        return {
          ...item,
          efficiency: (item.efficiency || 0) * waveEff,
          traffic_density: (item.traffic_density || 0) * waveDen,
          signal_optimization: (item.signal_optimization || 0) * waveOpt,
        };
      }));
    }, 60); // Snappy 60ms EKG refresh

    return () => clearInterval(jitterInterval);
  }, [productionTrends, unitPerformance, oscillator]);

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Function to get date range for current month
  const getCurrentMonthDateRange = useCallback(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }, []);

  // Main function to load all dashboard data
  const loadData = useCallback(async (skipLoading = false) => {
    if (!skipLoading) {
      setLoading(true);
      setChartLoading(true);
    }
    
    try {
      // Use the consolidated bundle for initial load to prevent multiple requests timeout
      const bundle = await getDashboardBundle();

      const {
        stats: statsData,
        production_trends: productionData,
        unit_performance: unitPerformanceData,
        buildings: buildingData
      } = bundle;

      // Update states
      setStats({
        total_buildings: statsData.total_buildings,
        total_rooms: statsData.total_rooms,
        total_cctvs: statsData.total_cctvs,
      });
      setProductionTrends(productionData);
      setUnitPerformance(unitPerformanceData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      if (!skipLoading) {
        setLoading(false);
        setChartLoading(false);
      }
    }
  }, [handleApiError]);

  // Load data immediately on component mount
  useEffect(() => {
    let isMounted = true;
    
    // Initial fetch
    if (isMounted) {
      loadData();
    }

    // WEBSOCKET: Listen for real-time updates on EVERYTHING
    const loadEcho = async () => {
      const { initEcho } = await import('@/lib/echo');
      const echo = initEcho();
      
      if (echo && isMounted) {
        echo.channel('atcs-global')
          .listen('.system.update', (payload: any) => {
            if (!isMounted) return;
            
            const { stats: wsStats, production_trends: wsTrends, unit_performance: wsPerf } = payload.data;
            
            // Update stats instantly
            if (wsStats) setStats(wsStats);
            
            // Update charts instantly without buffering/loading
            if (wsTrends) setProductionTrends(wsTrends);
            if (wsPerf) setUnitPerformance(wsPerf);
            
            console.log('⚡ Real-time update received:', new Date().toLocaleTimeString());
          });
      }
    };

    loadEcho();
    
    return () => {
      isMounted = false;
      // Cleanup WebSocket subscription
      import('@/lib/echo').then(({ initEcho }) => {
        const echo = initEcho();
        if (echo) echo.leaveChannel('atcs-global');
      });
    };
  }, [loadData]);

  // Manual refresh function
  const handleRefresh = () => {
    loadData();
  };

  if (!mounted) return null;

  return (
    // Fixed background gradient to ensure full width and proper height
    <main className="bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 py-12 min-h-screen w-full">
      {/* Header */}
      <div className="w-full pt-4 pb-8 px-4">
        <div className="flex justify-center items-center gap-4">
          <h1 className="text-4xl font-semibold text-white">Home</h1>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Production Rate - Total Buildings */}
          <div 
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 flex flex-col items-center justify-center text-center"
          >
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-3 flex items-center justify-center">
                {icons.Zap && <icons.Zap className="w-10 h-10 text-yellow-400" />}
              </div>
              <p className="text-white font-bold text-base md:text-lg mb-2">Total Building</p>
              <p className="text-2xl md:text-3xl font-bold text-white">
                {loading ? '-' : stats.total_buildings}
              </p>
            </div>
          </div>

          {/* Efficiency - Total Rooms */}
          <div 
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 flex flex-col items-center justify-center text-center"
          >
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-3 flex items-center justify-center">
                {icons.BarChart3 && <icons.BarChart3 className="w-10 h-10 text-blue-400" />}
              </div>
              <p className="text-white font-bold text-base md:text-lg mb-2">Total Room</p>
              <p className="text-2xl md:text-3xl font-bold text-white">
                {loading ? '-' : stats.total_rooms}
              </p>
            </div>
          </div>

          {/* Units Active - Total CCTVs */}
          <div 
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 flex flex-col items-center justify-center text-center"
          >
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-3 flex items-center justify-center">
                {icons.Activity && <icons.Activity className="w-10 h-10 text-green-400" />}
              </div>
              <p className="text-white font-bold text-base md:text-lg mb-2">Total CCTV</p>
              <p className="text-2xl md:text-3xl font-bold text-white">
                {loading ? '-' : stats.total_cctvs}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Production Trends Chart */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white text-center w-full">
                Area Traffic Control System
              </h3>
            </div>
            <div className={isMobile ? "h-[450px]" : "h-[400px]"}>
              {chartLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-white font-semibold">Loading chart data...</p>
                </div>
              ) : productionTrends && productionTrends.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="90%">
                    <AreaChart
                      data={liveTrends.length > 0 ? liveTrends : productionTrends}
                      margin={{
                        top: 20,
                        right: 10,
                        left: 0,
                        bottom: isMobile ? 100 : 40,
                      }}
                    >
                    {/* ... (defs, grid, axis, tooltip, area stay same) ... */}
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="colorSignal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#ffffff10" vertical={false} />
                    <XAxis 
                      dataKey="label" 
                      stroke="#ffffff60" 
                      tick={{ fill: '#ffffff', fontSize: isMobile ? 10 : 12, fontWeight: '600' }}
                      angle={isMobile ? -45 : 0}
                      textAnchor={isMobile ? "end" : "middle"}
                      height={isMobile ? 120 : 60}
                      interval={0}
                    />
                    <YAxis yAxisId="left" stroke="#10b98160" width={isMobile ? 40 : 60} tick={{ fill: '#10b98180', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#3b82f660" width={isMobile ? 40 : 60} tick={{ fill: '#3b82f680', fontSize: 10 }} domain={[0, 100]} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '1rem', color: 'white' }} />
                    <Area yAxisId="left" type="monotone" dataKey="traffic_volume" stroke="#10b981" strokeWidth={3} fill="url(#colorVolume)" name="Volume" animationDuration={80} />
                    <Area yAxisId="right" type="monotone" dataKey="production" stroke="#3b82f6" strokeWidth={3} fill="url(#colorEfficiency)" name="Efficiency" animationDuration={80} />
                    <Area yAxisId="right" type="monotone" dataKey="green_wave_efficiency" stroke="#f59e0b" strokeWidth={3} fill="url(#colorSignal)" name="Optimization" animationDuration={80} />
                    <Area yAxisId="right" type="monotone" dataKey="average_speed" stroke="#ec4899" strokeWidth={3} fill="url(#colorSpeed)" name="Avg Speed" animationDuration={80} />
                    </AreaChart>
                  </ResponsiveContainer>
                  {/* Legend back to bottom */}
                  <div className="flex justify-center items-center gap-6 mt-4 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-[#10b981] rounded-full"></div>
                      <span className="text-[#ffffff80] text-[10px] font-medium uppercase tracking-wider">Volume</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-[#3b82f6] rounded-full"></div>
                      <span className="text-[#ffffff80] text-[10px] font-medium uppercase tracking-wider">Efficiency</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-[#f59e0b] rounded-full"></div>
                      <span className="text-[#ffffff80] text-[10px] font-medium uppercase tracking-wider">Optimization</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-[#ec4899] rounded-full"></div>
                      <span className="text-[#ffffff80] text-[10px] font-medium uppercase tracking-wider">Avg Speed</span>
                    </div>
                  </div>
                </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-white font-semibold">No ATCS data available for this range</p>
              </div>
            )}
          </div>
        </div>

          {/* Unit Performance Chart */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6 text-center">Unit Performance</h3>
            <div className={isMobile ? "h-[500px] px-2 flex flex-col" : "h-[400px] px-2 flex flex-col"}>
              {chartLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-white font-semibold">Loading chart data...</p>
                </div>
              ) : unitPerformance && unitPerformance.length > 0 ? (
                <>
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="90%">
                      <BarChart
                        data={liveUnitPerf.length > 0 ? liveUnitPerf : unitPerformance}
                         margin={{
                          top: 25,
                          right: 10,
                          left: 0,
                          bottom: isMobile ? 100 : 40,
                        }}
                        barGap={isMobile ? 4 : 12}
                        barCategoryGap={isMobile ? "10%" : "20%"}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="unit" stroke="#ffffff60" tick={{ fill: '#ffffff', fontSize: isMobile ? 10 : 12, fontWeight: '600' }} angle={isMobile ? -45 : 0} textAnchor={isMobile ? "end" : "middle"} height={isMobile ? 120 : 60} interval={0} axisLine={false} tickLine={false} />
                        <YAxis stroke="#ffffff40" width={isMobile ? 40 : 60} tick={{ fill: '#ffffff80', fontSize: 10 }} domain={[0, 100]} tickFormatter={(value) => `${value}%`} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '1rem', color: 'white' }} />
                        <Bar dataKey="efficiency" name="Efficiency" fill="#3b82f6" radius={[8, 8, 0, 0]} isAnimationActive={false}>
                          <LabelList dataKey="efficiency" position="top" style={{ fill: '#3b82f6', fontSize: 14, fontWeight: 'bold' }} formatter={(val: number) => `${val.toFixed(1)}%`} offset={10} />
                        </Bar>
                        <Bar dataKey="traffic_density" name="Density" fill="#10b981" radius={[8, 8, 0, 0]} isAnimationActive={false}>
                          <LabelList dataKey="traffic_density" position="top" style={{ fill: '#10b981', fontSize: 14, fontWeight: 'bold' }} formatter={(val: number) => `${val.toFixed(1)}%`} offset={10} />
                        </Bar>
                        <Bar dataKey="signal_optimization" name="Optimization" fill="#f59e0b" radius={[8, 8, 0, 0]} isAnimationActive={false}>
                          <LabelList dataKey="signal_optimization" position="top" style={{ fill: '#f59e0b', fontSize: 14, fontWeight: 'bold' }} formatter={(val: number) => `${val.toFixed(1)}%`} offset={10} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend back to bottom */}
                  <div className="flex justify-center items-center gap-6 mt-4 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-[#3b82f6] rounded-full"></div>
                      <span className="text-[#ffffff80] text-[10px] font-medium uppercase tracking-wider">Efficiency</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-[#10b981] rounded-full"></div>
                      <span className="text-[#ffffff80] text-[10px] font-medium uppercase tracking-wider">Density</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-[#f59e0b] rounded-full"></div>
                      <span className="text-[#ffffff80] text-[10px] font-medium uppercase tracking-wider">Optimization</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-white font-semibold">No performance data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}