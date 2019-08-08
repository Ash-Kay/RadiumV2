export const error = (error, req, res, next) => {
    res.status(500).json({
        code: "ERROR",
        error: error
    });
};
