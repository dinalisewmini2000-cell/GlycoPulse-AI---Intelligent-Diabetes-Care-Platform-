<?php
namespace Controllers;

use Models\AIPredictorModel;

class AIPredictionController {
    private $aiModel;

    public function __construct() {
        $this->aiModel = new AIPredictorModel();
    }

    public function handlePrediction($input) {
        $currentGlucose = $input['currentGlucose'] ?? 118;
        $lastCarbs = $input['lastCarbs'] ?? 45;
        $lastInsulin = $input['lastInsulin'] ?? 4;

        $prediction = $this->aiModel->predict($currentGlucose, $lastCarbs, $lastInsulin);
        echo json_encode(array_merge(['status' => 'success'], $prediction));
    }
}
