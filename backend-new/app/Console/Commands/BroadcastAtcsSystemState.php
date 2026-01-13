<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Events\AtcsSystemUpdate;
use App\Models\Building;
use App\Models\Room;
use App\Models\Cctv;
use App\Models\Contact;
use App\Services\DashboardDataService;

class BroadcastAtcsSystemState extends Command
{
    protected $signature = 'atcs:broadcast';
    protected $description = 'Pusat Distribusi Data Real-Time untuk semua halaman';

    public function handle()
    {
        $this->info('🚀 Memulai siaran ATCS Global...');

        while (true) {
            // Kita ambil data bundle yang paling lengkap
            $data = [
                'stats' => [
                    'total_buildings' => Building::count(),
                    'total_rooms' => Room::count(),
                    'total_cctvs' => Cctv::count(),
                ],
                // Data grafik EKG (Home)
                'production_trends' => DashboardDataService::getSystemTrendData(),
                // Data Unit Performance (Home)
                'unit_performance' => DashboardDataService::getUnitBreakdownData(),
                // Data Gedung & CCTV (Maps & Playlist)
                'buildings' => Building::with(['rooms.cctvs'])->get(),
                // Data Kontak
                'contacts' => Contact::all(),
                'timestamp' => now()->toIso8601String(),
            ];

            // Siarkan ke SEMUA halaman lewat WebSocket
            event(new AtcsSystemUpdate($data));

            $this->info('📡 Data disiarkan ke semua halaman: ' . now()->format('H:i:s'));
            
            // Interval pengiriman (misal: tiap 2 detik agar benar-benar real-time)
            sleep(2);
        }
    }
}
