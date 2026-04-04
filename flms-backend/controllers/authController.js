const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // استدعاء جدول المستخدمين

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. نبحثوا على المستخدم في قاعدة البيانات
    const user = await User.findOne({ where: { Username: username } });
    
    if (!user) {
      return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    // 2. نقارنوا الباسورد اللي انكتب بالباسورد المشفر في القاعدة
    const isMatch = await bcrypt.compare(password, user.Password_Hash);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    // 3. نتأكدوا إن الحساب مش موقوف
    if (!user.IsActive) {
      return res.status(403).json({ message: 'هذا الحساب موقوف، راجع الإدارة' });
    }

    // 4. نصنعوا التوكن (Token) باش يقعد مسجل دخول
    const token = jwt.sign(
      { id: user.id, role: user.Role },
      process.env.JWT_SECRET || 'Flms_Secret_Key_2026_Top_Secret', // يفضل تحطها في ملف .env
      { expiresIn: '12h' } // التوكن يكمل بعد 12 ساعة
    );

    // 5. نبعتوا الرد للواجهة بالنجاح
    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token: token,
      user: {
        id: user.id,
        name: user.Name,
        username: user.Username,
        role: user.Role
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
};