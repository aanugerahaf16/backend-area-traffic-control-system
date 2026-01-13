<?php

namespace App\Services;

use App\Models\Room;
use App\Models\ProductionTrend;
use App\Models\UnitPerformance;
use Illuminate\Support\Facades\Cache;

class DashboardDataService
{
    /**
     * Area Traffic Control System (ATCS)
     * "Heartbeat/EKG Monitor" logic.
     * Generates a rhythmic pulse pattern (P-QRS-T complex).
     */
    public static function getSystemTrendData($startDate = null, $endDate = null)
    {
        return Cache::remember('dashboard_atcs_heartbeat_v2', 1, function () {
            $rooms = Room::with(['building', 'cctvs'])->get();
            
            if ($rooms->isEmpty()) {
                return [];
            }

            $chartData = [];
            
            foreach ($rooms as $room) {
                $bName = $room->building->name ?? '';
                $label = $bName ? "{$bName} - {$room->name}" : $room->name;

                $cctv = $room->cctvs->first();
                $baseProd = (float) (($cctv->efficiency ?? 0) > 0 ? $cctv->efficiency : 85);
                $baseVol = (float) (($cctv->traffic_volume ?? 0) > 0 ? $cctv->traffic_volume : 4500);

                // Reduced to 20 points per room for better mobile display
                for ($i = 0; $i < 20; $i++) {
                    $pos = $i; 
                    
                    $pulse = 0;
                    if ($pos === 2) $pulse = 10; // P-wave
                    if ($pos === 4) $pulse = -5; // Q
                    if ($pos === 5) $pulse = 50; // R (SPIKE)
                    if ($pos === 6) $pulse = -15; // S
                    if ($pos === 10) $pulse = 15; // T-wave
                    
                    $chartData[] = [
                        'label' => ($i === 10) ? $label : "", // Center label in the 20-point block
                        'production' => min(100, max(0, $baseProd + ($pulse * 0.5) + rand(-2, 2))),
                        'traffic_volume' => max(0, $baseVol + ($pulse * 40) + rand(-100, 100)),
                        'green_wave_efficiency' => min(100, max(0, (float)($cctv->green_wave_efficiency ?? 75) + ($pulse * 0.3) + rand(-2, 2))),
                        'average_speed' => (float) (40 + ($pulse * 0.4) + rand(-1, 1)),
                    ];
                }
            }

            return $chartData;
        });
    }

    /**
     * Unit Performance aggregation
     */
    public static function getUnitBreakdownData()
    {
        return Cache::remember('dashboard_unit_perf_v4', 1, function () {
            $rooms = Room::with(['building', 'cctvs'])->get();
            
            return $rooms->map(function ($room) {
                $bName = $room->building->name ?? '';
                $label = $bName ? "{$bName} - {$room->name}" : $room->name;
                $cctv = $room->cctvs->first();

                return [
                    'unit' => $label,
                    'efficiency' => (int) (($cctv->efficiency ?? 0) > 0 ? $cctv->efficiency : 85),
                    'traffic_density' => (int) ((($cctv->traffic_volume ?? 0) > 0 ? $cctv->traffic_volume : 4500) / 50),
                    'signal_optimization' => (int) (($cctv->green_wave_efficiency ?? 0) > 0 ? $cctv->green_wave_efficiency : 75),
                    'capacity' => 100,
                ];
            })->values()->toArray();
        });
    }

    public static function getAggregatedLocalityData($startDate = null, $endDate = null)
    {
        return self::getUnitBreakdownData();
    }
}
