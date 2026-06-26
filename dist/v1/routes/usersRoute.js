"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_1 = require("../controllers/users");
const authenticate_1 = __importDefault(require("../../middleware/authenticate"));
const authorize_1 = __importDefault(require("../../middleware/authorize"));
const validate_1 = __importDefault(require("../../middleware/validate"));
const schemas_1 = require("../controllers/users/schemas");
const router = (0, express_1.Router)();
router.get("/", authenticate_1.default, (0, authorize_1.default)("Admin"), users_1.getAllUsers);
router.get("/:id", users_1.getUser);
router.put("/:id", authenticate_1.default, (0, validate_1.default)(schemas_1.updateUserSchema), users_1.updateUser);
router.delete("/:id", authenticate_1.default, users_1.deleteUser);
exports.default = router;
