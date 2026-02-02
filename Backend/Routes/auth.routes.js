import { Router } from "express";
// COMMENTED OUT - Using device-based authentication
// import {
//   registerUser,
//   loginUser,
//   logoutUser,
//   getCurrentUser,
// } from "../Controllers/auth.controller.js";
// import { verifyJWT } from "../Middleware/auth.middleware.js";

const router = Router();

// COMMENTED OUT - Login/Signup routes disabled for device-based auth
// router.route("/register").post(registerUser);
// router.route("/login").post(loginUser);

// Secured routes
// router.route("/logout").post(verifyJWT, logoutUser);
// router.route("/current-user").get(verifyJWT, getCurrentUser);

export default router;
