<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardDataService;
use App\Models\Building;
use App\Models\Room;
use App\Models\Cctv;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DashboardBundleController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        
        // Cache the entire bundle for a short time (e.g., 2 seconds) for rapid requests
        return Cache::remember('dashboard_bundle_' . $startDate . '_' . $endDate, 2, function () use ($startDate, $endDate) {
            return response()->json([
                'success' => true,
                'message' => 'Dashboard data bundled successfully',
                'data' => [
                    'stats' => [
                        'total_buildings' => Building::count(),
                        'total_rooms' => Room::count(),
                        'total_cctvs' => Cctv::count(),
                    ],
                    'buildings' => Building::all(), // For maps/stats
                    'production_trends' => DashboardDataService::getSystemTrendData($startDate, $endDate),
                    'unit_performance' => DashboardDataService::getUnitBreakdownData(),
                ]
            ]);
        });
    }
}
