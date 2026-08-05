<?php
require_once __DIR__ . '/cors.php';

echo json_encode([
    'status' => 'success',
    'riskScores' => [
        'hypoglycemiaRisk' => ['score' => '12%', 'level' => 'Low', 'status' => 'Stable'],
        'hyperglycemiaRisk' => ['score' => '18%', 'level' => 'Low', 'status' => 'Optimal'],
        'heartDiseaseRisk' => ['score' => '8%', 'level' => 'Low Risk', 'status' => 'Under Control'],
        'strokeRisk' => ['score' => '5%', 'level' => 'Minimal Risk', 'status' => 'Optimal'],
        'kidneyDiseaseRisk' => ['score' => '9%', 'level' => 'Low Risk', 'status' => 'Optimal (eGFR 94)'],
        'hospitalizationRisk' => ['score' => '3%', 'level' => 'Very Low', 'status' => 'Excellent']
    ],
    'complicationMonitoring' => [
        'footHealth' => [
            'lastScan' => '2026-08-01',
            'result' => 'Normal tissue perfusion; no skin breakdown or ulcer detected.',
            'recommendation' => 'Perform daily foot checks and wear breathable seamless diabetic socks.'
        ],
        'eyeExam' => [
            'lastExam' => '2025-11-14',
            'nextDue' => '2026-11-14',
            'status' => 'No Diabetic Retinopathy detected.'
        ],
        'neuropathy' => [
            'score' => '0 / 10',
            'symptoms' => 'None reported (No tingling, numbness, or burning sensation in lower extremities).'
        ],
        'bloodPressure' => [
            'recent' => '118/76 mmHg',
            'category' => 'Normal'
        ]
    ]
]);
