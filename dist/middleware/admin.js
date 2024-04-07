"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthenticateJwt = exports.SECRET = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.SECRET = "SecDriSu";
const adminAuthenticateJwt = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jsonwebtoken_1.default.verify(token, exports.SECRET, (err, payload) => {
            // if(err){ 
            //     return res.sendStatus(403); 
            // }
            if (err || !payload || typeof payload == "string") {
                return res.sendStatus(403);
            }
            // if(typeof payload == "string") { 
            //     return res.sendStatus(403); 
            // }
            // if(typeof payload == "string") { 
            //     return res.sendStatus(403); 
            // }
            if (payload.role != "Admin") {
                return res.sendStatus(403);
            }
            req.headers["adminId"] = payload.adminId;
            req.headers["email"] = payload.email;
            req.headers["role"] = payload.role;
            next();
        });
    }
    else {
        console.log("Nooooooooooooo");
        return res.sendStatus(401).json("Nooooooooo");
    }
};
exports.adminAuthenticateJwt = adminAuthenticateJwt;
