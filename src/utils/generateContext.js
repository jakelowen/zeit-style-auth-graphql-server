import sendEmail from "../email/connectors/sendEmail";
import loadUser from "./tokenOps";

export default async req => ({
  connectors: { sendEmail },
  user: await loadUser(req)
});
