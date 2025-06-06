const jwt = require('jsonwebtoken');
const User = require('../models/User');

////MIDDLEWARE TO PROTECT ROUTES
const protect = async (req,res, next) => {
    try{
        let token = req.headers.authorization;

        if(token && token.startsWith('Bearer')){
            token = token.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        }else{
            res.status(401).json({message: 'Not authorized, no token'});
        }
    }
    catch(error){
        res.status(401).json({message: 'Token failed', error: error.message});
    }
};

//MIDDLEWARE FOR ADMIN-ONLY ACCESS
const adminOnly = async (req, res, next) => {
    if(req.user && req.user.role === 'admin'){
        next();
    }else{
        res.status(401).json({message:'Not authorized as an admin'});
    }
};

module.exports = {protect, adminOnly};
// This middleware checks if the user is authenticated and has the role of admin.If they do, it calls the next function in the middleware chain. If they don't, it.