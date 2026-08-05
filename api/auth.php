<?php
require_once __DIR__ . '/cors.php';

$users = [
    [
        'id' => 'pat-101',
        'email' => 'patient@glucocare.ai',
        'name' => 'Sarah Jenkins',
        'role' => 'patient',
        'diabetesType' => 'Type 1',
        'diagnosisDate' => '2019-04-12',
        'heightCm' => 168,
        'weightKg' => 64,
        'bmi' => 22.7,
        'bloodGroup' => 'O+',
        'allergies' => ['Penicillin', 'Peanuts'],
        'medications' => ['Novolog (Rapid)', 'Lantus (Basal)', 'Metformin 500mg'],
        'emergencyContact' => [
            'name' => 'David Jenkins',
            'relation' => 'Spouse',
            'phone' => '+1 (555) 349-2011'
        ],
        'doctor' => 'Dr. Robert Vance, MD'
    ],
    [
        'id' => 'doc-201',
        'email' => 'doctor@glucocare.ai',
        'name' => 'Dr. Robert Vance, MD',
        'role' => 'doctor',
        'specialty' => 'Endocrinology & Diabetology',
        'patientsCount' => 48,
        'hospital' => 'Metro Health Medical Center'
    ],
    [
        'id' => 'cg-301',
        'email' => 'caregiver@glucocare.ai',
        'name' => 'David Jenkins',
        'role' => 'caregiver',
        'linkedPatient' => 'Sarah Jenkins',
        'relationship' => 'Spouse'
    ],
    [
        'id' => 'adm-401',
        'email' => 'admin@glucocare.ai',
        'name' => 'System Administrator',
        'role' => 'admin'
    ]
];

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    $action = isset($_GET['action']) ? $_GET['action'] : ($input['action'] ?? 'login');
    
    if ($action === 'login') {
        $email = $input['email'] ?? '';
        $role = $input['role'] ?? 'patient';
        
        $foundUser = null;
        foreach ($users as $u) {
            if ($u['role'] === $role || $u['email'] === $email) {
                $foundUser = $u;
                break;
            }
        }
        
        if (!$foundUser) {
            $foundUser = $users[0];
        }
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Logged in successfully',
            'token' => 'jwt_mock_token_' . md5($foundUser['email']),
            'user' => $foundUser
        ]);
        exit();
    }
}

echo json_encode([
    'status' => 'success',
    'users' => $users
]);
