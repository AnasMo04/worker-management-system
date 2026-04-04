'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Sponsors', 'Commercial_Reg_Copy', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Sponsors', 'Tax_Cert_Copy', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Sponsors', 'License_Copy', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Sponsors', 'Auth_Letter_Copy', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Sponsors', 'Commercial_Reg_Copy');
    await queryInterface.removeColumn('Sponsors', 'Tax_Cert_Copy');
    await queryInterface.removeColumn('Sponsors', 'License_Copy');
    await queryInterface.removeColumn('Sponsors', 'Auth_Letter_Copy');
  }
};
