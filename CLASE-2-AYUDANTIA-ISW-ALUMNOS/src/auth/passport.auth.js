import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { AppDataSource } from "../config/configDB.js";
import User from "./entity/user.entity.js";
import { JWT_SECRET } from "./config/configEnv.js";

const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies.jwt;
    }
    return token;
};

const options = {
    jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
    secretOrKey: JWT_SECRET,
};

export const passportJwtSetup = () => {
    passport.use(
        new JwtStrategy(options, async (payload, done) => {
            try {
                const userRepository = AppDataSource.getRepository(User);
                const user = await userRepository.findOne({
                    where: { id: payload.id },
                });
                
                if (user && user.estado_active) {
                    return done(null, {
                        id: user.id,
                        email: user.email,
                        nombre: user.nombre,
                        apellido: user.apellido
                    });
                } else {
                    return done(null, false);
                }
            } catch (error) {
                return done(error, false);
            }
        })
    );
};
