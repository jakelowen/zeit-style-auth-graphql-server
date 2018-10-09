// import knexfile from "./knexfile";
import knex from "knex";
import knexfile from "./knexfile";

const environment = process.env.NODE_ENV || "development"; // if something else isn't setting ENV, use development

const configuration = knexfile[environment];

export default knex(configuration); // connect to DB via knex using env's settings
