<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/config/database.php';

use Config\Database;

$pdo = Database::getConnection();
$dbDriver = Database::getDriver();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    $userId = $input['userId'] ?? 'pat-101';
    $patientName = $input['patientName'] ?? 'Sarah Jenkins';
    $glucoseLevel = $input['glucoseLevel'] ?? 55;
    $location = $input['location'] ?? '742 Evergreen Terrace, San Francisco, CA';

    $stmt = $pdo->prepare("INSERT INTO emergency_alerts (user_id, patient_name, glucose_level, location, status) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$userId, $patientName, $glucoseLevel, $location, 'Active']);

    echo json_encode([
        'status' => 'success',
        'database' => $dbDriver,
        'message' => 'EMERGENCY SOS ACTIVATED & LOGGED TO ' . strtoupper($dbDriver) . ' DB! Alert sent via SMS & Push notification.',
        'dispatchStatus' => 'Alert sent via SMS & Push notification.',
        'simulatedLocation' => [
            'latitude' => 37.7749,
            'longitude' => -122.4194,
            'address' => $location
        ]
    ]);
    exit();
}

echo json_encode([
    'status' => 'success',
    'database' => $dbDriver,
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
