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
router.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedInput = zodValidation_1.signupInput.safeParse(req.body);
    const userId = req.headers['userId'];
    if (!parsedInput.success) {
        console.log("Errorrrr");
        res.json({
            error: parsedInput.error
        });
        return;
    }
    const email = req.body.email;
    const password = req.body.password;
    //user 
    const user = yield prisma.user.findUnique({
        where: {
            email: email,
        }
    });
    if (user) {
        if (user.password == password) {
            res.json({ message: 'User already exists', email, userId: user.id });
        }
        else {
            res.json({ message: "Incorrect password" });
        }
        res.json({ message: 'User already exists', email, userId: user.id });
    }
    else {
        const newUser = yield prisma.user.create({
            data: {
                email: email,
                password: password,
                name: "user " + email,
            }
        });
        res.json({ message: 'Created user sucessfully', email, userId: newUser.id });
    }
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const userId = req.headers["userId"];
    const user = yield prisma.user.findUnique({
        where: {
            email: email
        }
    });
    if (user) {
        if (user.password == password) {
            console.log("User exists");
            res.json({ message: "Logged in successfully", email, userId });
            return;
        }
        else {
            console.log("wrong password");
            res.json({ message: "Incorrect password" });
            return;
        }
    }
    else {
        console.log("invalid");
        res.json({ message: 'Invalid username or password' });
        return;
    }
}));
router.get('/courses/:userEmail', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const courses = await Course.find({published: true});
    // res.json({ courses });
    const email = req.params.userEmail;
    const courses = yield prisma.course.findMany({
        where: {
            published: true
        }
    });
    const user = yield prisma.user.findUnique({
        where: {
            email: email
        }
    });
    if (courses) {
        res.json({ courses, user });
    }
    else {
        res.json({ message: "courses not found" });
    }
}));
router.get("/courses/:courseId/:userEmail", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const courseId = req.params.courseId;
    const userEmail = req.params.userEmail;
    const course = yield prisma.course.findUnique({
        where: {
            id: parseInt(courseId)
        },
        include: {
            users: true
        }
    });
    const users = course === null || course === void 0 ? void 0 : course.users;
    let theUser = null;
    users === null || users === void 0 ? void 0 : users.map(user => {
        if (user.email == userEmail) {
            theUser = user.id;
        }
    });
    if (course) {
        res.json({ message: "course found", course, theUser });
    }
    else {
        res.json({ message: "course not found" });
    }
}));
router.get("/findid/:userEmail", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.params.userEmail;
    const user = yield prisma.user.findUnique({
        where: {
            email: email
        }
    });
    if (user) {
        res.json({ message: "success", user });
    }
    else {
        res.json({ message: "filed" });
    }
}));
router.post("/courses/:courseId/buy", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("reached in backend");
    const courseId = req.params.courseId;
    const { email } = req.body;
    const userId = req.headers["userId"];
    const course = yield prisma.course.findUnique({
        where: {
            id: parseInt(courseId)
        }
    });
    console.log(course);
    if (course) {
        const user = yield prisma.user.findUnique({
            where: {
                email: email,
            }
        });
        if (user) {
            yield prisma.course.update({
                where: {
                    id: parseInt(courseId)
                },
                data: {
                    users: {
                        connect: {
                            email: email
                        }
                    }
                }
            });
            res.json({ message: "Bought it" });
        }
        else {
            res.status(403).json({ message: 'user not found' });
        }
    }
    else {
        res.status(404).json({ message: 'course not found' });
    }
}));
router.get('/courses/:courseId/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("reached in backend");
    const courseId = req.params.courseId;
    const email = req.headers["email"];
    const userId = req.headers["userId"];
    const course = yield prisma.course.findUnique({
        where: {
            id: parseInt(courseId)
        }
    });
    console.log(course);
    if (course) {
        const user = yield prisma.user.findUnique({
            where: {
                email: email,
            }
        });
        if (user && userId && typeof userId === "number") {
            yield prisma.course.update({
                where: {
                    id: parseInt(courseId)
                },
                data: {
                    users: {
                        connect: {
                            email: email
                        }
                    }
                }
            });
            res.json({ message: "Bought it" });
        }
        else {
            res.status(403).json({ message: 'user not found' });
        }
    }
    else {
        res.status(404).json({ message: 'course not found' });
    }
}));
router.get('/purchasedCourses/:userEmail', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.params.userEmail;
    const user = yield prisma.user.findUnique({
        where: {
            email: email
        },
        include: {
            courses: true
        }
    });
    const userId = user === null || user === void 0 ? void 0 : user.id;
    if (user) {
        res.json({ user, userId, email, courses: user.courses });
    }
}));
exports.default = router;
