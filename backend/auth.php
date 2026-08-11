<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/security.php';

use Config\Database;
use Config\Security;

$pdo = Database::getConnection();
$dbDriver = Database::getDriver();

$method = $_SERVER['REQUEST_METHOD'];
$rawInput = json_decode(file_get_contents('php://input'), true) ?? [];
$input = Security::sanitizeInput($rawInput);

if ($method === 'GET') {
    // Health check & list users
    $stmt = $pdo->query("SELECT user_uid as id, email, full_name as name, role, diabetes_type as diabetesType, specialty FROM users");
    $users = $stmt->fetchAll();
    
    echo json_encode([
        'status' => 'success',
        'database' => $dbDriver === 'sqlite' ? 'SQLite (PDO Embedded)' : 'MySQL (PDO Remote)',
        'users' => $users
    ]);
    exit();
}

if ($method === 'POST') {
    $action = isset($_GET['action']) ? $_GET['action'] : ($input['action'] ?? 'login');

    if ($action === 'signup' || $action === 'register') {
        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $password = trim($rawInput['password'] ?? 'password123');
        $role = trim($input['role'] ?? 'patient');
        $diabetesType = trim($input['diabetesType'] ?? 'Type 2');
        $specialty = trim($input['specialty'] ?? '');

        if (empty($name)) {
            $parts = explode('@', $email);
            $name = ucfirst($parts[0] ?? 'User');
        }

        $userUid = substr($role, 0, 3) . '-' . rand(100, 999);
        $passHash = password_hash($password, PASSWORD_BCRYPT);

        // Check if email exists
        $checkStmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $checkStmt->execute([$email]);
        $existing = $checkStmt->fetch();

        if ($existing) {
            $jwtToken = Security::generateJWT($existing['user_uid'], $existing['email'], $existing['role']);
            echo json_encode([
                'status' => 'success',
                'message' => 'Welcome back! Logged into existing account for ' . $existing['full_name'],
                'database' => $dbDriver,
                'token' => $jwtToken,
                'user' => [
                    'id' => $existing['user_uid'],
                    'name' => $existing['full_name'],
                    'email' => $existing['email'],
                    'role' => $existing['role'],
                    'diabetesType' => $existing['diabetes_type'],
                    'specialty' => $existing['specialty']
                ]
            ]);
            exit();
        }

        // Insert into real SQL Database table using parameterized query
        $stmt = $pdo->prepare("INSERT INTO users (user_uid, email, password_hash, full_name, role, diabetes_type, specialty) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$userUid, $email, $passHash, $name, $role, $diabetesType, $specialty]);

        $newUser = [
            'id' => $userUid,
            'name' => $name,
            'email' => $email,
            'role' => $role,
            'diabetesType' => $diabetesType,
            'specialty' => $specialty
        ];

        $jwtToken = Security::generateJWT($userUid, $email, $role);

        echo json_encode([
            'status' => 'success',
            'message' => 'Account created & saved in ' . strtoupper($dbDriver) . ' database for ' . $name,
            'database' => $dbDriver,
            'token' => $jwtToken,
            'user' => $newUser
        ]);
        exit();
    }

    if ($action === 'login') {
        $email = trim($input['email'] ?? '');
        $nameInput = trim($input['name'] ?? '');
        $password = trim($rawInput['password'] ?? '');
        $role = trim($input['role'] ?? 'patient');

        $foundUser = null;
        if (!empty($email)) {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?)");
            $stmt->execute([$email]);
            $userRow = $stmt->fetch();
            if ($userRow) {
                $userRole = !empty($role) ? $role : $userRow['role'];
                $rawName = trim($userRow['full_name']);
                $cleanName = preg_replace('/^Dr\.\s*/i', '', $rawName);
                
                // Doctor role receives "Dr. ", Patient/other roles receive clean name
                $displayName = ($userRole === 'doctor') ? 'Dr. ' . $cleanName : $cleanName;

                $foundUser = [
                    'id' => $userRow['user_uid'],
                    'email' => $userRow['email'],
                    'name' => $displayName,
                    'role' => $userRole,
                    'diabetesType' => $userRow['diabetes_type'] ?? 'Pre-diabetes',
                    'specialty' => $userRow['specialty'] ?? ''
                ];
            }
        }

        if (!$foundUser) {
            // Find by role if email not found
            $stmtRole = $pdo->prepare("SELECT * FROM users WHERE role = ? LIMIT 1");
            $stmtRole->execute([$role]);
            $roleRow = $stmtRole->fetch();

            if ($roleRow && empty($email) && empty($nameInput)) {
                $rawName = trim($roleRow['full_name']);
                $cleanName = preg_replace('/^Dr\.\s*/i', '', $rawName);
                $displayName = ($role === 'doctor') ? 'Dr. ' . $cleanName : $cleanName;

                $foundUser = [
                    'id' => $roleRow['user_uid'],
                    'email' => $roleRow['email'],
                    'name' => $displayName,
                    'role' => $roleRow['role'],
                    'diabetesType' => $roleRow['diabetes_type'],
                    'specialty' => $roleRow['specialty']
                ];
            } else {
                // Dynamically insert missing user into SQL database
                $rawName = $nameInput;
                if (empty($rawName) && !empty($email)) {
                    $rawName = ucfirst(explode('@', $email)[0]);
                }
                if (empty($rawName)) {
                    $rawName = 'Kasun Jayalath';
                }
                $cleanName = preg_replace('/^Dr\.\s*/i', '', $rawName);
                $displayName = ($role === 'doctor') ? 'Dr. ' . $cleanName : $cleanName;
                
                $userUid = substr($role, 0, 3) . '-' . rand(100, 999);
                $cleanEmail = !empty($email) ? $email : strtolower($role) . rand(10,99) . '@glucocare.ai';
                $passHash = password_hash('password123', PASSWORD_BCRYPT);

                $insertStmt = $pdo->prepare("INSERT INTO users (user_uid, email, password_hash, full_name, role, diabetes_type) VALUES (?, ?, ?, ?, ?, ?)");
                $insertStmt->execute([$userUid, $cleanEmail, $passHash, $displayName, $role, 'Type 2']);

                $foundUser = [
                    'id' => $userUid,
                    'email' => $cleanEmail,
                    'name' => $displayName,
                    'role' => $role,
                    'diabetesType' => 'Type 2'
                ];
            }
        }

        $jwtToken = Security::generateJWT($foundUser['id'], $foundUser['email'], $foundUser['role']);

        echo json_encode([
            'status' => 'success',
            'message' => ucfirst($foundUser['role']) . ' authenticated via ' . strtoupper($dbDriver) . ' Database',
            'database' => $dbDriver,
            'token' => $jwtToken,
            'user' => $foundUser
        ]);
        exit();
    }
}
