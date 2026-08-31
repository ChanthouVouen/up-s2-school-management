import React from 'react';

const AvatarPlaceholder = ({ name }: { name: string }) => {
  const getInitials = (fullName: string) => {
    if (!fullName) return '?';
    const names = fullName.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const getColorFromName = (str: string) => {
    if (!str) return '#ccc';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 65%, 55%)`; // 65% saturation, 55% lightness
  };

  const initials = getInitials(name);
  const backgroundColor = getColorFromName(name);

  const avatarStyle: React.CSSProperties = {
    backgroundColor,
  };

  return (
    <div style={avatarStyle} className='w-[32px] h-[32px] flex items-center justify-center text-white text-[12px] font-bold rounded-3xl uppercase' aria-label={name}>
      {initials}
    </div>
  );
};

export default AvatarPlaceholder;
