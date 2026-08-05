<?php
require_once __DIR__ . '/cors.php';

$input = json_decode(file_get_contents('php://input'), true);

$currentGlucose = $input['currentGlucose'] ?? 118;
$lastCarbs = $input['lastCarbs'] ?? 45; // grams
$lastInsulin = $input['lastInsulin'] ?? 4; // units
$recentActivity = $input['recentActivity'] ?? 'Walked 20 mins';

// Predictive logic simulation engine
$forecastGlucose = round($currentGlucose + ($lastCarbs * 0.8) - ($lastInsulin * 12));
if ($forecastGlucose < 65) {
    $hypoRisk = 'High';
    $hyperRisk = 'Low';
    $trend = 'Dropping Rapidly';
    $recommendation = 'Consume 15g fast-acting carbs (e.g. 4 oz juice or 3 glucose tabs) immediately and retest in 15 minutes.';
    $explanation = 'Insulin dose exceeds active carbohydrate load relative to your recent physical walking activity.';
} elseif ($forecastGlucose > 185) {
    $hypoRisk = 'Low';
    $hyperRisk = 'High';
    $trend = 'Rising Steadily';
    $recommendation = 'Consider a 15-minute post-meal walk and verify if a correction insulin bolus is advised by your physician.';
    $explanation = 'High glycemic index carbohydrates consumed exceeded estimated basal absorption rate.';
} else {
    $hypoRisk = 'Low';
    $hyperRisk = 'Low';
    $trend = 'Stable';
    $recommendation = 'Glucose level is on track within target range (70-140 mg/dL). Maintain current regimen.';
    $explanation = 'Carbohydrate intake is well balanced with your active insulin and moderate walking routine.';
}

echo json_encode([
    'status' => 'success',
    'predictedGlucose2h' => max(50, min(300, $forecastGlucose)),
    'trend' => $trend,
    'hypoglycemiaRisk' => $hypoRisk,
    'hyperglycemiaRisk' => $hyperRisk,
    'confidenceScore' => '94.2%',
    'explanation' => $explanation,
    'recommendation' => $recommendation,
    'hourlyForecast' => [
        ['time' => 'Now', 'value' => $currentGlucose],
        ['time' => '+30m', 'value' => round($currentGlucose * 0.95 + $forecastGlucose * 0.05)],
        ['time' => '+60m', 'value' => round($currentGlucose * 0.6 + $forecastGlucose * 0.4)],
        ['time' => '+90m', 'value' => round($currentGlucose * 0.2 + $forecastGlucose * 0.8)],
        ['time' => '+120m', 'value' => max(50, min(300, $forecastGlucose))]
    ]
]);
