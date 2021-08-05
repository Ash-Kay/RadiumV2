import { Request } from "express";

const getCookieFromRequest = (request: Request): Map<string, string> => {
    const cookies = new Map();

    if (!request.headers.cookie) return cookies;

    request.headers.cookie.split(";").forEach((cookie) => {
        const parts = cookie.match(/(.*?)=(.*)$/);
        if (parts?.length) cookies[parts[1].trim()] = (parts[2] || "").trim();
    });
    return cookies;
};

export default getCookieFromRequest;
