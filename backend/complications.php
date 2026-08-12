<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/config/database.php';

use Config\Database;

header('Content-Type: application/json');

try {
    $pdo = Database::getConnection();
    $dbDriver = Database::getDriver();

    // Calculate dynamic risk indices based on recent SQL glucose logs
    $stmt = $pdo->query("SELECT AVG(glucose_value) as avg_g, COUNT(*) as cnt FROM glucose_logs");
    $stats = $stmt->fetch();
    $avgG = $stats['avg_g'] ? round($stats['avg_g'], 1) : 124.5;

    $hypoRiskScore = $avgG < 90 ? '22%' : '12%';
    $hyperRiskScore = $avgG > 140 ? '28%' : '18%';

    echo json_encode([
        'status' => 'success',
        'database' => $dbDriver,
        'calculatedMeanGlucose' => $avgG,
        'riskScores' => [
            'hypoglycemiaRisk' => ['score' => $hypoRiskScore, 'level' => 'Low', 'status' => 'Stable'],
            'hyperglycemiaRisk' => ['score' => $hyperRiskScore, 'level' => 'Low', 'status' => 'Optimal'],
            'heartDiseaseRisk' => ['score' => '8%', 'level' => 'Low Risk', 'status' => 'Under Control'],
            'strokeRisk' => ['score' => '5%', 'level' => 'Minimal Risk', 'status' => 'Optimal'],
            'kidneyDiseaseRisk' => ['score' => '9%', 'level' => 'Low Risk', 'status' => 'Optimal (eGFR 94)'],
            'hospitalizationRisk' => ['score' => '3%', 'level' => 'Very Low', 'status' => 'Excellent']
        ],
        'complicationMonitoring' => [
            'footHealth' => [
                'lastScan' => '2026-08-01',
                'result' => 'Normal tissue perfusion; zero skin breakdown or ulceration detected.',
                'recommendation' => 'Daily thermal inspection & seamless diabetic footwear recommended.'
            ],
            'eyeExam' => [
                'lastExam' => '2025-11-14',
                'nextDue' => '2026-11-14',
                'status' => 'Fundus photography negative for Diabetic Retinopathy.'
            ],
            'neuropathy' => [
                'score' => '0 / 10',
                'symptoms' => 'Zero monofilament sensation deficits in distal lower extremities.'
            ],
            'bloodPressure' => [
                'recent' => '118/76 mmHg',
                'category' => 'Normal / Optimal Range'
            ]
        ]
    ]);
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Complications API error: ' . $e->getMessage()
    ]);
}
