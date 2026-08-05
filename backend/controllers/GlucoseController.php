<?php
namespace Controllers;

use Models\GlucoseModel;

class GlucoseController {
    private $glucoseModel;

    public function __construct() {
        $this->glucoseModel = new GlucoseModel();
    }

    public function getLogs() {
        echo json_encode([
            'status' => 'success',
            'logs' => $this->glucoseModel->getGlucoseLogs(),
            'currentGlucose' => 118,
            'cgmStatus' => 'Active (Dexcom G7 BLE Sync)',
            'timeInRange' => $this->glucoseModel->calculateTimeInRange()
        ]);
    }

    public function createLog($input) {
        $log = $this->glucoseModel->addLog(
            $input['value'] ?? 120,
            $input['type'] ?? 'Manual Entry',
            $input['notes'] ?? ''
        );
        echo json_encode([
            'status' => 'success',
            'message' => 'Glucose reading recorded successfully',
            'log' => $log
        ]);
    }
}
