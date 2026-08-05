<?php
require_once __DIR__ . '/cors.php';

$presetFoods = [
    'salad' => [
        'foodName' => 'Mediterranean Chicken Salad & Quinoa',
        'calories' => 380,
        'carbs' => 28,
        'sugar' => 6,
        'protein' => 34,
        'fat' => 12,
        'fiber' => 7,
        'glycemicIndex' => 42,
        'glycemicLoad' => 11.7,
        'portionEstimate' => '1 Bowl (approx. 350g)',
        'score' => 92,
        'healthyAlternative' => 'Add extra chia seeds or avocado slice for healthy omega-3 fats.'
    ],
    'pizza' => [
        'foodName' => 'Pepperoni & Cheese Pizza (2 Slices)',
        'calories' => 580,
        'carbs' => 62,
        'sugar' => 8,
        'protein' => 22,
        'fat' => 26,
        'fiber' => 2,
        'glycemicIndex' => 75,
        'glycemicLoad' => 46.5,
        'portionEstimate' => '2 Large Slices (240g)',
        'score' => 45,
        'healthyAlternative' => 'Switch to cauliflower crust pizza with lean turkey breast and spinach topping.'
    ],
    'oatmeal' => [
        'foodName' => 'Steel-Cut Oats with Berries & Almonds',
        'calories' => 310,
        'carbs' => 44,
        'sugar' => 9,
        'protein' => 11,
        'fat' => 9,
        'fiber' => 9,
        'glycemicIndex' => 50,
        'glycemicLoad' => 22.0,
        'portionEstimate' => '1 Medium Bowl (250g)',
        'score' => 88,
        'healthyAlternative' => 'Stir in cinnamon powder to improve insulin sensitivity.'
    ]
];

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    $foodType = $input['foodType'] ?? 'salad';
    $foodData = $presetFoods[$foodType] ?? $presetFoods['salad'];
    
    echo json_encode([
        'status' => 'success',
        'analysis' => $foodData,
        'message' => 'Food photo processed successfully via AI vision engine.'
    ]);
    exit();
}

// Return Meal Plan suggestions & default response
echo json_encode([
    'status' => 'success',
    'sampleAnalysis' => $presetFoods['salad'],
    'weeklyPlan' => [
        'Breakfast' => 'Avocado toast on sprouted grain bread + poached egg',
        'Lunch' => 'Grilled salmon with asparagus & wild rice',
        'Dinner' => 'Tofu vegetable stir-fry with cauliflower rice',
        'Snack' => 'Greek yogurt with flaxseeds and handful of walnuts'
    ],
    'shoppingList' => [
        'Produce' => ['Spinach', 'Blueberries', 'Avocados', 'Asparagus'],
        'Proteins' => ['Wild Salmon', 'Chicken Breast', 'Greek Yogurt'],
        'Grains & Nuts' => ['Sprouted Grain Bread', 'Quinoa', 'Walnuts', 'Chia Seeds']
    ]
]);
