<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('cctvs', function (Blueprint $table) {
            $table->decimal('efficiency', 5, 2)->default(0);
            $table->decimal('traffic_volume', 8, 2)->default(0);
            $table->decimal('average_speed', 5, 2)->default(0);
            $table->decimal('congestion_index', 5, 2)->default(0);
            $table->decimal('green_wave_efficiency', 5, 2)->default(0);
            $table->decimal('target', 5, 2)->default(100);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cctvs', function (Blueprint $table) {
            $table->dropColumn([
                'efficiency',
                'traffic_volume',
                'average_speed',
                'congestion_index',
                'green_wave_efficiency',
                'target'
            ]);
        });
    }
};
