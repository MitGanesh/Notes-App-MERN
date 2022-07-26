const jwt = require('jsonwebtoken');
const JWT_SECRET = 'antokenforjwt';

const fetchuser = (req, res, next)=>{
    // Get the user from JWT token and append id to req object
    const token = req.header('auth-token')

    if (!token) {
        return res.status(401).json({ errors: "Please authenticate using valid token" });
    }
    
    try {
        const data = jwt.verify(token,JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        return res.status(401).json({ errors: "Please authenticate using valid token" });
    }
}

module.exports = fetchuser;