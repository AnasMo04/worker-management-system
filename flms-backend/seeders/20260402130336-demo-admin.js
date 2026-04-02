'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up (queryInterface, Sequelize) {
    // هنا بنشفروا الباسورد 'admin123' باش يتخزن بطريقة آمنة
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // هنا بنقولوله ضيف البيانات هادي لجدول الـ Users
    await queryInterface.bulkInsert('Users', [{
      Name: 'أنس - مدير النظام',
      Username: 'admin',
      Password_Hash: hashedPassword,
      Role: 'Admin',
      Email: 'admin@flms.com',
      Phone: '0910000000',
      IsActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    // هادي وظيفتها تمسح البيانات لو قررنا نديروا تراجع (Undo)
    await queryInterface.bulkDelete('Users', { Username: 'admin' }, {});
  }
};