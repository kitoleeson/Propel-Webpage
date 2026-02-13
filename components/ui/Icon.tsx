import React from 'react'

import Instagram from "@/icons/instagram.svg";
import Facebook from "@/icons/facebook.svg";
import Twitter from "@/icons/twitter.svg";

const icons = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
};

type IconName = keyof typeof icons;

export default function Icon({ name, className }: { name: IconName; className?: string }) {
  const IconComponent = icons[name];
  return <IconComponent className={className} />;
}