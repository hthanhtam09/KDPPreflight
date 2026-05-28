'use client';

import * as THREE from 'three';
import type { CoverTextures, Preview3DOverlays, Preview3DState } from '../BookPreview3D';
import PhysicalBook from './PhysicalBook';

interface HardcoverBookProps {
  trimWidth: number;
  trimHeight: number;
  spineWidth: number;
  pageCount: number;
  currentPage: number;
  bookPose: Preview3DState['bookPose'];
  flipProgress: number;
  isFlipping: boolean;
  isFlippingForward: boolean;
  pageTextures: Map<number, THREE.Texture | null>;
  coverTextures: CoverTextures;
  coverFinish?: 'matte' | 'glossy';
  bleedEnabled: boolean;
  overlays: Preview3DOverlays;
  safeInset: number;
}

export default function HardcoverBook(props: HardcoverBookProps) {
  return <PhysicalBook {...props} pose={props.bookPose} variant="hardcover" />;
}
