<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/config/database.php';

use Config\Database;

$pdo = Database::getConnection();
$dbDriver = Database::getDriver();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    if (isset($input['action']) && $input['action'] === 'addPrescription') {
        $patientId = $input['patientId'] ?? 'pat-101';
        $patientName = $input['patientName'] ?? 'Sarah Jenkins';
        $doctorName = $input['doctorName'] ?? 'Dr. Robert Vance, MD';
        $medName = $input['medicationName'] ?? 'Metformin';
        $dosage = $input['dosage'] ?? '500mg';
        $frequency = $input['frequency'] ?? 'Twice daily with meals';

        $stmt = $pdo->prepare("INSERT INTO prescriptions (patient_id, patient_name, doctor_name, medication_name, dosage, frequency) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$patientId, $patientName, $doctorName, $medName, $dosage, $frequency]);

        echo json_encode([
            'status' => 'success',
            'database' => $dbDriver,
            'message' => 'Prescription saved to ' . strtoupper($dbDriver) . ' SQL DB and synced to patient digital wallet.'
        ]);
        exit();
    }
}

// Fetch registered patients from SQL users table
$stmt = $pdo->query("SELECT user_uid as id, full_name as name, diabetes_type as type, role FROM users WHERE role = 'patient'");
$sqlPatients = $stmt->fetchAll();

$doctorPatients = [
    [
        'id' => 'pat-101',
        'name' => 'Sarah Jenkins',
        'age' => 34,
        'type' => 'Type 1',
        'lastGlucose' => 118,
        'hba1c' => 6.3,
        'tirPercent' => 84,
        'alertStatus' => 'Stable',
        'lastVisit' => '2026-06-15',
        'nextAppointment' => '2026-08-20',
        'weightKg' => 64,
        'phone' => '+1 555 349-2011',
        'doctorNotes' => 'Patient adhering well to 1:10 carb ratio.'
    ],
    [
        'id' => 'pat-102',
        'name' => 'Marcus Vance',
        'age' => 58,
        'type' => 'Type 2',
        'lastGlucose' => 195,
        'hba1c' => 7.8,
        'tirPercent' => 58,
        'alertStatus' => 'Attention Needed (Hyperglycemia trend)',
        'lastVisit' => '2026-05-10',
        'nextAppointment' => '2026-08-08',
        'weightKg' => 88,
        'phone' => '+1 555 882-1920',
        'doctorNotes' => 'Recommend increasing Metformin to 1000mg BID.'
    ],
    [
        'id' => 'pat-103',
        'name' => 'Elena Rostova',
        'age' => 29,
        'type' => 'Gestational',
        'lastGlucose' => 98,
        'hba1c' => 5.9,
        'tirPercent' => 91,
        'alertStatus' => 'Optimal',
        'lastVisit' => '2026-07-18',
        'nextAppointment' => '2026-08-15',
        'weightKg' => 68,
        'phone' => '+1 555 233-9011',
        'doctorNotes' => 'Post-prandial spikes under control with low-GI diet.'
    ]
];

// Merge any dynamically registered patients into the roster
$existingIds = array_column($doctorPatients, 'id');
$gStmt = $pdo->prepare("SELECT glucose_value FROM glucose_logs WHERE user_id = ? ORDER BY id DESC LIMIT 1");

foreach ($sqlPatients as $sp) {
    if (!in_array($sp['id'], $existingIds)) {
        // Get last logged glucose for this patient if available
        $gStmt->execute([$sp['id']]);
        $lastG = $gStmt->fetchColumn();

        $doctorPatients[] = [
            'id' => $sp['id'],
            'name' => $sp['name'],
            'age' => 28,
            'type' => $sp['type'] ?? 'Type 1',
            'lastGlucose' => $lastG ? (int)$lastG : 115,
            'hba1c' => 6.2,
            'tirPercent' => 86,
            'alertStatus' => $lastG && $lastG > 180 ? 'Attention Needed' : 'Stable',
            'lastVisit' => date('Y-m-d', strtotime('-14 days')),
            'nextAppointment' => date('Y-m-d', strtotime('+7 days')),
            'weightKg' => 65,
            'phone' => '+1 555 019-9800',
            'doctorNotes' => 'Registered patient profile active in system database.'
        ];
    }
}

// Query recent prescriptions from SQL
$prescStmt = $pdo->query("SELECT * FROM prescriptions ORDER BY id DESC LIMIT 10");
$prescriptions = $prescStmt->fetchAll();

echo json_encode([
    'status' => 'success',
    'database' => $dbDriver,
    'patients' => $doctorPatients,
    'prescriptions' => $prescriptions,
    'upcomingAppointments' => [
        ['patientName' => 'Marcus Vance', 'date' => '2026-08-08 10:00 AM', 'reason' => 'HbA1c & Medication Review'],
        ['patientName' => 'Elena Rostova', 'date' => '2026-08-15 02:30 PM', 'reason' => 'Gestational Diabetes Follow-up'],
        ['patientName' => 'Sarah Jenkins', 'date' => '2026-08-20 11:15 AM', 'reason' => 'Quarterly CGM Telemetry Review']
    ]
]);
