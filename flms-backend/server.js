const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const pool = require('./db');
require('dotenv').config();

const app = express();

// إعدادات أساسية لعمل السيرفر
app.use(cors()); // للسماح للواجهة الأمامية بالتواصل مع السيرفر
app.use(express.json()); // لكي يفهم السيرفر البيانات المرسلة بصيغة JSON

// مسار فحص عمل السيرفر
app.get('/', (req, res) => {
    res.send('Welcome! FLMS System Server is running successfully.');
});

// مسار (API) تسجيل الدخول
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    // 1. التحقق من أن المستخدم أدخل البيانات
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Please enter both username and password.' });
    }

    try {
        // 2. البحث عن المستخدم في قاعدة البيانات
        const [rows] = await pool.execute(
            'SELECT * FROM Users WHERE Username = ?',
            [username]
        );

        const user = rows[0];

        // 3. التحقق من وجود المستخدم
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid username.' });
        }

        // 4. التحقق من أن الحساب مفعل
        if (user.IsActive === 0) {
            return res.status(403).json({ success: false, message: 'This account is inactive. Please contact administration.' });
        }

        // 5. مقارنة كلمة المرور
        let isMatch = false;
        
        // إذا كانت الكلمة في الداتا بيز مشفرة (تبدأ بـ $2) نفحصها بـ bcrypt
        if (user.Password_Hash && user.Password_Hash.startsWith('$2')) {
            isMatch = await bcrypt.compare(password, user.Password_Hash);
        } else {
            // وإلا نفحصها كنص عادي (لغرض التجربة الحالية فقط)
            isMatch = (password === user.Password_Hash);
        }

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid password.' });
        }

        // 6. إذا كان كل شيء صحيحاً (تسجيل دخول ناجح)
        res.status(200).json({
            success: true,
            message: 'Login successful!',
            userData: {
                id: user.User_ID,
                name: user.Name,
                role: user.Role
            }
        });

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error. Please try again later.' });
    }
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(` Server is running successfully on: http://localhost:${PORT}`);
});