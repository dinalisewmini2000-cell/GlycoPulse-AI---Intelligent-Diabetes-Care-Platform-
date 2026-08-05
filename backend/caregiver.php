<?php
require_once __DIR__ . '/cors.php';

echo json_encode([
    'status' => 'success',
    'patientSummary' => [
        'patientName' => 'Sarah Jenkins',
        'relationship' => 'Spouse',
        'currentGlucose' => 118,
        'statusText' => 'Normal & Active',
        'lastLogged' => '12 mins ago (Bedtime Check)',
        'medicationAdherence' => '100% (3/3 doses taken today)',
        'waterIntake' => '2.2L / 2.5L Goal'
    ],
    'alertsHistory' => [
        ['time' => 'Today 07:30 AM', 'level' => 'Info', 'msg' => 'Fasting glucose logged: 112 mg/dL'],
        ['time' => 'Yesterday 10:15 PM', 'level' => 'Success', 'msg' => 'Night Lantus insulin dose confirmed taken.']
    ]
]);
