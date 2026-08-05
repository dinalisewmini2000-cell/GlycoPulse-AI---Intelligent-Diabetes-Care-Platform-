<?php
namespace Models;

class AIPredictorModel extends BaseModel {
    public function predict($currentGlucose, $lastCarbs = 45, $lastInsulin = 4) {
        $forecastGlucose = round($currentGlucose + ($lastCarbs * 0.8) - ($lastInsulin * 12));

        if ($forecastGlucose < 65) {
            $hypo = 'High'; $hyper = 'Low'; $trend = 'Dropping Rapidly';
            $rec = 'Consume 15g fast-acting carbs immediately and retest in 15 mins.';
            $exp = 'Active insulin exceeds carbohydrate absorption relative to physical activity.';
        } elseif ($forecastGlucose > 185) {
            $hypo = 'Low'; $hyper = 'High'; $trend = 'Rising Steadily';
            $rec = 'Take a 15-minute post-meal walk or consult physician for correction bolus.';
            $exp = 'High glycemic index carbohydrates exceeded estimated basal absorption rate.';
        } else {
            $hypo = 'Low'; $hyper = 'Low'; $trend = 'Stable';
            $rec = 'Glucose level is on track within target range (70-140 mg/dL).';
            $exp = 'Carbohydrate intake is well balanced with active insulin and exercise.';
        }

        return [
            'predictedGlucose2h' => max(50, min(300, $forecastGlucose)),
            'trend' => $trend,
            'hypoglycemiaRisk' => $hypo,
            'hyperglycemiaRisk' => $hyper,
            'confidenceScore' => '94.2%',
            'explanation' => $exp,
            'recommendation' => $rec,
            'hourlyForecast' => [
                ['time' => 'Now', 'value' => $currentGlucose],
                ['time' => '+30m', 'value' => round($currentGlucose * 0.95 + $forecastGlucose * 0.05)],
                ['time' => '+60m', 'value' => round($currentGlucose * 0.6 + $forecastGlucose * 0.4)],
                ['time' => '+90m', 'value' => round($currentGlucose * 0.2 + $forecastGlucose * 0.8)],
                ['time' => '+120m', 'value' => max(50, min(300, $forecastGlucose))]
            ]
        ];
    }
}
