'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('Workers');
    if (!tableInfo.fingerprint_template) {
      await queryInterface.addColumn('Workers', 'fingerprint_template', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Workers', 'fingerprint_template');
  }
};
