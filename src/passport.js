import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import { userModel } from "./models/user.model.js";
import bcrypt from "bcrypt";

const JWT_SECRET = "secretJWTkey";

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET
};

passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
            const user = await userModel.findById(jwt_payload.id).select("-password");
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (err) {
            return done(err, false);
        }
    })
);

passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password"
        },
        async (email, password, done) => {
            try {
                const user = await userModel.findOne({ email });
                if (!user) {
                    return done(null, false, { message: "Usuario no encontrado" });
                }
                
                const isValidPassword = bcrypt.compareSync(password, user.password);
                if (!isValidPassword) {
                    return done(null, false, { message: "Contraseña incorrecta" });
                }
                
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    )
);

export default passport; 