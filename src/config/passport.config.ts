import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";

import config from "./env.config";
import { googleAuthWeb } from "../controller/user.controller";

passport.use(
    new GoogleStrategy.Strategy(
        {
            clientID: config.google.clientId,
            clientSecret: config.google.clientSecret,
            callbackURL: "http://localhost:3000/api/v1/users/auth/google/redirect",
        },
        async (accessToken, refreshToken, profile, done) => {
            const token = await googleAuthWeb(profile);
            if (token !== undefined) done(undefined, token);
        }
    )
);
