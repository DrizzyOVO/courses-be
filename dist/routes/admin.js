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
const zodValidation_1 = require("../zodValidation");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
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
            res.json({ message: "Admin logged in" });
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
                res.json({ message: "Admin created", email });
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
            res.json({ message: "Logged in successfully", email, adminId });
        }
        else {
            res.json({ message: "Invalid username or password" });
        }
    }
    else {
        res.json({ message: "Invalid username or password" });
    }
}));
router.post('/createCourse', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, price, imgLink, published, email } = req.body;
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
                    // id: parseInt(adminId),
                    email: email
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
router.put('/courses/:courseId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
router.get('/courses/:adminEmail', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const adminId = req.headers["adminId"];
    const email = req.params.adminEmail;
    const courses = yield prisma.course.findMany({
        where: {
            admin: {
                email: email
            }
        }
    });
    const admin = yield prisma.admin.findUnique({
        where: {
            email: email
        }
    });
    res.json({ courses, adminId: admin === null || admin === void 0 ? void 0 : admin.id, email });
}));
router.get('/courses/:courseId/getone', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const courseId = req.params.courseId;
    const adminId = req.headers["adminId"];
    const course = yield prisma.course.findUnique({
        where: {
            id: parseInt(courseId)
        }
    });
    res.json({ course });
}));
exports.default = router;
