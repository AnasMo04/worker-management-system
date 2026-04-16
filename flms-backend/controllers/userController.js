const { User } = require('../models');
const bcrypt = require('bcryptjs');

exports.getAll = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['Password_Hash'] }
    });
    res.json(users);
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({ message: 'Error retrieving users' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['Password_Hash'] }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get User By ID Error:', error);
    res.status(500).json({ message: 'Error retrieving user' });
  }
};

exports.create = async (req, res) => {
  try {
    const { Name, Username, Password, Role, Email, Phone, IsActive, Permissions } = req.body;

    const existingUser = await User.findOne({ where: { Username } });
    if (existingUser) {
      return res.status(400).json({ message: 'اسم المستخدم مسجل مسبقاً' });
    }

    const salt = await bcrypt.genSalt(10);
    const Password_Hash = await bcrypt.hash(Password, salt);

    const newUser = await User.create({
      Name,
      Username,
      Password_Hash,
      Role,
      Email,
      Phone,
      IsActive: IsActive !== undefined ? IsActive : true,
      Permissions: Permissions || {}
    });

    const userResponse = newUser.toJSON();
    delete userResponse.Password_Hash;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Create User Error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, Username, Password, Role, Email, Phone, IsActive, Permissions } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (Username && Username !== user.Username) {
      const existingUser = await User.findOne({ where: { Username } });
      if (existingUser) {
        return res.status(400).json({ message: 'اسم المستخدم مسجل مسبقاً' });
      }
    }

    const updateData = {
      Name,
      Username,
      Role,
      Email,
      Phone,
      IsActive,
      Permissions
    };

    if (Password) {
      const salt = await bcrypt.genSalt(10);
      updateData.Password_Hash = await bcrypt.hash(Password, salt);
    }

    await user.update(updateData);

    const userResponse = user.toJSON();
    delete userResponse.Password_Hash;

    res.json(userResponse);
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deleting yourself
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'لا يمكنك حذف حسابك الخاص' });
    }

    await user.destroy();
    res.json({ message: 'تم حذف المستخدم بنجاح' });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};
