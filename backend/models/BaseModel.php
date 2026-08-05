<?php
namespace Models;

use Config\Database;

abstract class BaseModel {
    protected $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }
}
