import type { StaticImageData } from "next/image";

// WhyChooseUs icons
import analyticsIcon from "../../public/whychooseus/analytics.svg";
import themesIcon from "../../public/whychooseus/themes.svg";
import communityIcon from "../../public/whychooseus/community.svg";
import readerAuthorIcon from "../../public/whychooseus/reader-author.svg";
import automationIcon from "../../public/whychooseus/automation.svg";
import securityIcon from "../../public/whychooseus/security.svg";
import checkedIcon from "../../public/whychooseus/checked.png";

// Features icons & backgrounds
import aiIcon from "../../public/features/ai.svg";
import messageIcon from "../../public/features/message.svg";
import readermodeIcon from "../../public/features/readermode.svg";
import mindmapIcon from "../../public/features/mindmap.svg";
import researchIcon from "../../public/features/research.svg";
import communityFeatureIcon from "../../public/features/community.svg";
import accessibilityIcon from "../../public/features/accessibility.svg";
import lcsIcon from "../../public/features/lcs.svg";
import friendsIcon from "../../public/features/friends.svg";
import readermodeBg from "../../public/features/readermode-bg.png";
import mindmapBg from "../../public/features/mindmap-bg.png";
import researchBg from "../../public/features/researching-bg.png";
import communityBg from "../../public/features/community-bg.png";
import accessibilityBg from "../../public/features/accessibility-bg.png";
import lcsBg from "../../public/features/lcs-bg.png";
import friendsBg from "../../public/features/friends-bg.png";
import aiBg from "../../public/features/ai-bg.png";
import messageBg from "../../public/features/message-bg.png";

// Benefits backgrounds
import card1Bg from "../../public/benefits/card-1.svg";
import card2Bg from "../../public/benefits/card-2.svg";
import card3Bg from "../../public/benefits/card-3.svg";
import card4Bg from "../../public/benefits/card-4.svg";
import card5Bg from "../../public/benefits/card-5.svg";

// General images
import nepLoomRedLogo from "../../public/NepLoomRed.svg";
import nepLoomLogo from "../../public/NepLoom.svg";
import nepLoomAbstract from "../../public/NepLoomAbstract.svg";
import knowledgeSphere from "../../public/knowledgesphere.png";
import pricingStars from "../../public/pricing/stars.svg";
import expandKnowledgeImage from "../../public/landing/expandyourknowledge.png";
import uploadingLoomImage from "../../public/landing/uploadingtheloom.png";
import placeholderSvg from "../../public/placeholder.svg";
import placeholderLoomer from "../../public/placeholder-loomer.jpg";

// Design/decoration
import gradientImage from "../../public/gradient.png";
import playSvg from "../../public/play.svg";
import curve1Svg from "../../public/collaboration/curve-1.svg";
import curve2Svg from "../../public/collaboration/curve-2.svg";

// Auth images
import log from "../../public/auth/log.svg";
import reg from "../../public/auth/register.svg";

// Additional benefits image
import defaultImageBg from "../../public/benefits/image-2.png";

// Mapping objects for icon lookups
export const collabIconMap: Record<string, StaticImageData> = {
  "/whychooseus/analytics.svg": analyticsIcon,
  "/whychooseus/themes.svg": themesIcon,
  "/whychooseus/community.svg": communityIcon,
  "/whychooseus/reader-author.svg": readerAuthorIcon,
  "/whychooseus/automation.svg": automationIcon,
  "/whychooseus/security.svg": securityIcon,
  "/features/ai.svg": aiIcon,
  "/features/message.svg": messageIcon,
};

export const benefitsIconMap: Record<string, StaticImageData> = {
  "/features/readermode.svg": readermodeIcon,
  "/features/mindmap.svg": mindmapIcon,
  "/features/research.svg": researchIcon,
  "/features/community.svg": communityFeatureIcon,
  "/features/accessibility.svg": accessibilityIcon,
  "/features/lcs.svg": lcsIcon,
  "/features/friends.svg": friendsIcon,
  "/features/ai.svg": aiIcon,
  "/features/message.svg": messageIcon,
};

export const benefitsBackgroundMap: Record<string, StaticImageData> = {
  "/benefits/card-1.svg": card1Bg,
  "/benefits/card-2.svg": card2Bg,
  "/benefits/card-3.svg": card3Bg,
  "/benefits/card-4.svg": card4Bg,
  "/benefits/card-5.svg": card5Bg,
};

export const featuresBackgroundMap: Record<string, StaticImageData> = {
  "/features/readermode-bg.png": readermodeBg,
  "/features/mindmap-bg.png": mindmapBg,
  "/features/researching-bg.png": researchBg,
  "/features/community-bg.png": communityBg,
  "/features/accessibility-bg.png": accessibilityBg,
  "/features/lcs-bg.png": lcsBg,
  "/features/friends-bg.png": friendsBg,
  "/features/ai-bg.png": aiBg,
  "/features/message-bg.png": messageBg,
  "/benefits/image-2.png": defaultImageBg,
};

// Export all individual images as needed
export {
  analyticsIcon,
  themesIcon,
  communityIcon,
  readerAuthorIcon,
  automationIcon,
  securityIcon,
  checkedIcon,
  aiIcon,
  messageIcon,
  readermodeIcon,
  mindmapIcon,
  researchIcon,
  communityFeatureIcon,
  accessibilityIcon,
  lcsIcon,
  friendsIcon,
  readermodeBg,
  mindmapBg,
  researchBg,
  communityBg,
  accessibilityBg,
  lcsBg,
  friendsBg,
  aiBg,
  messageBg,
  card1Bg,
  card2Bg,
  card3Bg,
  card4Bg,
  card5Bg,
  nepLoomRedLogo,
  nepLoomLogo,
  nepLoomAbstract,
  knowledgeSphere,
  pricingStars,
  expandKnowledgeImage,
  uploadingLoomImage,
  placeholderSvg,
  placeholderLoomer,
  gradientImage,
  playSvg,
  curve1Svg,
  curve2Svg,
  log,
  reg,
  defaultImageBg,
};
