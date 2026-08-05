<?php
require_once __DIR__ . '/cors.php';

$sampleReports = [
    [
        'id' => 'lab-2026-07',
        'reportDate' => '2026-07-28',
        'labName' => 'Quest Diagnostics Central Lab',
        'parameters' => [
            ['name' => 'HbA1c (Glycated Hemoglobin)', 'value' => '6.3 %', 'range' => '< 5.7 % (Normal), 5.7-6.4% (Prediabetes)', 'status' => 'Well-Controlled'],
            ['name' => 'Fasting Blood Glucose', 'value' => '104 mg/dL', 'range' => '70 - 99 mg/dL', 'status' => 'Slightly Elevated'],
            ['name' => 'eGFR (Kidney Function)', 'value' => '94 mL/min/1.73m2', 'range' => '> 60 mL/min', 'status' => 'Normal / Healthy'],
            ['name' => 'Serum Creatinine', 'value' => '0.85 mg/dL', 'range' => '0.60 - 1.10 mg/dL', 'status' => 'Normal'],
            ['name' => 'Total Cholesterol', 'value' => '165 mg/dL', 'range' => '< 200 mg/dL', 'status' => 'Optimal'],
            ['name' => 'LDL (Bad Cholesterol)', 'value' => '88 mg/dL', 'range' => '< 100 mg/dL', 'status' => 'Optimal'],
            ['name' => 'HDL (Good Cholesterol)', 'value' => '54 mg/dL', 'range' => '> 50 mg/dL', 'status' => 'Healthy'],
            ['name' => 'Triglycerides', 'value' => '115 mg/dL', 'range' => '< 150 mg/dL', 'status' => 'Normal']
        ],
        'aiSummary' => 'Your HbA1c has improved from 6.8% to 6.3%, demonstrating excellent glycemic control over the past 90 days. Kidney markers (eGFR 94, Creatinine 0.85) and lipid profiles are in optimal range, indicating low 5-year complication risk.'
    ]
];

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    echo json_encode([
        'status' => 'success',
        'message' => 'Laboratory document OCR processed successfully',
        'extractedReport' => $sampleReports[0]
    ]);
    exit();
}

echo json_encode([
    'status' => 'success',
    'reports' => $sampleReports
]);
