"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ errors: result.error.flatten().fieldErrors });
            return;
        }
        req.body = result.data;
        next();
    };
}
exports.default = validate;
