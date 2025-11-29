import { avatars } from "./appwrite";
import { Flag } from "appwrite";

export const getCleanAvatar = (
  name: string,
  darkMode: boolean,
  size: number = 80
): string => {
  const initial = name.trim()[0]?.toUpperCase() || "U";

  const backgroundColor = darkMode ? "e5e5e5" : "2a2a2a";
  const avatarUrl = avatars.getInitials({
    name: initial,
    width: size,
    height: size,
    background: backgroundColor,
  });

  return avatarUrl.toString();
};

export const getProjectQR = (
  projectId: string,
  region: string,
  size: number = 200
): string => {
  const shareUrl = `https://cloud.appwrite.io/console/project-${region}-${projectId}`;

  const qrUrl = avatars.getQR({
    text: shareUrl,
    size: size,
    margin: 1,
  });

  return qrUrl.toString();
};

export const getRegionFlag = (
  region: string,
  width: number = 32,
  height: number = 32
): string => {
  const regionToFlag: Record<string, Flag> = {
    fra: Flag.Germany, // 🇩🇪 Frankfurt
    nyc: Flag.UnitedStates, // 🇺🇸 New York
    syd: Flag.Australia, // 🇦🇺 Sydney
    sfo: Flag.UnitedStates, // 🇺🇸 San Francisco
    sgp: Flag.Singapore, // 🇸🇬 Singapore
    tor: Flag.Canada, // 🇨🇦 Toronto
  };

  const flagCode = regionToFlag[region] || Flag.UnitedStates;

  const flagUrl = avatars.getFlag({
    code: flagCode,
    width: width,
    height: height,
  });

  return flagUrl.toString();
};

export const getSiteFavicon = (url: string): string => {
  const faviconUrl = avatars.getFavicon({ url });
  return faviconUrl.toString();
};
