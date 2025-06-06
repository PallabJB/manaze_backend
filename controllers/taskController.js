const Task = require("../models/Task");
//const { $where } = require('../models/User');

// @desc Get dashboard data for admin
// @route GET /api/dashboard-data
// @access Private (Admin)

const getDashboardData = async (req, res) => {
  try {
    //FETCH ALL TASKS AND THEIR COUNTS
    const totalTasks = await Task.countDocuments();
    const pendingTasks = await Task.countDocuments({ status: "pending" });
    const completedTasks = await Task.countDocuments({ status: "completed" });
    const inProgressTasks = await Task.countDocuments({
      status: "in-progress" ,
      //dueDate: { $lt: new Date() },
    });

    //ENSURE ALL POSSIBLE STATUSES ARE COVERED
    const taskStatuses = ["pending", "in-progress", "completed"];
    const taskDistributionRaw = await Task.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, ""); //REMOVE SPACES FROM RESPONSE KEYS
      acc[formattedKey] =
        taskDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});
    taskDistribution["All"] = totalTasks; //ADD TOTAL COUNT TO TASKDISTRIBUTION

    //ENSURE ALL PRIORITY LEVELS ARE INCLUDED
    const taskPriorities = ["Low", "Medium", "High"];
    const taskPriorityLevelsRaw = await Task.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);
    const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
      acc[priority]=
      taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
      return acc;
    }, {});

    //FETCH 10 RECENT TASKS
    const recentTasks = await Task.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title status priority dueDate createdAt");
    res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        completedTasks,
        inProgressTasks,
      },
      charts: {
        taskDistribution,
        taskPriorityLevels,
      },
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get dashboard data for user
// @route GET /api/user-dashboard-data
// @access Private (User)
const getUserDashboardData = async (req, res) => {
  try {
    const userId = req.user._id; // FETCH DATA FOE LOGIN USER ONLY

    //FETCH STATISTICS FOR USER-SPECIFIC TASKS
    const totalTasks = await Task.countDocuments({ assignedTo: userId });
    const pendingTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "pending",
    });
    const completedTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "completed",
    });
    const inProgressTasks = await Task.countDocuments({
      assignedTo: userId,
      status:  "in-progress" ,
     // dueDae: { $lt: new Date() },
    });

    //TASK DISRIBUTION BY STATUS
    const taskStatuses = ["pending", "in-progress", "completed"];
    const taskDistributionRaw = await Task.aggregate([
      {
        $match: { assignedTo: userId },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, "");
      acc[formattedKey] =
        taskDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc; //REMOVE SPACES FROM RESPONSE KEYS
    }, {});

    taskDistribution["All"] = totalTasks; //ADD TOTAL COUNT TO TASKDISTRIBUTION

    //TASK PRIORITY LEVELS
    const taskPriorities = ["Low", "Medium", "High"];
    const taskPriorityLevelsRaw = await Task.aggregate([
      { $match: { assignedTo: userId } },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);
    const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
      acc[priority] =
        taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
      return acc;
    }, {});

    //FETCH 10 RECENT TASKS FOR USER
    const recentTasks = await Task.find({ assignedTo: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title status priority dueDate createdAt");
    res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        completedTasks,
        inProgressTasks,
      },
      charts: {
        taskDistribution,
        taskPriorityLevels,
      },
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get all tasks
// @route GET /api/tasks
// @access Private (Admin: All, User: Own Tasks)
const getTasks = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};

    if (status) {
      filter.status = status;
    }
    let tasks;

    if (req.user.role === "admin") {
      tasks = await Task.find(filter).populate(
        "assignedTo",
        "name email profileImageUrl"
      );
    } else {
      tasks = await Task.find({ ...filter, assignedTo: req.user._id }).populate(
        "assignedTo",
        "name email profileImageUrl"
      );
    }
    //ADD completed TODOCHECKLIST COUNT TO EACH TASK
    tasks = await Promise.all(
      tasks.map(async (task) => {
        const completedCount = task.todoChecklist.filter(
          (item) => item.completed
        ).length;
        return {
          ...task._doc,
          completedTodoCount: completedCount,
        };
      })
    );

    // STATUS SUMMARY COUNTS
    const allTasks = await Task.countDocuments(
      req.user.role === "admin" ? {} : { assignedTo: req.user._id }
    );

    const pendingTasks = await Task.countDocuments({
      ...filter,
      status: "pending",
      ...(req.user.role !== "admin" && { assignedTo: req.user._id }),
    });

    const inProgressTasks = await Task.countDocuments({
      ...filter,
      status: "in-progress",
      ...(req.user.role !== "admin" && { assignedTo: req.user._id }),
    });

    const completedTasks = await Task.countDocuments({
      ...filter,
      status: "completed",
      ...(req.user.role !== "admin" && { assignedTo: req.user._id }),
    });

    res.json({
      tasks,
      statusSummary: {
        all: allTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get task by ID
// @route GET /api/tasks/:id
// @access Private (Admin: All, User: Own Tasks)

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      "assignedTo",
      "name email profileImageUrl"
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//@desc create a new task
//@route POST /api/tasks
//@access Private (Admin: All)

// const createTask = async(req, res) => {
//     try{
//         const {title, description, priority, dueDate, assignedTo, attachments, todoChecklist} = req.body;

//         if(!Array.isArray(assignedTo)){
//             return res.status(400).json({message:'assignedTo must be an array of user IDs'});
//         }

//         const task = await Task.create({
//             title, description, priority, dueDate, assignedTo, createdBy: req.user._id ,attachments, todoChecklist
//         })

//         console.log(task);

//         return task;
//     }catch(error){
//         res.status(500).json({message:'Server Error', error: error.message});
//     }
// }

///OPTIME CODE///////////////////////////////

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      attachments,
      todoChecklist,
    } = req.body;

    // Basic validation
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }
    if (!Array.isArray(assignedTo)) {
      return res
        .status(400)
        .json({ message: "assignedTo must be an array of user IDs" });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      createdBy: req.user._id,
      attachments,
      todoChecklist,
    });

    // Optional: Remove in production
    console.log("Task created:", task);

    // Send response to client
    return res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

// @desc Update task details
// @route PUT /api/tasks/:id
// @access Private (Admin: All, User: Own Tasks)

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.priority = req.body.priority || task.priority;
    task.dueDate = req.body.dueDate || task.dueDate;
    task.todoChecklist = req.body.todoChecklist || task.todoChecklist;
    task.attachments = req.body.attachments || task.attachments;

    if (req.body.assignedTo) {
      if (!Array.isArray(req.body.assignedTo)) {
        return res
          .status(400)
          .json({ message: "assignedTo must be an array of user IDs" });
      }
      task.assignedTo = req.body.assignedTo;
    }

    const updatedTask = await task.save();
    res.json({ message: "Task updated successfully", updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Delete task
// @route DELETE /api/tasks/:id
// @access Private (Admin: All, User: Own Tasks)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });
    await task.deleteOne();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Update task status
// @route PUT /api/tasks/:id/status
// @access Private (Admin: All, User: Own Tasks)
const updateTaskStatus = async (req, res) => {

  try {
    const task = await Task.findById(req.params.id);

    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    const isAssigned = task.assignedTo.some(
      (userId) => userId.toString() === req.user._id.toString()
    );
    if (!isAssigned && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this task" });
    }
    task.status = req.body.status || task.status;

    if (task.status === "completed") {
      task.todoChecklist.forEach((item) => (item.completed = true));
      task.progress = 100; // Set progress to 100% when completed
    }
    await task.save();
    res.json({ message: "Task status updated successfully", task });
  } catch (error) {

    res.status(500).json({ message: "Server Error", error: error.message });

  }
};

// @desc Update task checklist
// @route PUT /api/tasks/:id/todo
// @access Private (Admin: All, User: Own Tasks)
const updateTaskChecklist = async (req, res) => {
    //console.log('req.user:', req.user);
    //console.log("updateTaskChecklist controller reached");

  try {
    const { todoChecklist } = req.body;

    if (!Array.isArray(todoChecklist)) {
      return res.status(400).json({ message: "Invalid todoChecklist format" });
    }
    const task = await Task.findById(req.params.id);

    // if (!task) {
    //   return res.status(404).json({ message: "Task not found" });
    // }
    // if (!task.assignedTo.includes(req.user._id) && req.user.role !== "admin") {
    //   return res
    //     .status(403)
    //     .json({ message: "You are not authorized to update checklist" });
    // }
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    const isAssigned = task.assignedTo.some(
      id => id.toString() === req.user._id.toString()
    );
    if (!isAssigned && req.user.role !== "admin") {
      return res.status(403).json({ message: "You are not authorized to update checklist" });
    }


    // if (
    //   !task.assignedTo
    //     .map((id) => id.toString())
    //     .includes(req.user._id.toString()) &&
    //   req.user.role !== "admin"
    // ) {
    //   return res
    //     .status(403)
    //     .json({ message: "You are not authorized to update checklist" });
    // }

    task.todoChecklist = todoChecklist; //REPLACE WITH UPDATED CHECKLIST

    //AUTO UPDATE PROGRESS BASED ON CHECKLIST COMPLETION
    const completedCount = task.todoChecklist.filter(
      (item) => item.completed
    ).length;
    const totalItems = task.todoChecklist.length;
    task.progress =
      totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0; // Calculate progress

    //AUTO UPDATE STATUS BASED ON PROGRESS
    if (task.progress === 100) {
      task.status = "completed";
    } else if (task.progress > 0) {
      task.status = "in-progress";
    } else {
      task.status = "pending";
    }
    await task.save();
    const updatedTask = await Task.findById(req.params.id).populate(
      "assignedTo",
      "name email profileImageUrl"
    );
    res.json({
      message: "Task checklist updated successfully",
      task: updatedTask,
    });
    
  } catch (error) {
    console.error(error);
    //const task = await Task.findById(req.params.id);
    res.status(500).json({ message: "Server Error", error: error.message });
    //console.log('Assigned To:', task.assignedTo.map(id => id.toString()));
    //console.log('Current User:', req.user._id.toString(), 'Role:', req.user.role);

  }
  
};

module.exports = {
  getDashboardData,
  getUserDashboardData,
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
};
