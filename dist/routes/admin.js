"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const admin_1 = require("../middleware/admin");
const zodValidation_1 = require("../zodValidation");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
router.get("/me", admin_1.adminAuthenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.headers["adminId"];
    const email = req.headers["email"];
    const role = req.headers["role"];
    const admin = yield prisma.admin.findUnique({
        where: {
            email: email
        }
    });
    if (!admin) {
        res.status(403).json({ msg: "Admin doesn't exist" });
        return;
    }
    else {
        res.json({
            adminid: admin.id,
            email: admin.email,
        });
    }
}));
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedInput = zodValidation_1.signupInput.safeParse(req.body);
    if (!parsedInput.success) {
        res.status(411).json({
            error: parsedInput.error
        });
        return;
    }
    const email = req.body.email;
    const password = req.body.password;
    const secretCode = req.body.secretCode;
    const admin = yield prisma.admin.findUnique({
        where: {
            email: email,
        }
    });
    if (admin) {
        if (admin.password == password) {
            console.log("Admin exists");
            const token = jsonwebtoken_1.default.sign({ email: email, adminId: admin.id, role: 'Admin' }, admin_1.SECRET, { expiresIn: '1h' });
            res.json({ message: "Admin logged in", token });
            return;
        }
        else {
            res.json({ message: "Incorrect password" });
            return;
        }
    }
    else {
        if (secretCode == "admin") {
            const createAdmin = yield prisma.admin.create({
                data: {
                    email: email,
                    password: password,
                    name: "admin " + email
                }
            });
            if (createAdmin) {
                console.log("Admin created");
                const token = jsonwebtoken_1.default.sign({ email: email, adminId: createAdmin.id, role: 'Admin' }, admin_1.SECRET, { expiresIn: '1h' });
                let adminId = null;
                jsonwebtoken_1.default.verify(token, admin_1.SECRET, (err, payload) => {
                    if (err || !payload || typeof payload == "string") {
                        return res.sendStatus(403);
                    }
                    adminId = payload.adminId;
                });
                if (adminId) {
                    res.json({ message: "Admin logged in", token, email, adminId });
                }
                else {
                    res.json({ message: "try again later" });
                }
            }
            else {
                res.json({ message: "try again later" });
                return;
            }
        }
        else {
            res.json({ message: "wrong code" });
        }
    }
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const adminId = req.headers["adminId"];
    const admin = yield prisma.admin.findUnique({
        where: {
            email: email
        }
    });
    if (admin) {
        if (admin.password == password) {
            const token = jsonwebtoken_1.default.sign({ email: email, adminId: admin.id, role: 'Admin' }, admin_1.SECRET, { expiresIn: '1h' });
            res.json({ message: "Logged in successfully", token, email, adminId });
        }
        else {
            res.json({ message: "Invalid username or password" });
        }
    }
    else {
        res.json({ message: "Invalid username or password" });
    }
}));
router.post('/createCourse', admin_1.adminAuthenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, price, imgLink, published } = req.body;
    const adminId = req.headers["adminId"];
    console.log("adminId :- " + adminId);
    const course = yield prisma.course.create({
        data: {
            title: title,
            description: description,
            price: price,
            imgLink: imgLink,
            published: published,
            admin: {
                connect: {
                    id: parseInt(adminId),
                }
            }
        }
    });
    if (course) {
        console.log("Course created :- " + course.title + " " + course);
        res.json({ message: "Course added successfully" });
    }
    else {
        res.json({ message: "Couldn't add course" });
    }
}));
router.put('/courses/:courseId', admin_1.adminAuthenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const courseId = req.params.courseId;
    const { title, description, price, published, imgLink } = req.body;
    const course = yield prisma.course.update({
        where: {
            id: parseInt(courseId)
        },
        data: {
            title: title,
            description: description,
            price: price,
            imgLink: imgLink,
            published: published
        }
    });
    if (course) {
        res.json({ message: "Course updated" });
        console.log("Course updated");
    }
    else {
        res.json({ message: "Error while updating" });
    }
}));
router.get('/courses', admin_1.adminAuthenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const adminId = req.headers["adminId"];
    const courses = yield prisma.course.findMany({
        where: {
            admin: {
                id: parseInt(adminId)
            }
        }
    });
    res.json({ courses });
}));
router.get('/courses/:courseId', admin_1.adminAuthenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const courseId = req.params.courseId;
    const adminId = req.headers["adminId"];
    const course = yield prisma.course.findUnique({
        where: {
            id: parseInt(courseId)
        }
    });
    res.json({ course, adminId: course === null || course === void 0 ? void 0 : course.adminId });
}));
exports.default = router;
