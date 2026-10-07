export const siteConfig = {
  operatorName: process.env.NEXT_PUBLIC_OPERATOR_NAME?.trim() || '',
  operatorAddress: process.env.NEXT_PUBLIC_OPERATOR_ADDRESS?.trim() || '',
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || '',
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim() || '',
};

export const hasHumanSupportChannel = Boolean(siteConfig.supportEmail || siteConfig.supportPhone);
export const hasOperatorIdentity = Boolean(siteConfig.operatorName && siteConfig.operatorAddress);
