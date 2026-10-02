const jwt = require('jsonwebtoken');

// This function checks if the user has a valid token
const protect = (req, res, next) => {
    let token;

    // Check if the token is in the header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get the token out of the header
            token = req.headers.authorization.split(' ')[1];

            // Verify the token is real using the exact same hardcoded secret key!
            const decoded = jwt.verify(token, 'my_super_secret_accounting_app_key_2024');

            // Attach the user info to the request
            req.user = decoded;
            next(); // Let them pass to the next step
        } catch (error) {
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        res.status(401).json({ message: "Not authorized, no token" });
    }
};

module.exports = { protect };