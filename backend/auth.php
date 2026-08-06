<?php
require_once __DIR__ . '/cors.php';

$dbPath = __DIR__ . '/data/db.json';
$defaultUsers = [
    [
        'id' => 'pat-101',
        'email' => 'patient@glucocare.ai',
        'name' => 'Sarah Jenkins',
        'role' => 'patient',
        'diabetesType' => 'Type 1'
    ],
    [
        'id' => 'doc-201',
        'email' => 'doctor@glucocare.ai',
        'name' => 'Dr. Robert Vance, MD',
        'role' => 'doctor',
        'specialty' => 'Endocrinology & Diabetology'
    ],
    [
        'id' => 'cg-301',
        'email' => 'caregiver@glucocare.ai',
        'name' => 'David Jenkins',
        'role' => 'caregiver'
    ],
    [
        'id' => 'adm-401',
        'email' => 'admin@glucocare.ai',
        'name' => 'System Administrator',
        'role' => 'admin'
    ]
];

$dbData = ['users' => $defaultUsers];
if (file_exists($dbPath)) {
    $raw = file_get_contents($dbPath);
    $decoded = json_decode($raw, true);
    if (is_array($decoded) && isset($decoded['users']) && is_array($decoded['users'])) {
        $dbData['users'] = $decoded['users'];
    }
}

$users = $dbData['users'];
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    $action = isset($_GET['action']) ? $_GET['action'] : ($input['action'] ?? 'login');
    
    if ($action === 'signup' || $action === 'register') {
        $name = trim($input['name'] ?? '');
        if (empty($name)) {
            $parts = explode('@', $input['email'] ?? 'user');
            $name = ucfirst($parts[0]);
        }
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

        // Add to persistent db.json
        array_unshift($dbData['users'], $newUser);
        file_put_contents($dbPath, json_encode($dbData, JSON_PRETTY_PRINT));
        
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
        $nameInput = trim($input['name'] ?? '');
        $password = trim($input['password'] ?? '');
        $role = trim($input['role'] ?? 'patient');
        
        $foundUser = null;
        if (!empty($email)) {
            foreach ($users as $u) {
                if (strtolower($u['email']) === strtolower($email)) {
                    $foundUser = $u;
                    break;
                }
            }
        }
        
        if (!$foundUser) {
            // If custom email or name entered, construct dynamic user object
            $displayName = $nameInput;
            if (empty($displayName) && !empty($email)) {
                $emailPrefix = explode('@', $email)[0];
                $displayName = ucfirst(str_replace(['.', '_', '-'], ' ', $emailPrefix));
            }
            if (empty($displayName)) {
                $displayName = $role === 'doctor' ? 'Dr. Medical Provider' : ($role === 'admin' ? 'System Admin' : 'Registered Patient');
            }

            $foundUser = [
                'id' => substr($role, 0, 3) . '-' . rand(100, 999),
                'email' => !empty($email) ? $email : strtolower($role) . '@glucocare.ai',
                'name' => $displayName,
                'role' => $role,
                'diabetesType' => 'Type 2'
            ];

            // Persist new user login
            $dbData['users'][] = $foundUser;
            file_put_contents($dbPath, json_encode($dbData, JSON_PRETTY_PRINT));
        }

        echo json_encode([
            'status' => 'success',
            'message' => ucfirst($foundUser['role']) . ' authenticated successfully',
            'token' => 'jwt_token_' . md5($foundUser['email'] . time()),
            'user' => $foundUser
        ]);
        exit();
    }
}

echo json_encode([
    'status' => 'success',
    'users' => $users
]);
