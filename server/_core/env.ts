// Platform values are read at use time. See the Webdev service/authentication skills.
export const ENV = {
  get appId() { return process.env.MANUS_PROJECT_ID ?? ""; },
  get cookieSecret() { return process.env.MANUS_JWT_SECRET ?? ""; },
  get databaseUrl() { return process.env.DATABASE_URL ?? ""; },
  get oAuthServerUrl() { return process.env.MANUS_OAUTH_API_URL ?? ""; },
  // Preserve the legacy hint when supplied; otherwise roles remain application data.
  get ownerOpenId() { return process.env.OWNER_OPEN_ID ?? ""; },
  // E-mails são identificadores públicos de conta, não credenciais. O OAuth Manus continua responsável pelas senhas e sessões.
  get adminEmails() {
    return (process.env.LIMERGESSO_ADMIN_EMAILS ?? "manfrediluccas07@yahoo.com,ademirfelizattijr@gmail.com,luccas.manfredi2@edu.senai.br")
      .split(",")
      .map(email => email.trim().toLowerCase())
      .filter(Boolean);
  },
  get isProduction() { return process.env.NODE_ENV === "production"; },
  get forgeApiUrl() { return process.env.MANUS_API_URL ?? ""; },
  get forgeApiKey() { return process.env.MANUS_API_KEY ?? ""; },
};
