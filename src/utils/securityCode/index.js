import { sample, uniq } from "lodash";
import { adjectives, nouns } from "./vocab";

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

export default () => {
  const noun = sample(uniq(nouns));
  const adjective = sample(uniq(adjectives));
  const number = getRandomInt(99) + 1;
  return `${number} ${adjective} ${noun}`;
};
