import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import { config } from "dotenv";
import { googleAuthWeb } from "../controller/user.controller";
config();

passport.use(
    new GoogleStrategy.Strategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/api/v1/users/google/redirect",
        },
        async (accessToken, refreshToken, profile, done) => {
            const token = await googleAuthWeb(profile);
            done(undefined, token);
        }
    )
);
