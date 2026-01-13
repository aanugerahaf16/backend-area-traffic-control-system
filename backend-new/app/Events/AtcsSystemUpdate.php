<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AtcsSystemUpdate implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $data;

    /**
     * Data yang dikirim mencakup:
     * - stats: untuk hitungan di semua page
     * - trends: untuk grafik EKG di home
     * - performance: untuk bar chart di home
     * - buildings: untuk update status di Maps & Playlist
     */
    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('atcs-global'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'system.update';
    }
}
