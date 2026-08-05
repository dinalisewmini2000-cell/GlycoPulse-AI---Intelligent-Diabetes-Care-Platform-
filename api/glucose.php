<?php
require_once __DIR__ . '/cors.php';

$glucoseLogs = [
    ['id' => 'g1', 'timestamp' => '2026-08-05 07:30', 'value' => 112, 'type' => 'Fasting', 'notes' => 'Woke up feeling fresh'],
    ['id' => 'g2', 'timestamp' => '2026-08-05 08:30', 'value' => 145, 'type' => 'After Meal', 'notes' => 'Oatmeal & berries'],
    ['id' => 'g3', 'timestamp' => '2026-08-05 12:15', 'value' => 108, 'type' => 'Before Meal', 'notes' => 'Pre-lunch check'],
    ['id' => 'g4', 'timestamp' => '2026-08-05 13:45', 'value' => 162, 'type' => 'After Meal', 'notes' => 'Grilled chicken salad + quinoa'],
    ['id' => 'g5', 'timestamp' => '2026-08-05 17:00', 'value' => 125, 'type' => 'Before Meal', 'notes' => 'After afternoon walk'],
    ['id' => 'g6', 'timestamp' => '2026-08-05 21:00', 'value' => 118, 'type' => 'Bedtime', 'notes' => 'Target achieved']
];

$hba1cRecords = [
    ['date' => '2026-01-15', 'value' => 6.8],
    ['date' => '2026-04-10', 'value' => 6.5],
    ['date' => '2026-07-20', 'value' => 6.3]
];

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    if (isset($input['value'])) {
        $newLog = [
            'id' => 'g' . time(),
            'timestamp' => date('Y-m-d H:i'),
            'value' => (int)$input['value'],
            'type' => $input['type'] ?? 'Manual Check',
            'notes' => $input['notes'] ?? ''
        ];
        echo json_encode([
            'status' => 'success',
            'message' => 'Glucose reading recorded successfully',
            'log' => $newLog
        ]);
        exit();
    }
}

// Calculate Time In Range statistics
$inRange = 0; $low = 0; $high = 0;
foreach ($glucoseLogs as $log) {
    if ($log['value'] < 70) $low++;
    else if ($log['value'] > 180) $high++;
    else $inRange++;
}
$total = count($glucoseLogs);

echo json_encode([
    'status' => 'success',
    'logs' => $glucoseLogs,
    'hba1c' => $hba1cRecords,
    'currentGlucose' => 118,
    'cgmStatus' => 'Active (Dexcom G7 Mock Sync)',
    'timeInRange' => [
        'inRangePercent' => round(($inRange / $total) * 100),
        'lowPercent' => round(($low / $total) * 100),
        'highPercent' => round(($high / $total) * 100),
        'targetRange' => '70 - 180 mg/dL'
    ]
]);
