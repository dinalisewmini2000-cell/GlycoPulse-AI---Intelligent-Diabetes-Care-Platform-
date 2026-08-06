<?php
require_once __DIR__ . '/cors.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    echo json_encode([
        'status' => 'success',
        'message' => 'Caregiver action processed successfully.'
    ]);
    exit();
}

echo json_encode([
    'status' => 'success',
    'patientSummary' => [
        'patientName' => 'Sarah Jenkins',
        'relationship' => 'Spouse',
        'currentGlucose' => 118,
        'statusText' => 'Normal & Active',
        'lastLogged' => '12 mins ago (Bedtime Check)',
        'medicationAdherence' => '100% (3/3 doses taken today)',
        'waterIntake' => '2.2L / 2.5L Goal',
        'cgmSignal' => 'Strong (Dexcom G7)'
    ],
    'alertsHistory' => [
        ['time' => 'Today 07:30 AM', 'level' => 'Info', 'msg' => 'Fasting glucose logged: 112 mg/dL'],
        ['time' => 'Yesterday 10:15 PM', 'level' => 'Success', 'msg' => 'Night Lantus insulin dose confirmed taken.'],
        ['time' => 'Yesterday 04:30 PM', 'level' => 'Warning', 'msg' => 'Mild post-lunch spike: 168 mg/dL']
    ]
]);
