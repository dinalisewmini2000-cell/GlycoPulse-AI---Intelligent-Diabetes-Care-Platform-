<?php
require_once __DIR__ . '/cors.php';

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

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    if (isset($input['action']) && $input['action'] === 'addPrescription') {
        echo json_encode([
            'status' => 'success',
            'message' => 'Prescription updated and sent to patient digital health wallet.'
        ]);
        exit();
    }

    if (isset($input['action']) && $input['action'] === 'addAppointment') {
        echo json_encode([
            'status' => 'success',
            'message' => 'Appointment scheduled and HD Tele-Health video link generated.'
        ]);
        exit();
    }
}

echo json_encode([
    'status' => 'success',
    'patients' => $doctorPatients,
    'upcomingAppointments' => [
        ['patientName' => 'Marcus Vance', 'date' => '2026-08-08 10:00 AM', 'reason' => 'HbA1c & Medication Review'],
        ['patientName' => 'Elena Rostova', 'date' => '2026-08-15 02:30 PM', 'reason' => 'Gestational Diabetes Follow-up'],
        ['patientName' => 'Sarah Jenkins', 'date' => '2026-08-20 11:15 AM', 'reason' => 'Quarterly CGM Telemetry Review']
    ]
]);
