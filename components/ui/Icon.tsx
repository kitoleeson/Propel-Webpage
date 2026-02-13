"use client";

import Instagram from "@/icons/instagram.svg";
import Email from "@/icons/email.svg";

const icons = {
   instagram: Instagram,
   email: Email,
};

type IconName = keyof typeof icons;

export default function Icon({ name, className }: { name: IconName; className?: string }) {
   const IconComponent = icons[name];
   return <IconComponent className={`inline-block ${className}`} />;
}