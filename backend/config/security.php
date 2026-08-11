<?php
namespace Config;

class Security {
    private static $jwtSecret = 'GlycoPulse_AI_Super_Secure_JWT_Key_2026_!@#$';

    /**
     * Apply Strict HTTP Security Headers
     */
    public static function applySecurityHeaders() {
        header("X-Content-Type-Options: nosniff");
        header("X-Frame-Options: DENY");
        header("X-XSS-Protection: 1; mode=block");
        header("Referrer-Policy: strict-origin-when-cross-origin");
        header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;");
    }

    /**
     * Recursively sanitize strings and array inputs against XSS & injection
     */
    public static function sanitizeInput($data) {
        if (is_array($data)) {
            foreach ($data as $key => $val) {
                $data[$key] = self::sanitizeInput($val);
            }
            return $data;
        }
        if (is_string($data)) {
            $data = trim($data);
            $data = strip_tags($data);
            return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
        }
        return $data;
    }

    /**
     * Validate email format strictly
     */
    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Generate HMAC SHA256 JWT Token
     */
    public static function generateJWT($userId, $email, $role) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'iss' => 'GlycoPulse-AI-Backend',
            'sub' => $userId,
            'email' => $email,
            'role' => $role,
            'iat' => time(),
            'exp' => time() + (86400 * 7) // 7 days validity
        ]);

        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payload);

        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::$jwtSecret, true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    /**
     * Validate JWT Token
     */
    public static function validateJWT($jwt) {
        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) !== 3) return false;

        $header = self::base64UrlDecode($tokenParts[0]);
        $payload = self::base64UrlDecode($tokenParts[1]);
        $signatureProvided = $tokenParts[2];

        $expiration = json_decode($payload)->exp ?? 0;
        if ($expiration - time() < 0) return false;

        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payload);
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::$jwtSecret, true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        return hash_equals($base64UrlSignature, $signatureProvided);
    }

    private static function base64UrlEncode($text) {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($text));
    }

    private static function base64UrlDecode($text) {
        return base64_decode(str_replace(['-', '_'], ['+', '/'], $text));
    }
}
