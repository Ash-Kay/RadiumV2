import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import { config } from "dotenv";
import { googleAuth } from "../controller/user.controller";
config();

passport.use(
    new GoogleStrategy.Strategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: "http://localhost:3000/api/v1/users/google/redirect",
        },
        async (accessToken, refreshToken, profile, done) => {
            console.log("profile", profile);
            const token = await googleAuth(profile);
            done(undefined, token);
        }
    )
);
