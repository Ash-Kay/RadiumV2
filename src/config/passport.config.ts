import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import { config } from "dotenv";
import { googleAuthWeb } from "../controller/user.controller";
config();

const getCallbackUrl = (): string => {
    if (process.env.NODE_ENV === "development") return "http://localhost:3000/api/v1/users/auth/google/redirect";
    else return `${process.env.AWS_EC2_BASE_URL}/api/v1/users/auth/google/redirect`;
};

passport.use(
    new GoogleStrategy.Strategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: getCallbackUrl(),
        },
        async (accessToken, refreshToken, profile, done) => {
            const token = await googleAuthWeb(profile);
            if (token !== undefined) done(undefined, token);
        }
    )
);
