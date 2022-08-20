const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
module.exports = async (parentValue, {username, password }, {user, models, secret}) => {
    const loggedUser = await models.User.findOne({ username });
    if (!loggedUser) {
        throw new Error('User not found');
    }
    const isValid = bcrypt.compareSync(password, loggedUser.password);

    if (!isValid) {
        throw new Error('Invalid password');
    }
    const token = await createToken(loggedUser, secret, '1hr');

    return {
        token
    }
}


const createToken = async (loggedUser, secret, expiresIn) => {
    const { id, username } = loggedUser;
    return await jwt.sign({ id, username }, secret, { expiresIn });
}
