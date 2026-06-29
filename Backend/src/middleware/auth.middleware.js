import { User } from "../models/user.model.js";

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Access denied. Invalid token format." });
        }

        const user = await User.findOne({ token: token });

        if (!user) {
            return res.status(401).json({ message: "Access denied. Invalid or expired token." });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({ message: "Authentication error." });
    }
};

export { verifyToken };
