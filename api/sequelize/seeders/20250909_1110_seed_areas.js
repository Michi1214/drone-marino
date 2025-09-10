"use strict";
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert("areas", [
      {
        id: Sequelize.literal("gen_random_uuid()"),
        name: "Area Porto",
        lat1: 45.420, lon1: 12.300,
        lat2: 45.430, lon2: 12.320,
        validFrom: null, validTo: null
      }
    ]);
  },
  async down (queryInterface) {
    await queryInterface.bulkDelete("areas", null, {});
  }
};
