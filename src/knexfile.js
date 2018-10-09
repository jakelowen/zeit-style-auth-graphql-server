// Update with your config settings.
const pg = require("pg");
// needed for heroku connection via SSL with knex
if (process.env.NODE_ENV === "production") {
  pg.defaults.ssl = true;
}

module.exports = {
  development: {
    client: "postgresql",
    connection: {
      database: "graphql_auth_starter_dev"
    },
    migrations: {
      tableName: "knex_migrations"
    }
  },

  test: {
    client: "postgresql",
    connection: {
      user: "postgres",
      password: "",
      database: "zeit_style_gql_starter_test"
    },
    migrations: {
      tableName: "knex_migrations"
    }
  },

  production: {
    client: "postgresql",
    connection: process.env.DATABASE_URL,
    migrations: {
      tableName: "knex_migrations"
    }
  }
};
