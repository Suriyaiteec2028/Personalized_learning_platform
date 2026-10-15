const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// Get all courses (with search query support)
exports.getAllCourses = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const courses = await Course.find(query).sort({ isDefault: -1, createdAt: 1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses: ' + error.message });
  }
};

// Get single course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course details: ' + error.message });
  }
};
