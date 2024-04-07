"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupInput = void 0;
const zod_1 = require("zod");
exports.signupInput = zod_1.z.object({
    email: zod_1.z.string().min(5).max(30).email(),
    password: zod_1.z.string().min(7).max(30),
});
