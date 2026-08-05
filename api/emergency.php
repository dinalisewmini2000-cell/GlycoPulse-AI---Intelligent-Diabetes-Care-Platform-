<?php
require_once __DIR__ . '/cors.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    echo json_encode([
        'status' => 'success',
        'message' => 'EMERGENCY SOS ACTIVATED! Location shared with emergency contacts and primary physician.',
        'dispatchStatus' => 'Alert sent via SMS & Push notification.',
        'simulatedLocation' => [
            'latitude' => 37.7749,
            'longitude' => -122.4194,
            'address' => '742 Evergreen Terrace, San Francisco, CA'
        ]
    ]);
    exit();
}

echo json_encode([
    'status' => 'success',
    'medicalID' => [
        'name' => 'Sarah Jenkins',
        'dob' => '1992-05-14',
        'condition' => 'Type 1 Diabetes Mellitus',
        'insulinDependent' => true,
        'bloodType' => 'O+',
        'allergies' => 'Penicillin, Peanuts',
        'primaryContact' => 'David Jenkins (+1 555 349-2011)',
        'doctorContact' => 'Dr. Robert Vance (+1 555 882-9900)'
    ]
]);
