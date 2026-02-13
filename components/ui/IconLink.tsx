"use client";

import Icon from '@components/ui/Icon';

type IconLinkProps = {
   iconName: 'instagram' | 'email';
   href: string;
   label: string;
   className?: string;
};

export default function IconLink({ iconName, href, label, className="" }: IconLinkProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={`group inline-flex items-center justify-center p-2 transition-colors duration-200 ${className}`}>
      <Icon name={iconName} className={`w-6 h-6 transition-transform group-hover:scale-110`} />
    </a>
  );
}