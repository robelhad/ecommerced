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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_config_1 = __importDefault(require("../../infra/database/database.config"));
const optionalAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("🔍 [OPTIONAL AUTH] optionalAuth middleware called");
    console.log("🔍 [OPTIONAL AUTH] Request headers:", req.headers);
    console.log("🔍 [OPTIONAL AUTH] Request session:", req.session);
    console.log("🔍 [OPTIONAL AUTH] Session ID:", (_a = req.session) === null || _a === void 0 ? void 0 : _a.id);
    const accessToken = req.cookies.accessToken;
    console.log("🔍 [OPTIONAL AUTH] Access token from header:", accessToken ? "present" : "not present");
    if (!accessToken) {
        console.log("🔍 [OPTIONAL AUTH] No access token found, proceeding without auth");
        return next();
    }
    try {
        const secret = process.env.ACCESS_TOKEN_SECRET;
        if (!secret) {
            console.log("🔍 [OPTIONAL AUTH] ERROR: Access token secret is not defined");
            throw new Error("Access token secret is not defined");
        }
        const decoded = jsonwebtoken_1.default.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        console.log("🔍 [OPTIONAL AUTH] Token decoded successfully:", decoded);
        const user = yield database_config_1.default.user.findUnique({
            where: { id: String(decoded.id) },
            select: { id: true, role: true },
        });
        console.log("🔍 [OPTIONAL AUTH] User found in database:", user);
        if (user) {
            req.user = user;
            console.log("🔍 [OPTIONAL AUTH] User set in request:", req.user);
        }
        else {
            console.log("🔍 [OPTIONAL AUTH] User not found in database");
        }
    }
    catch (error) {
        console.log("🔍 [OPTIONAL AUTH] Error in optionalAuth:", error);
    }
    console.log("🔍 [OPTIONAL AUTH] Proceeding to next middleware");
    next();
});
exports.default = optionalAuth;
