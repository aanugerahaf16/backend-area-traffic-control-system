<?php

namespace App\Services;

class UnitPerformanceService extends BaseService
{
    public function __construct(\App\Repositories\UnitPerformanceRepository $unitPerformanceRepository, \App\Repositories\BuildingRepository $buildingRepository)
    {
        parent::__construct($unitPerformanceRepository);
    }

    public function getUnitPerformance($startDate = null, $endDate = null)
    {
        return DashboardDataService::getUnitBreakdownData();
    }
}