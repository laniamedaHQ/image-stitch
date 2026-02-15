export interface CropRegion {
  id: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  width: number; // Percentage 0-100
  height: number; // Percentage 0-100
  isLocked: boolean;
  replacementSrc: string | null; // DataURL of the external edit
  isStitched: boolean;
}

export interface ImageLayer {
  id: string;
  groupId?: string; // If present, this layer belongs to a group
  name: string;
  src: string; // Original Image DataURL
  width: number; // Original pixel width
  height: number; // Original pixel height
  crops: CropRegion[];
}

export interface AssetGroup {
  id: string;
  name: string;
  layerIds: string[]; // Ordered list of layers in this group
  crops: CropRegion[]; // Crops applied to the stitched result
  parentGroupId?: string; // For nested subgroups
}

export interface StitchItem {
  id: string;
  layerId: string; // Can be Layer ID or Group ID
  cropId: string;
}