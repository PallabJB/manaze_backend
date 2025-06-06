const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//GENERATE JWT TOKEN
const generateToken = (userId) => {
  return jwt.sign({ id:userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};



//@desc    Register a new user
//@route   POST /api/auth/register
//@access  Public
const registerUser = async (req, res) => {
    try{
        const {name, email, password, profileImageUrl, adminInviteToken} = req.body;

        //CHECK IF USER ALREADY EXIXTS
        const userExists = await User.findOneAndDelete({email});
        if(userExists){
           return res.status(400).json({message:'User already exists'});
        }
        //DETERMINE USER ROLE- USER IS ADMIN IF CORRECT TOKEN IS PROVIDED OTHERWISE 'user'
        let role = 'user';
        if(adminInviteToken && adminInviteToken == process.env.ADMIN_INVITE_TOKEN){
            role = 'admin';
        }

        //HASH PASSWORD
       const salt = await bcrypt.genSalt(10);
       const hashedPassword = await bcrypt.hash(password,salt);

       //CREATE NEW USER
       const user = await User.create({
        name,
        email,
        password: hashedPassword,
        profileImageUrl,
        role,
       });
       //RETURN user DATA WITH JWT
       res.status(201).json({
        _id: user._id,
        name:user.name,
        email:user.email,
        role:user.role,
        profileImageUrl:user.profileImageUrl,
        token: generateToken(user._id),
       });
    }
    catch(error){
        res.status(500).json({message:'Server Error',error: error.message})
    }
};

//@desc    Login a user
//@route   POST /api/auth/login
//@access  Public

const loginUser = async (req, res) => {
     try
    {
        const {email, password} = req.body;
        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({message:'Invalid email'});
        }

        //CHECK IF PASSWORD MATCHES (CONAPRING PASSWORDS)
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message:'Password is incorrect'});
        }
        //RETURN user DATA WITH JWT
        return res.json({
            _id: user._id,
            name:user.name,
            email:user.email,
            role:user.role,
            profileImageUrl:user.profileImageUrl,
            token: generateToken(user._id),
        })

    }
    catch(error){
       return res.status(500).json({message:'Server Error',error: error.message})
    }
};

//@desc    Get user profile
//@route   GET /api/auth/profile
//@access  Private

const getUserProfile = async (req, res) => {
     try{
        const user = await User.findById(req.user._id).select('-password');
        if(!user){
           return res.status(404).json({message:'User not found'});
        }
        res.json(user);
    }
    catch(error){
       return res.status(500).json({message:'Server Error',error: error.message})
    }
};

//@desc update user profile
//@route PUT /api/auth/profile
//@access Private

const updateUserProfile = async (req, res) => {
     try{
        const user = await findById(req.user.id);

        if(!user){
            return res.status(404).json({message:'User not found'});
        }
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if(req.body.password){
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }
        const updateUser = await user.save();
        res.json({
            _id: updateUser._id,
            name:updateUser.name,
            email:updateUser.email,
            role:updateUser.role,
            profileImageUrl:updateUser.profileImageUrl,
            token: generateToken(updateUser._id),
        });
    }
    catch(error){
       return res.status(500).json({message:'Server Error',error: error.message})
    }    
};

module.exports = {registerUser, loginUser, getUserProfile, updateUserProfile};