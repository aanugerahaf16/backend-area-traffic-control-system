<?php

namespace App\Services;

class ProductionTrendService extends BaseService
{
    public function __construct(\App\Repositories\ProductionTrendRepository $productionTrendRepository)
    {
        parent::__construct($productionTrendRepository);
    }

    public function getProductionTrends($startDate = null, $endDate = null)
    {
        return DashboardDataService::getSystemTrendData($startDate, $endDate);
    }
}