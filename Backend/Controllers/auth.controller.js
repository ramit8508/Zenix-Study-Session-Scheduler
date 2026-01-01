import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { User } from "../Models/user.model.js";

// Generate access token
const generateAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    return accessToken;
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access token"
    );
  }
};

// Register user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if ([name, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists
  const existedUser = await User.findOne({ email });

  if (existedUser) {
    throw new ApiError(409, "User with email already exists");
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  // Generate token
  const accessToken = await generateAccessToken(user._id);

  // Get created user without password
  const createdUser = await User.findById(user._id).select("-password");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // Set cookie options
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        201,
        {
          user: createdUser,
          accessToken,
        },
        "User registered successfully"
      )
    );
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Find user
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // Check password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // Generate token
  const accessToken = await generateAccessToken(user._id);

  // Get user without password
  const loggedInUser = await User.findById(user._id).select("-password");

  // Set cookie options
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
        },
        "User logged in successfully"
      )
    );
});

// Logout user
const logoutUser = asyncHandler(async (req, res) => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// Get current user
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

export { registerUser, loginUser, logoutUser, getCurrentUser };
