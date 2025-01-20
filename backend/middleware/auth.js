// middleware/auth.js
export const auth = (req, res, next) => {
  const userId = req.cookies.userId;
  if (!userId) {
    return res.status(401).json({ message: 'User not logged in' });
  }
  next();
};
