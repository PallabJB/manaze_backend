const express = require('express');
const {protect, adminOnly} = require('../middlewares/authMiddleware');

const { getDashboardData, getUserDashboardData, getTasks, getTaskById, createTask, updateTask, deleteTask, updateTaskStatus, updateTaskChecklist } = require('../controllers/taskController');

const router = express.Router();

 //TASK MANAGEMENT ROUTES
router.get('/dashboard-data',protect,getDashboardData); // GET DASHBOARD DATA (ADMIN)
router.get('/user-dashboard-data',protect,getUserDashboardData); // GET USER DASHBOARD DATA (USER)
router.get('/',protect, getTasks);// GET ALL TASKS(ADMIN: ALL, USER: OWN TASKS[assigned])
router.get('/:id',protect, getTaskById); // GET TASK BY ID
router.post('/',protect, adminOnly, createTask); //CREATE TASK (ADMIN ONLY)
router.put('/:id',protect, updateTask);//UPDATE TASK DETAILS
router.delete('/:id', protect, adminOnly, deleteTask);//DELETE TASK (ADMIN ONLY)
router.put('/:id/status',protect, updateTaskStatus); //UPDATE TASK STATUS
router.put('/:id/todo',protect, updateTaskChecklist); //UPDATE TASK CHECKLIST

module.exports = router;
