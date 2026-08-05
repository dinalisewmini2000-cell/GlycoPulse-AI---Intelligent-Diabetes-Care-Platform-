<?php
use Controllers\AuthController;
use Controllers\GlucoseController;
use Controllers\AIPredictionController;

// Simple Autoloader for Classes
spl_autoload_register(function ($class) {
    $path = __DIR__ . '/../' . str_replace('\\', '/', $class) . '.php';
    if (file_exists($path)) {
        require_once $path;
    }
});

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true) ?? [];

// Dispatcher logic matching URI or existing fallback endpoint files
if (strpos($uri, 'auth') !== false) {
    $auth = new AuthController();
    if ($method === 'POST') $auth->login($input);
    else $auth->getUsers();
    exit();
}

if (strpos($uri, 'glucose') !== false) {
    $glucose = new GlucoseController();
    if ($method === 'POST') $glucose->createLog($input);
    else $glucose->getLogs();
    exit();
}

if (strpos($uri, 'ai_predict') !== false) {
    $ai = new AIPredictionController();
    $ai->handlePrediction($input);
    exit();
}
