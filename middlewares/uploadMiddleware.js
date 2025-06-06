const multer = require('multer');

//CONFIGURATION STORAGE

const storage = multer.diskStorage({
    destination:(req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename:(req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

//FILE FILTER
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if(allowedTypes.includes(file.mimetype)){
        cb(null, true);
    }else{
        cb(new Error('Invalid file type, only JPEG and PNG are allowed'), false);
    }    
};

const upload = multer({storage, fileFilter});
module.exports = upload;
// This middleware is used to handle file uploads in the application. It uses the multer library to configure storage, file naming, and file filtering. The uploaded files are stored in the 'uploads/' directory with a timestamp prepended to the original filename. The file filter ensures that only JPEG and PNG images are accepted. If a file is successfully uploaded, it will be available in the request object for further processing.