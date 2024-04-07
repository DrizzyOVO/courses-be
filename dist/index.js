"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// "@repo/ui": "*",
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const admin_1 = __importDefault(require("./routes/admin"));
const user_1 = __importDefault(require("./routes/user"));
const PORT = 3000;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/admin", admin_1.default);
app.use("/user", user_1.default);
// mongoose.connect('mongodb://127.0.0.1:27017/test', { dbName: "TodoProjGhub" }); 
app.listen(PORT, () => {
    console.log(`Example app is listening at http://localhost:${PORT}`);
});
// app.get("/", (req, res) => { 
//     res.json({ Msg: "reached here" }); 
// })
// import { PrismaClient } from '@prisma/client'
// const prisma = new PrismaClient()
// async function main() {
// await prisma.user.create({ 
//     data: {
//         name: "gg", 
//         email: "gg",   
//     }
// })
// await prisma.course.create({  
//     data: {
//         title: "smth2", 
//         description: "smth2", 
//         price: 999, 
//         published: false, 
//         admin: {
//             connect: {
//                 id: 1
//             }
//         }, 
//         allCourses: {
//             connect: {
//                 id: 1 
//             }
//         }
//     }
// })
// await prisma.course.update({
//     where: {
//         id: 1
//     }, 
//     data: {
//         users: {
//             connect: {
//                 id: 2
//             }
//         }
//     }
// })
// const ans = await prisma.course.findMany({ 
//     include: { 
//         users: true
//     }
// })
// ans.map(course => console.log(course))
//     const admin = await prisma.user.findUnique({ 
//         where: {
//             id: 1
//         }, 
//         include: {
//             courses: true
//         }
//     })
//     console.log(admin); 
// }
// main()
//   .then(async () => {
//     await prisma.$disconnect()
//   })
//   .catch(async (e) => {
//     console.error(e)
//     await prisma.$disconnect()
//     process.exit(1)
//   })
// show collections / show tables => shows all the models  
// db.getCollection('admins').find();  => specifically select the model and .query
