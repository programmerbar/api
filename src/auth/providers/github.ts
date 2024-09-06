import { GitHub } from "arctic";
import { AppContext } from "../../hono/app";
import { ProviderUser } from "./types";

export const baseGitHubUrl = "https://api.github.com";
export const userInfoEndpoint = `${baseGitHubUrl}/user`;
export const userEmailsEndpoint = `${baseGitHubUrl}/user/emails`;

export const createGitHubProvider = (c: AppContext) => {
  return new GitHub(c.env.GITHUB_CLIENT_ID, c.env.GITHUB_CLIENT_SECRET, {
    redirectURI: c.env.GITHUB_REDIRECT_URI,
  });
};

const getUserInfo = async (accessToken: string) => {
  const response = await fetch(userInfoEndpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "programmerbar-api",
    },
  });

  return response.json() as Promise<{ id: number; login: string }>;
};

const getUserEmail = async (accessToken: string): Promise<string | null> => {
  const response = await fetch(userEmailsEndpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "programmerbar-api",
    },
  });

  const emails = (await response.json()) as Array<{
    email: string;
    primary: boolean;
    verified: boolean;
  }>;

  return emails.find((email) => email.primary)?.email ?? null;
};

export const getGitHubUser = async (accessToken: string): Promise<ProviderUser> => {
  const [userInfo, userEmail] = await Promise.all([
    getUserInfo(accessToken),
    getUserEmail(accessToken),
  ]);

  if (!userEmail) {
    throw new Error("Could not find email");
  }

  return {
    id: String(userInfo.id),
    username: userInfo.login,
    email: userEmail,
  };
};
