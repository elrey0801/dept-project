const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initialize(passport, getUserName, getUserById) {
    const authenticateUser = async (username, password, done) => {
        const response = await getUserName(username);
        let user = await response[0];
        if (user == null) return done(null, false, { message: "Incorrect UserName or Password!" });

        if (!user.is_active) return done(null, false, { message: "User has not been activated yet!" });

        try {
            if (await bcrypt.compare(password, user.password)) {
                console.log('[' + new Date() + ']---' + username + '---logged in');
                return done(null, user);
            }
            else return done(null, false, { message: "Wrong password" });
        }
        catch (err) {
            return done(err);
        }
    }
    passport.use(new LocalStrategy({ usernameField: 'username' }, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id));
    })
}

module.exports = initialize;