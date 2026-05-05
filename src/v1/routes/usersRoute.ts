import { Router } from "express";
import { getUser, getAllUsers, updateUser, deleteUser } from "../controllers/users";
import authenticate from "../../middleware/authenticate";
import authorize from "../../middleware/authorize";
import validate from "../../middleware/validate";
import { updateUserSchema } from "../controllers/users/schemas";

const router = Router();

router.get("/", authenticate, authorize("Admin"), getAllUsers);
router.get("/:id", getUser);
router.put("/:id", authenticate, validate(updateUserSchema), updateUser);
router.delete("/:id", authenticate, deleteUser);

export default router;
