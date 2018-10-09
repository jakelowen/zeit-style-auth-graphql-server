// const knex = require("knex");

exports.up = knex =>
  Promise.all([
    // user table
    knex.schema.createTable("users", t => {
      t.string("id")
        .defaultTo(knex.raw("uuid_generate_v4()"))
        .primary();

      t.dateTime("createdAt").defaultTo(knex.raw("now()"));
      t.dateTime("updatedAt").nullable();
      t.dateTime("deletedAt").nullable();

      t.string("firstName");
      t.string("lastName");
      t.string("email").notNullable();

      t.string("permission");
    })
  ]);

exports.down = knex =>
  Promise.all([
    // remove user table
    knex.schema.dropTable("users")
  ]);
