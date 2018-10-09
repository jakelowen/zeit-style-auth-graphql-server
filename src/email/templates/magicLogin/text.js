export default (url, securityCode) => `
Someone (hopefully you) has requested to log in to our website. If you did not request to login, you can safely ignore this email.

Very that your security code listed on the website was "${securityCode}". If it matches, please continue your login by clicking <a href="${url}">here</a>
`;
