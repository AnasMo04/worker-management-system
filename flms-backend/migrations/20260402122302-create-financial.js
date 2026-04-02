'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Financials', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
     Sponsor_ID: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Sponsors',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // باش ما يخليكش تمسح كفيل عنده معاملات مالية مسجلة
      },
     Worker_ID: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Workers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      Amount: {
        type: Sequelize.DECIMAL
      },
      Service_Type: {
        type: Sequelize.STRING
      },
      Payment_Gateway_Ref: {
        type: Sequelize.STRING
      },
      Status: {
        type: Sequelize.STRING
      },
      Date: {
        type: Sequelize.DATE
      },
      Created_By: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      Notes: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('Financials');
  }
};