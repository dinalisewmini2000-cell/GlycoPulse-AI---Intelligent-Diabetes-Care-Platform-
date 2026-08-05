<?php
namespace Models;

class GlucoseModel extends BaseModel {
    private $logs = [
        ['id' => 'g1', 'timestamp' => '07:30 AM', 'value' => 112, 'type' => 'Fasting', 'notes' => 'Woke up feeling fresh'],
        ['id' => 'g2', 'timestamp' => '08:30 AM', 'value' => 145, 'type' => 'After Meal', 'notes' => 'Oatmeal & berries'],
        ['id' => 'g3', 'timestamp' => '12:15 PM', 'value' => 108, 'type' => 'Before Meal', 'notes' => 'Pre-lunch check'],
        ['id' => 'g4', 'timestamp' => '01:45 PM', 'value' => 162, 'type' => 'After Meal', 'notes' => 'Grilled chicken salad + quinoa'],
        ['id' => 'g5', 'timestamp' => '05:00 PM', 'value' => 125, 'type' => 'Before Meal', 'notes' => 'After afternoon walk'],
        ['id' => 'g6', 'timestamp' => '09:00 PM', 'value' => 118, 'type' => 'Bedtime', 'notes' => 'Target achieved']
    ];

    public function getGlucoseLogs() {
        return $this->logs;
    }

    public function addLog($value, $type, $notes) {
        $newLog = [
            'id' => 'g' . time(),
            'timestamp' => date('h:i A'),
            'value' => (int)$value,
            'type' => $type ?: 'Manual Entry',
            'notes' => $notes ?: ''
        ];
        array_unshift($this->logs, $newLog);
        return $newLog;
    }

    public function calculateTimeInRange() {
        $inRange = 0; $low = 0; $high = 0;
        foreach ($this->logs as $l) {
            if ($l['value'] < 70) $low++;
            else if ($l['value'] > 180) $high++;
            else $inRange++;
        }
        $total = count($this->logs);
        return [
            'inRangePercent' => round(($inRange / $total) * 100),
            'lowPercent' => round(($low / $total) * 100),
            'highPercent' => round(($high / $total) * 100),
            'targetRange' => '70 - 180 mg/dL'
        ];
    }
}
