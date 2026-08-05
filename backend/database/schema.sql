-- GlycoPulse AI Database Schema Definition
-- Supports Patients, Doctors, Caregivers, Administrators, Glucose Records, AI Models, Food Analyses, Lab Reports, Complications, and Prescriptions

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_uid VARCHAR(64) NOT NULL UNIQUE,
    email VARCHAR(128) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    role ENUM('patient', 'doctor', 'caregiver', 'admin') NOT NULL DEFAULT 'patient',
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patient_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    diabetes_type ENUM('Type 1', 'Type 2', 'Gestational', 'Prediabetes') DEFAULT 'Type 1',
    diagnosis_date DATE,
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    bmi DECIMAL(4,2),
    blood_group VARCHAR(5),
    allergies TEXT,
    medications TEXT,
    emergency_contact_name VARCHAR(128),
    emergency_contact_phone VARCHAR(32),
    attending_doctor_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS glucose_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    glucose_value INT NOT NULL,
    category ENUM('Fasting', 'Before Meal', 'After Meal', 'Bedtime', 'Night', 'Manual Entry', 'CGM Auto Sync') NOT NULL,
    notes TEXT,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS hba1c_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    hba1c_value DECIMAL(3,1) NOT NULL,
    test_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS food_analyses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    food_name VARCHAR(255) NOT NULL,
    calories INT,
    carbs_g DECIMAL(5,1),
    sugar_g DECIMAL(5,1),
    protein_g DECIMAL(5,1),
    fat_g DECIMAL(5,1),
    fiber_g DECIMAL(5,1),
    glycemic_index INT,
    glycemic_load DECIMAL(5,1),
    health_score INT,
    healthy_alternative TEXT,
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lab_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    lab_name VARCHAR(128),
    report_date DATE,
    raw_ocr_text TEXT,
    ai_summary TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS prescriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    medication_name VARCHAR(128) NOT NULL,
    dosage VARCHAR(128) NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS emergency_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    address VARCHAR(255),
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
