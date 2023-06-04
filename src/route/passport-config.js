const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {
        const response = await getUserByEmail(email);
        let user = await response[0];
        if (user == null) return done(null, false, { message: "No user with that email" });

        // let pass = await bcrypt.hash(password, 10);
        console.log(password);
        try {
            if (await bcrypt.compare(password, user.password)) return done(null, user);
            else return done(null, false, { message: "Wrong password" });
        }
        catch (err) {
            return done(err);
        }
    }
    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id));
    })
}

module.exports = initialize;