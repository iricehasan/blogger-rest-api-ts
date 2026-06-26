"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blogs_1 = require("../controllers/blogs");
const authenticate_1 = __importDefault(require("../../middleware/authenticate"));
const validate_1 = __importDefault(require("../../middleware/validate"));
const schemas_1 = require("../controllers/blogs/schemas");
const router = (0, express_1.Router)();
router.get("/", blogs_1.getAllBlogs);
router.post("/", authenticate_1.default, (0, validate_1.default)(schemas_1.blogSchema), blogs_1.createBlog);
router.get("/:id", blogs_1.getBlog);
router.put("/:id", authenticate_1.default, (0, validate_1.default)(schemas_1.blogSchema), blogs_1.updateBlog);
router.delete("/:id", authenticate_1.default, blogs_1.deleteBlog);
exports.default = router;
