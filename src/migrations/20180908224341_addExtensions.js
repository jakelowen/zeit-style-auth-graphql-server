// const knex = require("knex");

exports.up = knex =>
  Promise.all([
    // setup uuid extension
    knex.raw('create extension if not exists "uuid-ossp"'),
    // setup ltree extension
    knex.raw('CREATE EXTENSION IF NOT EXISTS "ltree"')
  ]);

exports.down = knex =>
  Promise.all([
    // remove uuid extension
    knex.raw('drop extension if exists "uuid-ossp" CASCADE'),
    // remove ltree extension
    knex.raw('drop extension if exists "ltree" CASCADE')
  ]);
