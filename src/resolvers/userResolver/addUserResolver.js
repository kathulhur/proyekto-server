const bcrypt = require('bcrypt');
const User = require('../../models/User');

module.exports = async (parentValue, { username, password, secretCode }) => 
    {
        const hashedPassword = await bcrypt.hash(password, 10);
        return new User({ username, password: hashedPassword, secretCode }).save();
    }