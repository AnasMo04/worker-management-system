'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Workers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Sponsor_ID: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Sponsors', // اسم جدول الكفلاء في قاعدة البيانات
          key: 'id'          // المفتاح الأساسي اللي بنربطوا بيه
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // باش يمنع حذف أي كفيل لو عنده عمال مسجلين
      },
      Passport_Number: {
        type: Sequelize.STRING
      },
      National_ID: {
        type: Sequelize.STRING
      },
      Full_Name: {
        type: Sequelize.STRING
      },
      Nationality: {
        type: Sequelize.STRING
      },
      Birth_Date: {
        type: Sequelize.DATEONLY
      },
      Job_Title: {
        type: Sequelize.STRING
      },
      Current_Status: {
        type: Sequelize.STRING
      },
      NFC_UID: {
        type: Sequelize.STRING
      },
      Primary_Card_Serial: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Workers');
  }
};