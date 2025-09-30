import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if(!token) {
        return res.status(401).json({success: false, message: 'No token, authorization denied'});
    }
    try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       req.user = decoded.user;
       next();
    } catch (err) {
         res.status(500).json({ message: "Invalid token" });
    }
};