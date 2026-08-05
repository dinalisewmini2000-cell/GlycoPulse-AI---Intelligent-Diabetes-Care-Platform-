<?php
namespace Models;

class FoodAnalysisModel extends BaseModel {
    private $presets = [
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
            'healthyAlternative' => 'Switch to cauliflower crust pizza with lean turkey breast and spinach.'
        ],
        'oatmeal' => [
            'foodName' => 'Steel-Cut Oats with Berries & Almonds',
            'calories' => 310, 'carbs' => 44, 'sugar' => 9, 'protein' => 11, 'fat' => 9, 'fiber' => 9,
            'glycemicIndex' => 50, 'glycemicLoad' => 22.0, 'portionEstimate' => '1 Bowl (250g)', 'score' => 88,
            'healthyAlternative' => 'Stir in cinnamon powder to naturally improve insulin sensitivity.'
        ]
    ];

    public function analyzeByPreset($key) {
        return $this->presets[$key] ?? $this->presets['salad'];
    }

    public function getWeeklyMealPlan() {
        return [
            'Breakfast' => 'Avocado toast on sprouted grain bread + poached egg',
            'Lunch' => 'Grilled salmon with asparagus & wild rice',
            'Dinner' => 'Tofu vegetable stir-fry with cauliflower rice',
            'Snack' => 'Greek yogurt with flaxseeds and handful of walnuts'
        ];
    }
}
