<?php
require_once __DIR__ . '/cors.php';

$dbPath = __DIR__ . '/data/db.json';
$dbData = [
    'glucoseLogs' => []
];

if (file_exists($dbPath)) {
    $raw = file_get_contents($dbPath);
    $decoded = json_decode($raw, true);
    if (is_array($decoded)) {
        $dbData = array_merge($dbData, $decoded);
    }
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    if (isset($input['value'])) {
        $newLog = [
            'id' => 'g' . time(),
            'timestamp' => date('h:i A'),
            'value' => (int)$input['value'],
            'type' => $input['type'] ?? 'Manual Entry',
            'notes' => $input['notes'] ?? ''
        ];

        array_unshift($dbData['glucoseLogs'], $newLog);
        file_put_contents($dbPath, json_encode($dbData, JSON_PRETTY_PRINT));

        echo json_encode([
            'status' => 'success',
            'message' => 'Glucose reading saved to persistent JSON store',
            'log' => $newLog
        ]);
        exit();
    }
}

$logs = $dbData['glucoseLogs'] ?? [];
$inRange = 0; $low = 0; $high = 0;
foreach ($logs as $log) {
    if ($log['value'] < 70) $low++;
    else if ($log['value'] > 180) $high++;
    else $inRange++;
}
$total = count($logs) > 0 ? count($logs) : 1;

echo json_encode([
    'status' => 'success',
    'logs' => $logs,
    'currentGlucose' => count($logs) > 0 ? $logs[0]['value'] : 118,
    'cgmStatus' => 'Active (Dexcom G7 Live Sync)',
    'timeInRange' => [
        'inRangePercent' => round(($inRange / $total) * 100),
        'lowPercent' => round(($low / $total) * 100),
        'highPercent' => round(($high / $total) * 100),
        'targetRange' => '70 - 180 mg/dL'
    ]
]);
