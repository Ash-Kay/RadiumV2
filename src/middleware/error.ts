export const error = (error, req, res, next) => {
    console.log("ERROR: ", error);

    res.status(500).json({
        code: "ERROR",
        error: error
    });
};
