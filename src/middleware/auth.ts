import * as jwt from "jsonwebtoken";

export const verifyAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const user = jwt.verify(token, process.env.JWT_KEY);
        //save (decoded)user for future use
        req.user = user;
        next();
    } catch (e) {
        console.log("jwt token invalid");
        return res.status(401).json({ message: "AUTH_FAILED" });
    }
};

export const verifyAuthorization = (req, res, next) => {
    try {
        if (req.user.type !== "god") {
            return res.status(401).json({ message: "AUTH_FAILED" });
        }
        next();
    } catch (e) {
        console.log("jwt token invalid");
        return res.status(401).json({ message: "AUTH_FAILED" });
    }
};
