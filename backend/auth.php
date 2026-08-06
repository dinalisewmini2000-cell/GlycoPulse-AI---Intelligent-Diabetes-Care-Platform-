<?php
require_once __DIR__ . '/cors.php';

$users = [
    [
        'id' => 'pat-101',
        'email' => 'patient@glucocare.ai',
        'password' => 'patient123',
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
        'password' => 'doctor123',
        'name' => 'Dr. Robert Vance, MD',
        'role' => 'doctor',
        'specialty' => 'Endocrinology & Diabetology',
        'patientsCount' => 48,
        'hospital' => 'Metro Health Medical Center'
    ],
    [
        'id' => 'cg-301',
        'email' => 'caregiver@glucocare.ai',
        'password' => 'caregiver123',
        'name' => 'David Jenkins',
        'role' => 'caregiver',
        'linkedPatient' => 'Sarah Jenkins',
        'relationship' => 'Spouse'
    ],
    [
        'id' => 'adm-401',
        'email' => 'admin@glucocare.ai',
        'password' => 'admin123',
        'name' => 'System Administrator',
        'role' => 'admin'
    ]
];

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    $action = isset($_GET['action']) ? $_GET['action'] : ($input['action'] ?? 'login');
    
    if ($action === 'signup' || $action === 'register') {
        $name = trim($input['name'] ?? 'New User');
        $email = trim($input['email'] ?? 'user@glycopulse.ai');
        $role = trim($input['role'] ?? 'patient');
        $diabetesType = trim($input['diabetesType'] ?? 'Type 2');
        $specialty = trim($input['specialty'] ?? 'Endocrinology');
        
        $newUser = [
            'id' => substr($role, 0, 3) . '-' . rand(100, 999),
            'name' => $name,
            'email' => $email,
            'role' => $role,
            'diabetesType' => $diabetesType,
            'specialty' => $specialty,
            'createdAt' => date('Y-m-d H:i:s')
        ];
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Account created successfully for ' . $name,
            'token' => 'jwt_token_' . md5($email . time()),
            'user' => $newUser
        ]);
        exit();
    }

    if ($action === 'login') {
        $email = trim($input['email'] ?? '');
        $password = trim($input['password'] ?? '');
        $role = trim($input['role'] ?? 'patient');
        
        $foundUser = null;
        foreach ($users as $u) {
            if ($u['role'] === $role && (strtolower($u['email']) === strtolower($email) || empty($email))) {
                $foundUser = $u;
                break;
            }
        }
        
        if (!$foundUser) {
            foreach ($users as $u) {
                if ($u['role'] === $role) {
                    $foundUser = $u;
                    break;
                }
            }
        }

        if (!$foundUser) {
            $foundUser = $users[0];
        }

        // Strip password before returning user object
        $userResponse = $foundUser;
        unset($userResponse['password']);
        
        echo json_encode([
            'status' => 'success',
            'message' => ucfirst($foundUser['role']) . ' authenticated successfully',
            'token' => 'jwt_token_' . md5($foundUser['email'] . time()),
            'user' => $userResponse
        ]);
        exit();
    }
}


echo json_encode([
    'status' => 'success',
    'users' => array_map(function($u) { unset($u['password']); return $u; }, $users)
]);

