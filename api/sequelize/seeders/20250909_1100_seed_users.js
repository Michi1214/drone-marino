"use strict";
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert("users", [
      { id: Sequelize.literal("gen_random_uuid()"), email: "user1@example.com", role: "user", tokens: 10 },
      { id: Sequelize.literal("gen_random_uuid()"), email: "op1@example.com", role: "operator", tokens: 0 },
      { id: Sequelize.literal("gen_random_uuid()"), email: "admin@example.com", role: "admin", tokens: 0 }
    ]);
  },
  async down (queryInterface) {
    await queryInterface.bulkDelete("users", null, {});
  }
};
