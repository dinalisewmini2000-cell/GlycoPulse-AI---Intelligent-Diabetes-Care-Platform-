<?php
namespace Models;

class UserModel extends BaseModel {
    private $users = [
        [
            'id' => 101,
            'user_uid' => 'pat-101',
            'email' => 'patient@glucocare.ai',
            'full_name' => 'Sarah Jenkins',
            'role' => 'patient',
            'diabetes_type' => 'Type 1',
            'diagnosis_date' => '2019-04-12',
            'height_cm' => 168,
            'weight_kg' => 64,
            'bmi' => 22.7,
            'blood_group' => 'O+',
            'allergies' => ['Penicillin', 'Peanuts'],
            'medications' => ['Novolog (Rapid)', 'Lantus (Basal)', 'Metformin 500mg'],
            'emergency_contact' => ['name' => 'David Jenkins', 'phone' => '+1 (555) 349-2011']
        ],
        [
            'id' => 201,
            'user_uid' => 'doc-201',
            'email' => 'doctor@glucocare.ai',
            'full_name' => 'Dr. Robert Vance, MD',
            'role' => 'doctor',
            'specialty' => 'Endocrinology & Diabetology',
            'patients_count' => 48,
            'hospital' => 'Metro Health Medical Center'
        ],
        [
            'id' => 301,
            'user_uid' => 'cg-301',
            'email' => 'caregiver@glucocare.ai',
            'full_name' => 'David Jenkins',
            'role' => 'caregiver',
            'linked_patient' => 'Sarah Jenkins',
            'relationship' => 'Spouse'
        ],
        [
            'id' => 401,
            'user_uid' => 'adm-401',
            'email' => 'admin@glucocare.ai',
            'full_name' => 'System Administrator',
            'role' => 'admin'
        ]
    ];

    public function findByEmailOrRole($email, $role) {
        foreach ($this->users as $u) {
            if ($u['role'] === $role || $u['email'] === $email) {
                return $u;
            }
        }
        return $this->users[0];
    }

    public function getAllUsers() {
        return $this->users;
    }
}
