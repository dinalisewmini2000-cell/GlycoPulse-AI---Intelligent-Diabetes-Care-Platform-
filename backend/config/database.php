<?php
namespace Config;

use PDO;
use PDOException;

class Database {
    private static $host = '127.0.0.1';
    private static $db_name = 'glycopulse_db';
    private static $username = 'root';
    private static $password = '';
    private static $conn = null;
    private static $driver = 'mysql';

    public static function getConnection() {
        if (self::$conn === null) {
            // First try MySQL PDO connection
            try {
                self::$conn = new PDO(
                    "mysql:host=" . self::$host . ";charset=utf8mb4",
                    self::$username,
                    self::$password,
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                    ]
                );
                // Create MySQL DB if not exists
                self::$conn->exec("CREATE DATABASE IF NOT EXISTS `" . self::$db_name . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                self::$conn->exec("USE `" . self::$db_name . "`");
                self::$driver = 'mysql';
            } catch (PDOException $e) {
                // Fallback to embedded SQLite PDO database (Zero-config real SQL engine)
                try {
                    $sqliteDir = __DIR__ . '/../data';
                    if (!file_exists($sqliteDir)) {
                        mkdir($sqliteDir, 0777, true);
                    }
                    $sqliteFile = $sqliteDir . '/glycopulse.sqlite';
                    self::$conn = new PDO(
                        "sqlite:" . $sqliteFile,
                        null,
                        null,
                        [
                            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        ]
                    );
                    self::$driver = 'sqlite';
                } catch (PDOException $ex) {
                    die(json_encode([
                        'status' => 'error',
                        'message' => 'Database Connection Failed: ' . $ex->getMessage()
                    ]));
                }
            }

            self::initDatabase();
        }

        return self::$conn;
    }

    public static function getDriver() {
        return self::$driver;
    }

    private static function initDatabase() {
        if (!self::$conn) return;

        if (self::$driver === 'sqlite') {
            // SQLite compatible schema creation
            self::$conn->exec("
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_uid TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    full_name TEXT NOT NULL,
                    role TEXT NOT NULL DEFAULT 'patient',
                    diabetes_type TEXT DEFAULT 'Type 1',
                    specialty TEXT DEFAULT '',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS glucose_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT NOT NULL,
                    glucose_value INTEGER NOT NULL,
                    category TEXT NOT NULL,
                    notes TEXT,
                    logged_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS prescriptions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    patient_id TEXT NOT NULL,
                    patient_name TEXT NOT NULL,
                    doctor_name TEXT NOT NULL,
                    medication_name TEXT NOT NULL,
                    dosage TEXT NOT NULL,
                    frequency TEXT NOT NULL,
                    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS food_analyses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT NOT NULL,
                    food_name TEXT NOT NULL,
                    calories INTEGER,
                    carbs DECIMAL(5,1),
                    sugar DECIMAL(5,1),
                    protein DECIMAL(5,1),
                    fat DECIMAL(5,1),
                    fiber DECIMAL(5,1),
                    health_score INTEGER,
                    analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS emergency_alerts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT NOT NULL,
                    patient_name TEXT NOT NULL,
                    glucose_level INTEGER,
                    location TEXT,
                    status TEXT DEFAULT 'Active',
                    triggered_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            ");
        } else {
            // MySQL compatible schema creation
            self::$conn->exec("
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_uid VARCHAR(64) UNIQUE NOT NULL,
                    email VARCHAR(128) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    full_name VARCHAR(128) NOT NULL,
                    role VARCHAR(32) NOT NULL DEFAULT 'patient',
                    diabetes_type VARCHAR(64) DEFAULT 'Type 1',
                    specialty VARCHAR(128) DEFAULT '',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS glucose_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id VARCHAR(64) NOT NULL,
                    glucose_value INT NOT NULL,
                    category VARCHAR(64) NOT NULL,
                    notes TEXT,
                    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS prescriptions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    patient_id VARCHAR(64) NOT NULL,
                    patient_name VARCHAR(128) NOT NULL,
                    doctor_name VARCHAR(128) NOT NULL,
                    medication_name VARCHAR(128) NOT NULL,
                    dosage VARCHAR(128) NOT NULL,
                    frequency VARCHAR(128) NOT NULL,
                    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS food_analyses (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id VARCHAR(64) NOT NULL,
                    food_name VARCHAR(255) NOT NULL,
                    calories INT,
                    carbs DECIMAL(5,1),
                    sugar DECIMAL(5,1),
                    protein DECIMAL(5,1),
                    fat DECIMAL(5,1),
                    fiber DECIMAL(5,1),
                    health_score INT,
                    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS emergency_alerts (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id VARCHAR(64) NOT NULL,
                    patient_name VARCHAR(128) NOT NULL,
                    glucose_level INT,
                    location TEXT,
                    status VARCHAR(32) DEFAULT 'Active',
                    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            ");
        }

        // Clean up old demo users except admin and dinali
        self::$conn->exec("DELETE FROM users WHERE email IN ('patient@glucocare.ai', 'doctor@glucocare.ai', 'caregiver@glucocare.ai')");

        // Seed default users (Kasun Patient, Dr. Kasun Doctor, Admin)
        $defaultUsers = [
            ['pat-976', 'kasun@glucocare.ai', password_hash('password123', PASSWORD_BCRYPT), 'Kasun Jayalath', 'patient', 'Pre-diabetes', ''],
            ['doc-598', 'kasun.doc@glucocare.ai', password_hash('password123', PASSWORD_BCRYPT), 'Dr. Kasun Jayalath', 'doctor', '', 'Endocrinology & Diabetology'],
            ['adm-401', 'admin@glucocare.ai', password_hash('password123', PASSWORD_BCRYPT), 'System Administrator', 'admin', '', '']
        ];

        $checkStmt = self::$conn->prepare("SELECT COUNT(*) FROM users WHERE email = ? OR user_uid = ?");
        $insertStmt = self::$conn->prepare("INSERT INTO users (user_uid, email, password_hash, full_name, role, diabetes_type, specialty) VALUES (?, ?, ?, ?, ?, ?, ?)");
        foreach ($defaultUsers as $u) {
            $checkStmt->execute([$u[1], $u[0]]);
            if ($checkStmt->fetchColumn() == 0) {
                $insertStmt->execute($u);
            }
        }

        // Seed default glucose logs if empty
        $stmtG = self::$conn->query("SELECT COUNT(*) FROM glucose_logs");
        if ($stmtG->fetchColumn() == 0) {
            $defaultLogs = [
                ['pat-101', 112, 'Fasting', 'Morning wake up'],
                ['pat-101', 145, 'After Meal', 'Oatmeal & berries'],
                ['pat-101', 108, 'Before Meal', 'Pre-lunch check'],
                ['pat-101', 162, 'After Meal', 'Chicken salad & quinoa'],
                ['pat-101', 125, 'Before Meal', 'Post 30m walk'],
                ['pat-101', 118, 'Bedtime', 'Night target reached']
            ];
            $insertG = self::$conn->prepare("INSERT INTO glucose_logs (user_id, glucose_value, category, notes) VALUES (?, ?, ?, ?)");
            foreach ($defaultLogs as $g) {
                $insertG->execute($g);
            }
        }
    }
}
