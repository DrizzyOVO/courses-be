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
const user_1 = require("../middleware/user");
const zodValidation_1 = require("../zodValidation");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
router.get("/me", user_1.authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.headers["email"];
    if (!email) {
        res.json({
            email: null,
            userId: null
        });
        return;
    }
    const user = yield prisma.user.findUnique({
        where: {
            email: email
        }
    });
    if (!user) {
        res.json({ email: null, userId: null });
        return;
    }
    else {
        res.json({
            email: user.email,
            userId: user.id
        });
    }
}));
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
            const token = jsonwebtoken_1.default.sign({ email: email, userId: user.id, role: 'user' }, user_1.SECRET, { expiresIn: '1h' });
            res.json({ message: 'User already exists', token, email, userId });
        }
        else {
            res.json({ message: "Incorrect password" });
        }
        const token = jsonwebtoken_1.default.sign({ email: email, userId: user.id, role: 'user' }, user_1.SECRET, { expiresIn: '1h' });
        res.json({ message: 'User already exists', token, email, userId });
    }
    else {
        const newUser = yield prisma.user.create({
            data: {
                email: email,
                password: password,
                name: "user " + email,
            }
        });
        const token = jsonwebtoken_1.default.sign({ email: newUser.email, userId: newUser.id, role: 'user' }, user_1.SECRET, { expiresIn: '1h' });
        res.json({ message: 'Created user sucessfully', token, email, userId });
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
    // if(user === null) {
    //   res.json({ message: 'Invalid username or password' }); 
    // } else { 
    //   if(user.password == password){ 
    //     const token = jwt.sign({ email: email, userId: user.id, role: 'user'}, SECRET, {expiresIn: '1h'}); 
    //     res.json({ message: "Logged in successfully", token, email, userId }); 
    //   } else { 
    //     res.json({ message: "Incorrect password" })
    //   }
    // }
    if (user) {
        if (user.password == password) {
            console.log("User exists");
            const token = jsonwebtoken_1.default.sign({ email: email, userId: user.id, role: 'user' }, user_1.SECRET, { expiresIn: '1h' });
            res.json({ message: "Logged in successfully", token, email, userId });
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
router.get('/courses', user_1.authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const courses = await Course.find({published: true});
    // res.json({ courses });
    const email = req.headers["email"];
    const courses = yield prisma.course.findMany({
        where: {
            published: true
        }
    });
    // const ans = courses.map((course) => {
    //   course.users.map(user => {
    //     if(user.email == email) { 
    //     }
    //   })
    // })
    if (courses) {
        res.json({ courses, email });
    }
    else {
        res.json({ message: "courses not found" });
    }
}));
router.get("/courses/:courseId", user_1.authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const courseId = req.params.courseId;
    const email = req.headers["email"];
    const userId = req.headers["userId"];
    console.log("userId :- " + userId);
    console.log("email :- " + email);
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
        if (user.email == email) {
            theUser = user.id;
        }
    });
    if (course) {
        res.json({ message: "course found", course, userId, theUser });
    }
    else {
        res.json({ message: "course not found" });
    }
}));
router.get("/courses/:courseId/buy", user_1.authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("headers existttttt");
    // if(req.headers.authorization){
    //   console.log("headers existttttt");
    //   console.log(req.headers.authorization);
    // }
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
                            id: parseInt(userId)
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
router.get('/courses/:courseId/:userId', user_1.authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
                            id: parseInt(userId)
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
router.get('/purchasedCourses', user_1.authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const user = await User.findOne({ username: req.user.username }).populate('purchasedCourses');
    // if (user) {
    //   res.json({ purchasedCourses: user.purchasedCourses || [] });
    // } else {
    //   res.status(403).json({ message: 'User not found' });
    // }
    const email = req.headers["email"];
    const userId = req.headers["userId"];
    const user = yield prisma.user.findUnique({
        where: {
            id: parseInt(userId)
        },
        include: {
            courses: true
        }
    });
    console.log(user);
    if (user) {
        res.json({ user, userId, email, courses: user.courses });
    }
}));
exports.default = router;
