import { Dayjs } from "dayjs";

export type Player = {
  name: string;
  head: string;
  hair: string;
  race: string;
  isMale: number;
  stats: {
    baseHealth: number;
    currentHealth: number;
    baseMagicka: number;
    currentMagicka: number;
    baseFatigue: number;
    currentFatigue: number;
    level: number;
  };
  location: {
    cell: string;
    posX: number;
    posY: number;
    posZ: number;
    previousX: number;
    previousY: number;
    previousZ: number;
    regionName: string;
  };
  lastSeen: Dayjs;
};

export type MorrowindLocation = {
  id: number;
  worldId: number;
  revisionId: number;
  destinationId: number;
  locType: number;
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  description: string;
  iconType: number;
  displayData: string;
  wikiPage: string;
  displayLevel: number;
  visible: number;
};
