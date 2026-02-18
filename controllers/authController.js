const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* SIGNUP */
exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });

    const existingUser = await User.findOne({ email });

    if (existingUser)
      return res.status(409).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Signup successful",
      userId: user._id,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* LOGIN */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // ACCESS TOKEN (short life)
  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  // REFRESH TOKEN (long life)
  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  // Save refresh token in DB
  user.refreshToken = refreshToken;
  await user.save();

  res.json({
    accessToken,
    refreshToken
  });

    // const token = jwt.sign(
    //   { userId: user._id, email: user.email },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "1h" }
    // );

    // res.json({
    //   message: "Login successful",
    //   token,
    // });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* PROFILE */
exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.userId).select("-password");
  res.json(user);
};

// REFRESH TOKEN
exports.refreshToken = async (req, res) => {

  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(401).json({ message: "Refresh token required" });

  try {

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken)
      return res.status(403).json({ message: "Invalid refresh token" });

    const newAccessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({
      accessToken: newAccessToken
    });

  } catch {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

// LOGOUT
exports.logout = async (req, res) => {

  const { refreshToken } = req.body;

  const user = await User.findOne({ refreshToken });

  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  res.json({ message: "Logged out" });
};


