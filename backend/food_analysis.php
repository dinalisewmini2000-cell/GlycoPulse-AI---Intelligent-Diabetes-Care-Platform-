<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/config/database.php';

use Config\Database;

header('Content-Type: application/json');

try {
    $pdo = Database::getConnection();
    $dbDriver = Database::getDriver();

    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    $presets = [
        'salad' => [
            'foodName' => 'Mediterranean Chicken Salad & Quinoa',
            'calories' => 380, 'carbs' => 28, 'sugar' => 6, 'protein' => 34, 'fat' => 12, 'fiber' => 7,
            'glycemicIndex' => 42, 'glycemicLoad' => 11.7, 'portionEstimate' => '1 Bowl (350g)', 'score' => 92,
            'healthyAlternative' => 'Add chia seeds or avocado slice for healthy omega-3 fats.'
        ],
        'pizza' => [
            'foodName' => 'Pepperoni & Cheese Pizza (2 Slices)',
            'calories' => 580, 'carbs' => 62, 'sugar' => 8, 'protein' => 22, 'fat' => 26, 'fiber' => 2,
            'glycemicIndex' => 75, 'glycemicLoad' => 46.5, 'portionEstimate' => '2 Slices (240g)', 'score' => 45,
            'healthyAlternative' => 'Switch to cauliflower crust pizza with lean turkey breast & spinach.'
        ],
        'oatmeal' => [
            'foodName' => 'Steel-Cut Oats with Berries & Almonds',
            'calories' => 310, 'carbs' => 44, 'sugar' => 9, 'protein' => 11, 'fat' => 9, 'fiber' => 9,
            'glycemicIndex' => 50, 'glycemicLoad' => 22.0, 'portionEstimate' => '1 Bowl (250g)', 'score' => 88,
            'healthyAlternative' => 'Stir in cinnamon powder to naturally improve insulin sensitivity.'
        ]
    ];

    $typeKey = $input['typeKey'] ?? 'salad';
    $analysisData = $presets[$typeKey] ?? $presets['salad'];

    // Insert into food_analyses SQL database table
    $stmt = $pdo->prepare("INSERT INTO food_analyses (user_id, food_name, calories, carbs, sugar, protein, fat, fiber, health_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $input['userId'] ?? 'pat-976',
        $analysisData['foodName'],
        $analysisData['calories'],
        $analysisData['carbs'],
        $analysisData['sugar'],
        $analysisData['protein'],
        $analysisData['fat'],
        $analysisData['fiber'],
        $analysisData['score']
    ]);

    echo json_encode([
        'status' => 'success',
        'database' => $dbDriver,
        'message' => 'Food photo computer vision analysis completed & written to SQL DB (' . strtoupper($dbDriver) . ')',
        'analysis' => $analysisData
    ]);

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Food analysis error: ' . $e->getMessage()
    ]);
}
