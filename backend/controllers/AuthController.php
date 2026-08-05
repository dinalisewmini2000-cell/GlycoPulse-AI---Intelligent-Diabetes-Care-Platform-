<?php
namespace Controllers;

use Models\UserModel;

class AuthController {
    private $userModel;

    public function __construct() {
        $this->userModel = new UserModel();
    }

    public function login($input) {
        $email = $input['email'] ?? '';
        $role = $input['role'] ?? 'patient';
        $user = $this->userModel->findByEmailOrRole($email, $role);

        echo json_encode([
            'status' => 'success',
            'message' => 'User logged in successfully',
            'token' => 'jwt_token_' . md5($user['email']),
            'user' => $user
        ]);
    }

    public function getUsers() {
        echo json_encode([
            'status' => 'success',
            'users' => $this->userModel->getAllUsers()
        ]);
    }
}
