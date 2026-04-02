'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Devices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      User_ID: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users', // اسم جدول المستخدمين في قاعدة البيانات
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' 
      },
      Device_Type: {
        type: Sequelize.STRING
      },
      Model: {
        type: Sequelize.STRING
      },
      OS_Version: {
        type: Sequelize.STRING
      },
      Last_Sync_Time: {
        type: Sequelize.DATE
      },
      Is_Active: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Devices');
  }
};