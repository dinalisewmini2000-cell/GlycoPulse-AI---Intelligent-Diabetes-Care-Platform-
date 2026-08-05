<?php
namespace Models;

class DoctorModel extends BaseModel {
    private $patients = [
        ['id' => 'pat-101', 'name' => 'Sarah Jenkins', 'age' => 34, 'type' => 'Type 1', 'lastGlucose' => 118, 'hba1c' => 6.3, 'tirPercent' => 84, 'alertStatus' => 'Stable', 'lastVisit' => '2026-06-15', 'nextAppointment' => '2026-08-20'],
        ['id' => 'pat-102', 'name' => 'Marcus Vance', 'age' => 58, 'type' => 'Type 2', 'lastGlucose' => 195, 'hba1c' => 7.8, 'tirPercent' => 58, 'alertStatus' => 'Attention Needed (Hyperglycemia)', 'lastVisit' => '2026-05-10', 'nextAppointment' => '2026-08-08'],
        ['id' => 'pat-103', 'name' => 'Elena Rostova', 'age' => 29, 'type' => 'Gestational', 'lastGlucose' => 98, 'hba1c' => 5.9, 'tirPercent' => 91, 'alertStatus' => 'Optimal Control', 'lastVisit' => '2026-07-18', 'nextAppointment' => '2026-08-15']
    ];

    public function getPatients() {
        return $this->patients;
    }
}
