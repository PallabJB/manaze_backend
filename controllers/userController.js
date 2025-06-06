const Task = require('../models/Task');
const User = require('../models/User');
const bcrypt = require('bcrypt');

//@desc    Register a new user
//@route   GET/api/users/
//@access  Private

// const getUsers = async (req, res) => {
//     try{
//         const users = await User.find({role:'member'}).select('-password');

//         //ADD TASK COUNT TO EACH USER
//         const usersWithTaskCount = await Promise.all(users.map(async(user) =>{
//             const pendingTasks = Task.countDocuments({assignedTo:user._id, status:'pending'});
//             const inProgressTasks = Task.countDocuments({assignedTo:user._id, status:'progress'});
//             const completedTasks = Task.countDocuments({assignedTo:user._id, status:'completed'});

//             return{
//                 ...user._doc, //INCLUDE ALL EXISTING USER PROPERTIES(DATA)
//                 pendingTasks,
//                 inProgressTasks,
//                 completedTasks,
//             };
//         }));
//         res.status(200).json(usersWithTaskCount);
//     }catch(error){
//         res.status(500).json({message:'Server Error',error: error.message})
//     }
// };


const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').lean();
    
    const usersWithTaskCount = await Promise.all(users.map(async (user) => {
      const [pendingTasks, inProgressTasks, completedTasks] = await Promise.all([
        Task.countDocuments({ assignedTo: user._id, status: 'pending' }),
        Task.countDocuments({ assignedTo: user._id, status: 'in-progress' }),
        Task.countDocuments({ assignedTo: user._id, status: 'completed' })
      ]);

      return {
        ...user,
        pendingTasks,
        inProgressTasks,
        completedTasks
      };
    }));

    res.status(200).json(usersWithTaskCount);
  } catch (error) {
    res.status(500).json({
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Hidden' 
    });
  }
};



//@desc    Get user by ID
//@route   DELETE/api/users/:id
//@access  Private

const getUserById = async (req, res) => {
    try{
        const user = await User.findById(req.params.id).select('-password');
        if(!user){
            return res.status(404).json({message:'User not found'});
            res.json(user);
        }
    }catch(error){
        res.status(500).json({message:'Server Error',error: error.message})
    }
};


module.exports = {getUsers, getUserById};