import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';

import { CatIconLib } from '@/src/data/categories';

export function CategoryIcon({
  icon,
  lib,
  size,
  color,
}: {
  icon: string;
  lib: CatIconLib;
  size: number;
  color: string;
}) {
  if (lib === 'mci') {
    return <MaterialCommunityIcons name={icon as any} size={size} color={color} />;
  }
  return <Feather name={icon as any} size={size} color={color} />;
}
