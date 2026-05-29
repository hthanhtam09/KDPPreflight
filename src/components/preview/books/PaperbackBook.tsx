'use client';

import * as THREE from 'three';
import type { CoverTextures, Preview3DOverlays, Preview3DState } from '../BookPreview3D';
import type { PaperType } from '@/types/kdp';
import PhysicalBook from './PhysicalBook';

interface PaperbackBookProps {
  trimWidth: number;
  trimHeight: number;
  spineWidth: number;
  pageCount: number;
  currentPage: number;
  targetPage: number | null;
  bookPose: Preview3DState['bookPose'];
  flipProgress: number;
  isFlipping: boolean;
  isFlippingForward: boolean;
  pageTextures: Map<number, THREE.Texture | null>;
  coverTextures: CoverTextures;
  coverFinish?: 'matte' | 'glossy';
  paperType: PaperType;
  bleedEnabled: boolean;
  overlays: Preview3DOverlays;
  safeInset: number;
}

export default function PaperbackBook(props: PaperbackBookProps) {
  return <PhysicalBook {...props} pose={props.bookPose} variant="paperback" />;
}
