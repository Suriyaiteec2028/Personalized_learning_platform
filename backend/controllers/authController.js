const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_key_personalized_learning_platform_2026', {
    expiresIn: '30d',
  });
};

// Helper function to generate an 8-digit unique alphanumeric code
const generateUniqueTeacherCode = async () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let isUnique = false;
  let code = '';
  while (!isUnique) {
    code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const existing = await User.findOne({ teacherCode: code });
    if (!existing) {
      isUnique = true;
    }
  }
  return code;
};

// Register user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, institution, department, qualification, rollNumber, gender, interests } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields (name, email, password, role)' });
    }

    if (!['teacher', 'student'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role selected. Must be Teacher or Student.' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'A user with this email address already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let teacherCode = null;
    if (role === 'teacher') {
      teacherCode = await generateUniqueTeacherCode();
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      teacherCode: role === 'teacher' ? teacherCode : undefined,
      phone: phone || '',
      institution: institution || '',
      department: department || '',
      qualification: qualification || '',
      rollNumber: rollNumber || '',
      gender: gender || '',
      interests: interests || (role === 'student' ? ['Java', 'Python', 'DSA'] : [])
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      teacherCode: user.teacherCode,
      connectedTeacherId: user.connectedTeacherId,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration: ' + error.message });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body || {};
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      return res.status(400).json({ message: 'Please enter email and password.' });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ message: 'No account found with this email. Please verify your email or click Register.' });
    }

    const isMatch = await bcrypt.compare(cleanPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password. Please verify your password and try again.' });
    }

    // Ensure teacher code exists if role is teacher
    if (user.role === 'teacher' && !user.teacherCode) {
      user.teacherCode = await generateUniqueTeacherCode();
      await user.save();
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      teacherCode: user.teacherCode,
      connectedTeacherId: user.connectedTeacherId,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login: ' + error.message });
  }
};

// Get profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('connectedTeacherId', 'name email teacherCode institution department');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile: ' + error.message });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'teacher') {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      user.institution = req.body.institution !== undefined ? req.body.institution : user.institution;
      user.department = req.body.department !== undefined ? req.body.department : user.department;
      user.qualification = req.body.qualification !== undefined ? req.body.qualification : user.qualification;
    } else if (user.role === 'student') {
      user.name = req.body.name || user.name;
      user.rollNumber = req.body.rollNumber !== undefined ? req.body.rollNumber : user.rollNumber;
      user.institution = req.body.institution !== undefined ? req.body.institution : user.institution;
      user.department = req.body.department !== undefined ? req.body.department : user.department;
      user.gender = req.body.gender !== undefined ? req.body.gender : user.gender;
      if (req.body.interests) {
        user.interests = req.body.interests;
      }
    }

    const updatedUser = await user.save();
    const result = await User.findById(updatedUser._id).select('-password').populate('connectedTeacherId', 'name email teacherCode institution department');
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile: ' + error.message });
  }
};

// Student connects to teacher using teacher code
exports.connectTeacher = async (req, res) => {
  try {
    const { teacherCode } = req.body;
    if (!teacherCode) {
      return res.status(400).json({ message: 'Teacher code is required' });
    }

    const teacher = await User.findOne({ teacherCode: teacherCode.trim().toUpperCase(), role: 'teacher' });
    if (!teacher) {
      return res.status(400).json({ message: 'Invalid or non-existing Teacher Code. Please verify the 8-digit code provided by your teacher.' });
    }

    const student = await User.findById(req.user._id);
    student.connectedTeacherId = teacher._id;
    await student.save();

    res.json({
      message: `Successfully connected to Teacher ${teacher.name}`,
      connectedTeacher: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        teacherCode: teacher.teacherCode,
        institution: teacher.institution,
        department: teacher.department
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error connecting to teacher: ' + error.message });
  }
};
