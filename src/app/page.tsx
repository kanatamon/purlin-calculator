'use client';

import Decimal from 'decimal.js';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useController, useForm, UseFormReturn, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import invariant from 'tiny-invariant';
import { NumberField } from '@/components/number-field';
import { TextField } from '@/components/text-field';

const ALLOWABLE_DEFLECTIONS = ['120', '150', '180', '200', '240', '250', '300', '360'] as const;

type PileSection = [
  outDai: number,
  thickness: number,
  weight: number,
  sectArea: number,
  mOfIn: number,
  sectMod: number,
  radGyr: number
];

const pileSections: PileSection[] = [
  [21.7, 2.0, 0.972, 1.238, 0.607, 0.56, 0.7],
  [27.2, 2.0, 1.24, 1.583, 1.28, 0.93, 0.89],
  [27.2, 2.3, 1.41, 1.799, 1.41, 1.03, 0.88],
  [34.0, 2.3, 1.8, 2.291, 2.89, 1.7, 1.12],
  [42.7, 2.3, 2.29, 2.919, 5.97, 2.8, 1.43],
  [42.7, 2.8, 2.78, 3.51, 7.02, 3.29, 1.41],
  [48.6, 2.3, 2.63, 3.345, 8.99, 3.7, 1.64],
  [48.6, 2.8, 3.16, 4.029, 10.6, 4.36, 1.62],
  [48.6, 3.2, 3.58, 4.564, 11.8, 4.86, 1.61],
  [60.5, 2.3, 3.3, 4.205, 17.8, 5.9, 2.06],
  [60.5, 3.2, 4.52, 5.76, 23.7, 7.84, 2.03],
  [60.5, 4.0, 5.57, 7.1, 28.5, 9.41, 2.0],
  [78.3, 2.8, 5.08, 6.465, 43.7, 11.5, 2.6],
  [78.3, 3.2, 5.77, 7.349, 49.2, 12.9, 2.59],
  [78.3, 4.0, 7.13, 9.085, 59.5, 15.8, 2.56],
  [89.1, 2.8, 5.96, 7.591, 70.7, 15.9, 3.05],
  [89.1, 3.2, 6.78, 8.636, 79.8, 17.9, 3.04],
  [89.1, 4.0, 8.39, 10.69, 97.0, 21.8, 3.01],
  [101.6, 3.2, 7.76, 9.892, 120.0, 23.8, 3.48],
  [101.6, 4.0, 9.63, 12.26, 146.0, 28.8, 3.45],
  [101.6, 5.0, 11.9, 15.17, 177.0, 34.9, 3.42],
  [114.3, 3.2, 8.77, 11.17, 172.0, 30.2, 3.93],
  [114.3, 3.6, 9.83, 12.52, 192.0, 33.6, 3.92],
  [114.3, 4.5, 12.2, 15.52, 234.0, 41.0, 3.89],
  [114.3, 5.6, 15.0, 19.12, 283.0, 49.6, 3.85],
  [139.8, 3.6, 12.1, 15.4, 357.0, 51.1, 4.82],
  [139.8, 4.0, 13.4, 17.07, 394.0, 56.3, 4.8],
  [139.4, 4.5, 15.0, 19.13, 438.0, 62.7, 4.79],
  [139.4, 6.0, 19.8, 25.22, 566.0, 80.9, 4.74],
  [165.2, 4.5, 17.8, 22.72, 734.0, 88.9, 5.68],
  [165.2, 5.0, 19.8, 25.16, 808.0, 97.8, 5.67],
  [165.2, 6.0, 23.6, 30.01, 952.0, 115.0, 5.63],
  [165.2, 7.0, 27.3, 34.79, 1090.0, 132.0, 5.6],
  [190.7, 4.5, 20.7, 26.32, 1140.0, 120.0, 6.59],
  [190.7, 5.0, 22.9, 29.17, 1260.0, 132.0, 6.57],
  [190.7, 6.0, 27.3, 34.82, 1490.0, 156.0, 6.53],
  [190.7, 7.0, 31.7, 40.4, 1710.0, 179.0, 6.5],
];

type LightLipChannalSection = [
  size: string,
  d: number,
  b: number,
  c: number,
  thickness: number,
  weight: number,
  sectArea: number,
  ix: number,
  iy: number,
  zx: number,
  zy: number,
  rx: number,
  ry: number
];

const lightLipChannalSections: LightLipChannalSection[] = [
  ['60*30*10', 60.0, 30.0, 10.0, 2.3, 2.25, 2.872, 15.6, 3.32, 5.2, 1.71, 2.33, 1.07],
  ['75*45*15', 75.0, 45.0, 15.0, 2.3, 3.25, 4.137, 37.1, 11.8, 9.9, 4.24, 3.0, 1.69],
  ['100*50*20', 100.0, 50.0, 20.0, 2.3, 4.06, 5.172, 80.7, 19.0, 16.1, 6.06, 3.95, 1.92],
  ['100*50*20', 100.0, 50.0, 20.0, 3.2, 5.5, 7.007, 107.0, 24.5, 21.3, 7.81, 3.9, 1.87],
  ['125*50*20', 125.0, 50.0, 20.0, 2.3, 4.51, 5.747, 137.0, 20.6, 21.9, 6.22, 4.88, 1.89],
  ['125*50*20', 125.0, 50.0, 20.0, 3.2, 6.13, 7.807, 181.0, 26.6, 29.0, 8.02, 4.82, 1.85],
  ['150*50*20', 150.0, 50.0, 20.0, 2.3, 4.96, 6.322, 210.0, 21.9, 28.0, 6.33, 5.77, 1.86],
  ['150*50*20', 150.0, 50.0, 20.0, 3.2, 6.76, 8.607, 280.0, 28.3, 37.4, 8.19, 5.71, 1.81],
  ['150*65*20', 150.0, 65.0, 20.0, 2.3, 5.5, 7.012, 248.0, 41.1, 33.0, 9.37, 5.94, 2.42],
  ['150*55*20', 150.0, 55.0, 20.0, 3.2, 7.51, 9.57, 332.0, 53.8, 44.3, 12.2, 5.89, 2.37],
  ['150*75*20', 150.0, 75.0, 20.0, 3.2, 8.01, 10.21, 366.0, 76.4, 48.9, 15.3, 5.99, 2.74],
  ['150*75*20', 150.0, 75.0, 20.0, 4.0, 9.85, 12.55, 445.0, 91.0, 59.3, 18.2, 5.95, 2.69],
  ['200*75*20', 200.0, 75.0, 20.0, 3.2, 9.52, 12.13, 716.0, 84.1, 71.6, 15.8, 7.79, 2.67],
  ['200*75*20', 200.0, 75.0, 20.0, 4.0, 11.7, 14.95, 871.0, 100.0, 87.1, 18.9, 7.74, 2.62],
  ['250*75*25', 250.0, 75.0, 25.0, 4.5, 14.9, 18.92, 1690.0, 129.0, 135.0, 23.8, 9.44, 2.62],
];

type RectangularTubeSection = [
  size: string,
  d: number,
  b: number,
  thickness: number,
  weight: number,
  sectArea: number,
  ix: number,
  iy: number,
  zx: number,
  zy: number,
  rx: number,
  ry: number
];

const rectangularTubeSections: RectangularTubeSection[] = [
  ['25*25', 25.0, 25.0, 1.6, 1.12, 1.432, 1.28, 1.28, 1.02, 1.02, 0.34, 0.34],
  ['50*50', 50.0, 50.0, 1.6, 2.38, 3.032, 11.71, 11.71, 4.68, 4.68, 1.96, 1.96],
  ['50*25', 50.0, 25.0, 1.6, 1.75, 2.232, 7.02, 2.37, 2.81, 0.95, 1.77, 1.03],
  ['50*25', 50.0, 25.0, 2.3, 2.44, 3.102, 9.31, 3.1, 3.72, 1.24, 1.73, 1.0],
  ['60*30', 60.0, 30.0, 1.6, 2.13, 2.712, 12.49, 4.25, 4.16, 1.42, 2.15, 1.25],
  ['60*30', 60.0, 30.0, 2.3, 2.98, 3.792, 16.82, 5.65, 5.61, 1.88, 2.11, 1.22],
  ['75*45', 75.0, 45.0, 2.3, 4.06, 5.172, 38.86, 17.61, 10.36, 4.69, 2.74, 1.84],
  ['75*45', 75.0, 45.0, 3.2, 5.5, 7.007, 50.77, 22.81, 13.54, 6.08, 2.69, 1.8],
  ['90*45', 90.0, 45.0, 2.3, 4.6, 5.862, 60.98, 20.75, 13.55, 4.61, 3.23, 1.88],
  ['90*45', 90.0, 45.0, 3.2, 6.25, 7.967, 80.24, 27.01, 17.83, 6.0, 3.17, 1.84],
  ['100*50', 100.0, 50.0, 2.3, 5.14, 6.552, 84.83, 28.95, 16.97, 5.79, 3.6, 2.1],
  ['100*50', 100.0, 50.0, 3.2, 7.01, 8.927, 112.29, 37.95, 22.46, 7.59, 3.55, 2.06],
  ['125*40', 125.0, 40.0, 2.3, 5.69, 7.242, 130.92, 21.64, 20.95, 3.46, 4.25, 1.73],
  ['125*40', 125.0, 40.0, 3.2, 7.16, 9.887, 173.84, 28.19, 27.81, 4.51, 4.19, 1.69],
  ['125*75', 125.0, 75.0, 3.2, 9.52, 12.127, 256.93, 116.8, 41.11, 18.69, 4.6, 3.1],
  ['125*75', 125.0, 75.0, 4.0, 11.73, 14.948, 310.76, 140.65, 49.72, 22.5, 4.56, 3.07],
  ['150*80', 150.0, 80.0, 4.5, 15.2, 19.369, 562.76, 211.47, 75.03, 28.2, 5.39, 3.3],
  ['150*80', 150.0, 80.0, 6.0, 19.81, 25.233, 710.2, 264.42, 94.69, 35.26, 5.31, 3.24],
  ['150*100', 150.0, 100.0, 4.5, 16.62, 21.169, 658.06, 351.96, 87.74, 46.93, 5.58, 4.08],
  ['150*100', 150.0, 100.0, 6.0, 21.69, 27.633, 834.68, 444.19, 111.29, 59.23, 5.5, 4.01],
  ['200*100', 200.0, 100.0, 4.5, 20.15, 25.669, 1331.44, 454.64, 133.14, 45.46, 7.2, 4.21],
  ['200*100', 200.0, 100.0, 6.0, 26.4, 33.633, 1703.3, 576.91, 170.33, 57.69, 7.12, 4.14],
];

type LightChannelSection = [
  size: string,
  d: number,
  b: number,
  tw: number,
  tf: number,
  weight: number,
  sectArea: number,
  ix: number,
  iy: number,
  zx: number,
  zy: number,
  rx: number,
  ry: number
];

const lightChannelSections: LightChannelSection[] = [
  ['75*40', 75.0, 40.0, 5.0, 7.0, 6.92, 8.82, 75.9, 12.4, 20.2, 4.54, 2.93, 1.19],
  ['100*50', 100.0, 50.0, 5.0, 7.5, 9.36, 11.92, 189.0, 26.9, 37.8, 7.82, 3.98, 1.5],
  ['125*65', 125.0, 65.0, 6.0, 8.0, 13.4, 17.11, 425.0, 65.5, 68.0, 14.4, 4.99, 1.96],
  ['150*75', 150.0, 75.0, 6.5, 10.0, 18.6, 23.71, 864.0, 122.0, 115.0, 23.6, 6.04, 2.27],
  ['150*75', 150.0, 75.0, 9.0, 12.5, 24.0, 30.59, 1050.0, 147.0, 140.0, 28.3, 5.86, 2.19],
  ['180*75', 180.0, 75.0, 7.0, 10.5, 21.4, 27.2, 1380.0, 137.0, 154.0, 25.5, 7.13, 2.24],
  ['200*70', 200.0, 70.0, 7.0, 10.0, 21.1, 26.92, 1620.0, 113.0, 162.0, 21.8, 7.77, 2.04],
  ['200*80', 200.0, 80.0, 7.5, 11.0, 24.6, 31.33, 1950.0, 177.0, 195.0, 30.8, 7.89, 2.38],
  ['200*90', 200.0, 90.0, 8.0, 13.5, 30.3, 38.65, 2490.0, 286.0, 249.0, 45.9, 8.03, 2.72],
  ['250*90', 250.0, 90.0, 9.0, 13.0, 34.6, 44.07, 4180.0, 306.0, 335.0, 46.5, 9.74, 2.64],
  ['250*90', 250.0, 90.0, 11.0, 14.5, 40.2, 51.17, 4690.0, 342.0, 375.0, 51.7, 9.57, 2.58],
  ['300*90', 300.0, 90.0, 9.0, 13.0, 38.1, 48.57, 6440.0, 325.0, 429.0, 48.0, 11.5, 2.59],
  ['300*90', 300.0, 90.0, 10.0, 15.5, 43.8, 55.74, 7440.0, 373.0, 494.0, 56.0, 11.5, 2.59],
  ['300*90', 300.0, 90.0, 12.0, 16.0, 48.6, 61.9, 7870.0, 391.0, 525.0, 57.9, 11.3, 2.51],
  ['380*100', 380.0, 100.0, 10.5, 16.0, 54.5, 69.39, 14500.0, 557.0, 762.0, 73.3, 14.5, 2.83],
  ['380*100', 380.0, 100.0, 13.0, 16.5, 62.0, 78.96, 15600.0, 584.0, 822.0, 75.8, 14.1, 2.72],
  ['380*100', 380.0, 100.0, 13.0, 20.0, 67.3, 85.71, 17600.0, 671.0, 924.0, 89.5, 14.3, 2.8],
];

type ISection = [
  size: string,
  d: number,
  b: number,
  tw: number,
  tf: number,
  weight: number,
  sectArea: number,
  mOfInIx: number,
  mOfInIy: number,
  sectModZx: number,
  sectModZy: number,
  radGryRx: number,
  radGryRy: number
];

const iSections: ISection[] = [
  ['80*42', 80.0, 42.0, 3.9, 5.9, 5.94, 7.57, 77.8, 6.29, 19.5, 3.0, 3.2, 0.91],
  ['100*50', 100.0, 50.0, 4.5, 6.8, 8.34, 10.6, 171.0, 12.2, 34.2, 4.88, 4.01, 1.07],
  ['120*58', 120.0, 58.0, 5.1, 7.7, 11.1, 14.2, 323.0, 21.5, 54.7, 7.41, 4.81, 1.23],
  ['140*66', 140.0, 66.0, 5.7, 8.6, 14.3, 18.2, 573.0, 35.2, 81.9, 10.7, 5.61, 1.4],
  ['160*74', 160.0, 74.0, 6.3, 9.5, 17.9, 22.8, 935.0, 54.7, 117.0, 14.8, 6.4, 1.55],
  ['180*82', 180.0, 82.0, 6.9, 10.4, 21.9, 27.9, 1450.0, 81.3, 161.0, 19.8, 7.2, 1.71],
  ['200*90', 200.0, 90.0, 7.5, 11.3, 26.2, 33.4, 2140.0, 117.0, 214.0, 26.0, 8.0, 1.87],
  ['220*98', 220.0, 98.0, 8.1, 12.2, 31.1, 39.5, 3060.0, 162.0, 278.0, 33.1, 8.8, 2.02],
  ['240*106', 240.0, 106.0, 8.7, 13.1, 36.2, 46.1, 4260.0, 221.0, 354.0, 41.7, 9.59, 2.2],
  ['260*113', 260.0, 113.0, 9.4, 14.1, 41.9, 53.3, 5740.0, 288.0, 442.0, 51.0, 10.4, 2.32],
  ['280*119', 280.0, 119.0, 10.1, 15.2, 47.9, 61.0, 7500.0, 364.0, 542.0, 61.2, 11.1, 2.45],
  ['300*125', 300.0, 125.0, 10.8, 16.2, 54.2, 69.0, 9800.0, 451.0, 653.0, 72.2, 11.9, 2.56],
  ['320*131', 320.0, 131.0, 11.5, 17.3, 61.0, 77.7, 12510.0, 555.0, 782.0, 84.7, 12.7, 2.67],
  ['340*137', 340.0, 137.0, 12.2, 18.3, 68.0, 86.7, 15700.0, 674.0, 923.0, 98.4, 13.5, 2.8],
  ['360*143', 360.0, 143.0, 13.0, 19.5, 76.1, 97.0, 10610.0, 818.0, 1090.0, 114.0, 14.2, 2.9],
  ['380*149', 380.0, 149.0, 13.7, 20.5, 84.0, 107.0, 24010.0, 975.0, 1260.0, 131.0, 15.0, 3.02],
  ['400*155', 400.0, 155.0, 14.4, 21.6, 92.1, 118.0, 29210.0, 1160.0, 1460.0, 149.0, 15.7, 3.13],
  ['425*163', 425.0, 163.0, 15.3, 23.0, 104.0, 132.0, 36970.0, 1440.0, 1740.0, 178.0, 16.7, 3.3],
  ['450*170', 450.0, 170.0, 16.2, 24.3, 115.0, 147.0, 45850.0, 1730.0, 2040.0, 203.0, 17.7, 3.43],
  ['475*178', 475.0, 178.0, 17.1, 25.6, 128.0, 163.0, 56480.0, 2090.0, 2380.0, 235.0, 18.6, 3.6],
  ['500*185', 500.0, 185.0, 18.0, 27.0, 141.0, 179.0, 68740.0, 2480.0, 2750.0, 268.0, 19.6, 3.72],
  ['550*200', 550.0, 200.0, 19.0, 30.0, 166.0, 212.0, 99180.0, 3490.0, 3610.0, 349.0, 21.6, 4.02],
  ['600*215', 600.0, 215.0, 21.6, 32.4, 199.0, 254.0, 139000.0, 4670.0, 4630.0, 434.0, 23.4, 4.3],
];

const wfSections: ISection[] = [
  ['100*50', 100, 50, 5, 7, 9.3, 11.85, 187, 14.8, 37.5, 5.91, 3.98, 1.12],
  ['100*100', 100, 100, 6, 8, 17.2, 21.9, 383, 134, 76.5, 26.7, 4.18, 2.47],
  ['125*60', 125, 60, 6, 8, 13.2, 16.84, 413, 29.2, 66.1, 9.73, 4.95, 1.321],
  ['125*125', 125, 125, 6.5, 9, 23.8, 30.31, 847, 293, 136, 47, 5.29, 3.11],
  ['150*75', 150, 75, 5, 7, 14, 17.85, 666, 49.5, 88.8, 13.2, 6.11, 1.66],
  ['150*100', 150, 100, 6, 9, 21.1, 26.84, 1020, 151, 138, 30.1, 6.71, 2.37],
  ['150*150', 150, 150, 7, 10, 31.5, 40.14, 1640, 563, 219, 75.1, 6.39, 3.75],
  ['175*125', 175, 125, 5.5, 8, 23.3, 29.65, 1530, 261, 181, 41.8, 7.18, 2.97],
  ['175*175', 175, 175, 7.5, 11, 40.2, 51.21, 2880, 984, 330, 112, 7.5, 4.38],
  ['200*100', 200, 100, 4.5, 7, 18.2, 23.18, 1580, 114, 160, 23, 8.26, 2.21],
  ['200*100', 200, 100, 5.5, 8, 21.3, 27.16, 1840, 134, 184, 26.8, 8.24, 2.22],
  ['200*150', 200, 150, 6, 9, 30.6, 39.01, 2690, 507, 277, 67.6, 8.3, 3.61],
  ['200*200', 200, 200, 8, 12, 49.9, 63.53, 4720, 1600, 472, 160, 8.62, 5.02],
  ['200*200', 200, 200, 12, 12, 56.2, 71.53, 4980, 1700, 498, 167, 8.35, 4.88],
  ['200*200', 200, 200, 10, 16, 65.7, 83.69, 6530, 2200, 628, 218, 8.83, 5.13],
  ['250*125', 250, 125, 5, 8, 25.7, 32.68, 3540, 255, 285, 41.1, 10.4, 2.79],
  ['250*125', 250, 125, 6, 9, 29.6, 37.66, 4050, 294, 324, 47, 10.4, 2.79],
  ['250*175', 250, 175, 7, 11, 44.1, 56.24, 6120, 984, 502, 113, 10.4, 4.18],
  ['250*250', 250, 250, 11, 11, 64.4, 82.06, 8790, 2940, 720, 233, 10.3, 5.98],
  ['250*250', 250, 250, 8, 13, 66.5, 84.7, 9930, 3350, 801, 269, 10.8, 6.29],
  ['250*250', 250, 250, 9, 14, 72.4, 92.18, 10800, 3650, 867, 292, 10.8, 6.29],
  ['250*250', 250, 250, 14, 14, 82.2, 104.7, 11500, 3880, 919, 304, 10.5, 6.09],
  ['300*150', 300, 150, 5.5, 8, 32, 40.8, 6320, 442, 424, 59.3, 12.4, 3.29],
  ['300*150', 300, 150, 6.5, 9, 36.7, 46.78, 7210, 508, 481, 67.6, 12.4, 3.29],
  ['300*200', 300, 200, 8, 12, 56.8, 72.38, 11300, 1600, 771, 160, 12.5, 4.71],
  ['300*200', 300, 200, 9, 14, 65.4, 83.36, 13300, 1900, 893, 189, 12.6, 4.77],
  ['300*300', 300, 300, 12, 12, 84.5, 107.7, 16900, 5520, 1150, 365, 12.5, 7.16],
  ['300*300', 300, 300, 9, 14, 87, 110.8, 18800, 6240, 1270, 417, 13, 7.51],
  ['300*300', 300, 300, 10, 15, 94, 119.8, 20400, 6750, 1360, 450, 13.1, 7.51],
  ['300*300', 300, 300, 15, 15, 106, 134.8, 21500, 7100, 1440, 466, 12.6, 7.26],
  ['300*300', 300, 300, 11, 17, 106, 134.8, 23400, 7730, 1540, 514, 13.2, 7.57],
  ['350*175', 350, 175, 6, 9, 41.4, 52.68, 11100, 792, 641, 91, 14.5, 3.86],
  ['350*175', 350, 175, 7, 11, 49.6, 63.14, 13600, 684, 775, 112, 14.7, 3.95],
  ['350*250', 350, 250, 8, 12, 69.2, 88.15, 18500, 3090, 1100, 248, 14.5, 5.92],
  ['350*250', 350, 250, 9, 14, 79.7, 101.5, 21700, 3650, 1280, 292, 14.6, 6],
  ['350*350', 350, 350, 13, 13, 106, 135.3, 28200, 9380, 1670, 534, 14.4, 8.33],
  ['350*350', 350, 350, 10, 16, 115, 146, 33300, 11200, 1940, 646, 15.1, 8.78],
  ['350*350', 350, 350, 16, 16, 131, 166.6, 35300, 11800, 2050, 669, 14.6, 8.43],
  ['350*350', 350, 350, 12, 19, 137, 173.9, 40300, 13600, 2300, 776, 15.2, 8.84],
  ['350*350', 350, 350, 19, 19, 156, 198.4, 42800, 14400, 2450, 809, 14.7, 8.53],
  ['350*350', 350, 350, 14, 22, 159, 202, 47600, 16000, 2670, 909, 15.3, 8.9],
  ['400*200', 400, 200, 7, 11, 56.6, 72.16, 20000, 1450, 1010, 145, 16.7, 4.48],
  ['400*200', 400, 200, 8, 13, 66, 84.12, 23700, 1740, 1190, 174, 16.8, 4.54],
  ['400*300', 400, 300, 9, 14, 94.3, 120.1, 33700, 6240, 1740, 418, 16.7, 7.21],
  ['400*300', 400, 300, 10, 16, 107, 136, 38700, 7210, 1980, 481, 16.9, 7.28],
  ['400*400', 400, 400, 15, 15, 140, 178.5, 49000, 16300, 2250, 809, 16.6, 9.54],
  ['400*400', 400, 400, 11, 18, 147, 186.8, 56100, 18900, 2850, 951, 17.3, 10.1],
  ['400*400', 400, 400, 18, 18, 168, 214.4, 59700, 20000, 3030, 985, 16.7, 9.65],
  ['400*400', 400, 400, 13, 21, 172, 218.7, 66600, 22400, 3330, 1120, 17.5, 10.1],
  ['400*400', 400, 400, 21, 21, 197, 250.7, 70900, 23800, 3540, 1170, 16.8, 9.75],
  ['400*400', 400, 400, 16, 24, 200, 254.9, 78000, 26200, 3840, 1300, 17.5, 10.1],
  ['400*400', 400, 400, 18, 28, 232, 295.4, 92800, 31000, 4480, 1530, 17.7, 10.2],
  ['400*400', 400, 400, 20, 35, 283, 360.7, 119000, 39400, 5570, 1930, 18.2, 10.4],
  ['400*400', 400, 400, 30, 50, 415, 528.6, 187000, 60500, 8170, 2900, 18.6, 10.7],
  ['400*400', 400, 400, 45, 70, 605, 770.1, 298000, 94400, 12000, 4370, 19.7, 11.1],
  ['450*200', 400, 200, 8, 12, 66.2, 84.3, 26700, 1580, 1290, 159, 18.5, 4.33],
  ['450*200', 450, 200, 9, 14, 76, 96.76, 33500, 1870, 1490, 187, 18.6, 4.4],
  ['450*300', 400, 300, 10, 15, 106, 135, 46800, 6690, 2160, 448, 18.6, 7.04],
  ['450*300', 450, 300, 11, 18, 124, 157.4, 56100, 8110, 2550, 541, 18.9, 7.18],
  ['500*200', 500, 200, 9, 14, 79.5, 101.3, 41900, 1840, 1690, 185, 20.3, 4.27],
  ['500*200', 500, 200, 10, 16, 89.6, 114.2, 47800, 2140, 1910, 214, 20.5, 4.33],
  ['500*200', 500, 200, 11, 19, 103, 131.3, 56500, 2580, 2230, 257, 20.7, 4.43],
  ['500*300', 500, 300, 11, 15, 114, 145.5, 60400, 6760, 2500, 451, 20.4, 6.82],
  ['500*300', 500, 300, 11, 18, 128, 163.5, 71000, 8110, 2910, 541, 20.8, 7.04],
  ['600*200', 600, 200, 10, 15, 94.6, 120.5, 68700, 1980, 2310, 199, 23.9, 4.05],
  ['600*200', 600, 200, 11, 17, 106, 134.4, 77600, 2280, 2590, 228, 24, 4.12],
  ['600*200', 600, 200, 12, 20, 120, 152.5, 90400, 2720, 2980, 271, 24.3, 4.22],
  ['600*200', 600, 200, 13, 23, 134, 107.7, 103000, 3180, 3380, 314, 24.6, 4.31],
  ['600*300', 600, 300, 12, 17, 137, 174.5, 103000, 7670, 3530, 511, 24.3, 6.63],
  ['600*300', 600, 300, 12, 20, 151, 192.5, 118000, 9020, 4020, 601, 24.8, 6.85],
  ['600*300', 600, 300, 14, 23, 175, 222.4, 137000, 10600, 4620, 701, 24.9, 6.9],
  ['700*300', 700, 300, 13, 20, 166, 211.5, 172000, 9020, 4980, 602, 28.6, 6.53],
  ['700*300', 700, 300, 13, 24, 185, 235.5, 201000, 10800, 5760, 722, 29.3, 6.78],
  ['700*300', 700, 300, 15, 28, 215, 273.6, 237000, 12900, 6700, 653, 29.4, 6.86],
  ['800*300', 800, 300, 14, 22, 191, 243.4, 254000, 9930, 6410, 662, 32.3, 6.39],
  ['800*300', 800, 300, 14, 26, 210, 267.4, 292000, 11700, 7290, 782, 33, 6.62],
  ['800*300', 800, 300, 16, 30, 241, 307.6, 339000, 13800, 8400, 915, 33.2, 6.7],
  ['900*300', 900, 300, 15, 23, 213, 270.9, 345000, 10300, 7760, 688, 35.7, 6.16],
  ['900*300', 900, 300, 16, 28, 243, 309.8, 41000, 12600, 9140, 843, 36.4, 6.39],
  ['900*300', 900, 300, 18, 34, 286, 364, 498000, 15700, 10900, 1040, 37, 6.56],
];

const typeOfSections = [
  ['Pile Section', pileSections],
  ['Light Lip Channel Section', lightLipChannalSections],
  ['Rectangular Tube Section', rectangularTubeSections],
  ['Light Channel Section', lightChannelSections],
  ['I Section', iSections],
  ['WF Section', wfSections],
] as const;

const YIELD_STRENGTHS = ['2400', '3000'] as const;

// Define the form schema
const formSchema = z.object({
  // Part 1: Data For Design
  typeOfSagRod: z.enum(['1', '2', '3']),
  spanLength: z.number().positive(),
  rangeOfPurlin: z.number().positive(),
  slopeOfRoof: z.number().min(0).max(90),
  weightOfTiles: z.number().nonnegative(),
  liveLoad: z.number().nonnegative(),
  windLoad: z.number().nonnegative(),
  useSelfWeight: z.number().nonnegative(),

  // Part 2: Properties of Steel For Design
  modulusOfElasticity: z.number().positive(),
  yieldStrength: z.enum(YIELD_STRENGTHS),
  allowableDeflection: z.enum(ALLOWABLE_DEFLECTIONS),

  // Part 4: Select Type & Section Of Steel
  // typeOfSection: z.enum(['1', '2', '3', '4', '5', '6']),
  typeOfSection: z.string(),
  trialSectionNo: z.number().positive(),
});

const DataForDesignForm = ({ form }: { form: UseFormReturn<z.infer<typeof formSchema>> }) => {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold mb-4">Part 1: Data For Design</h2>
      <FormField
        control={form.control}
        name="typeOfSagRod"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type of Sag Rod</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select type of sag rod" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="1">1. Not To Use Sag Rod For This Member</SelectItem>
                <SelectItem value="2">2. This Member Use Sag Rod At Middle Span</SelectItem>
                <SelectItem value="3">3. This Member Use Sag Rod At Range L/3 Of Span</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="spanLength"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Span Length (L.)</FormLabel>
            <FormControl>
              <NumberField {...field} unit={'m.'} decimalScale={2} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="rangeOfPurlin"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Range of Purlin</FormLabel>
            <FormControl>
              <NumberField {...field} unit={'m.'} decimalScale={2} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="slopeOfRoof"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slope of Roof (θ)</FormLabel>
            <FormControl>
              <NumberField {...field} unit={'degree'} decimalScale={2} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="weightOfTiles"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Weight of Tiles</FormLabel>
            <FormControl>
              <NumberField
                {...field}
                unit={
                  <span>
                    kg./m<sup>2</sup>
                  </span>
                }
                decimalScale={2}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="liveLoad"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Live Load (LL.)</FormLabel>
            <FormControl>
              <NumberField
                {...field}
                unit={
                  <span>
                    kg./m<sup>2</sup>
                  </span>
                }
                decimalScale={2}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="windLoad"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Wind Load (WL.)</FormLabel>
            <FormControl>
              <NumberField
                {...field}
                unit={
                  <span>
                    kg./m<sup>2</sup>
                  </span>
                }
                decimalScale={2}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="useSelfWeight"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Use Self Weight</FormLabel>
            <FormControl>
              <NumberField
                {...field}
                unit={
                  <span>
                    kg./m<sup>2</sup>
                  </span>
                }
                decimalScale={2}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

const formatNumber = (value: number) => {
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const usePurlinComputations = ({ form }: { form: UseFormReturn<z.infer<typeof formSchema>> }) => {
  const yieldStrengthValue = useWatch({
    control: form.control,
    name: 'yieldStrength',
  });
  const typeOfSagRod = useWatch({
    control: form.control,
    name: 'typeOfSagRod',
  });
  const spanLength = useWatch({
    control: form.control,
    name: 'spanLength',
  });
  const rangeOfPurlin = useWatch({
    control: form.control,
    name: 'rangeOfPurlin',
  });
  const slopeOfRoof = useWatch({
    control: form.control,
    name: 'slopeOfRoof',
  });
  const weightOfTiles = useWatch({
    control: form.control,
    name: 'weightOfTiles',
  });
  const liveLoad = useWatch({
    control: form.control,
    name: 'liveLoad',
  });
  const windLoad = useWatch({
    control: form.control,
    name: 'windLoad',
  });
  const useSelfWeight = useWatch({
    control: form.control,
    name: 'useSelfWeight',
  });
  const yieldStrength = useWatch({
    control: form.control,
    name: 'yieldStrength',
  });
  const modulusOfElasticity = useWatch({
    control: form.control,
    name: 'modulusOfElasticity',
  });
  const allowableDeflection = useWatch({
    control: form.control,
    name: 'allowableDeflection',
  });
  const typeOfSectionName = useWatch({
    control: form.control,
    name: 'typeOfSection',
  });
  const trialSectionNo = useWatch({
    control: form.control,
    name: 'trialSectionNo',
  });
  const typeOfSection = typeOfSections.find(([tableName]) => tableName === typeOfSectionName);
  invariant(typeOfSection, 'Invalid type of section');

  const getLoadOnPurlin = () => {
    return Decimal.add(weightOfTiles, liveLoad).mul(rangeOfPurlin).add(useSelfWeight).toNumber();
  };

  const getUnifLoadOfWx = () => {
    const radians = Decimal.mul(slopeOfRoof, Math.PI).div(180);
    return Decimal.mul(getLoadOnPurlin(), Decimal.sin(radians)).toNumber();
  };

  const getUnifLoadOfWy = () => {
    // 2*I16*(SIN(I13*PI()/180)) / (1+((SIN(I13*PI()/180))^2))
    const sloopOfRoofRadians = Decimal.mul(slopeOfRoof, Math.PI).div(180);
    //
    const r27Complex = Decimal.mul(2, windLoad)
      .mul(Decimal.sin(sloopOfRoofRadians))
      .div(Decimal.add(1, Decimal.pow(Decimal.sin(sloopOfRoofRadians), 2)))
      .toNumber();
    const r27 = slopeOfRoof <= 18 ? 0 : r27Complex;
    // MAX(0.75*(I19*COS(I13*PI()/180)+R27*I12),I19*COS(I13*PI()/180))
    const wy1 = Decimal.mul(getLoadOnPurlin(), Decimal.cos(sloopOfRoofRadians))
      .add(Decimal.mul(r27, rangeOfPurlin))
      .mul(0.75);
    const wy2 = Decimal.mul(getLoadOnPurlin(), Decimal.cos(sloopOfRoofRadians));
    //
    return Decimal.max(wy1, wy2).toNumber();
  };

  const getMomentOfMx = () => {
    // =(1/8)*(I11^2)*I21
    return Decimal.mul(Decimal.pow(spanLength, 2), getUnifLoadOfWy()).div(8).toNumber();
  };

  const getMomentOfMy = () => {
    const TYPE_OF_SAG_ROD_CONSTS = {
      '1': new Decimal(0.125),
      '2': new Decimal(0.03125),
      '3': new Decimal(0.0114285714285714),
    };
    const typeOfSagRodConst = TYPE_OF_SAG_ROD_CONSTS[typeOfSagRod];
    return Decimal.mul(typeOfSagRodConst, Decimal.pow(spanLength, 2)).mul(getUnifLoadOfWx()).toNumber();
  };

  const getDeflextion = () => {
    // =((I11*100)^4)*5*MAX(I20,I21)/384
    return Decimal.mul(Decimal.pow(Decimal.mul(spanLength, 100), 4), 5)
      .mul(Decimal.max(getUnifLoadOfWx(), getUnifLoadOfWy()))
      .div(384)
      .toNumber();
  };

  const getAllBendStress = () => {
    return Decimal.mul(parseFloat(yieldStrength), 0.6).toNumber();
  };

  const getReqSectModulus = () => {
    // =100*MAX(I22,I23)/N13
    return Decimal.mul(100, Decimal.max(getMomentOfMx(), getMomentOfMy())).div(getAllBendStress()).toNumber();
  };

  const getUseSteelGrade = () => {
    if (yieldStrengthValue === '2400') {
      return 'Fe-24';
    }
    return 'Fe-30';
  };

  const getUltimateStrength = () => {
    if (yieldStrengthValue === '2400') {
      return '4100';
    }
    return '5000';
  };

  const getSizeOfSection = () => {
    const [, trialSectionTable] = typeOfSection;
    const trialSectionData = trialSectionTable[trialSectionNo - 1];
    const sizeOfSection = trialSectionData[0];
    return sizeOfSection;
  };

  const getThickWeb = () => {
    const [name, trialSectionTable] = typeOfSection;
    const trialSectionData = trialSectionTable[trialSectionNo - 1];

    if (name === 'Pile Section') {
      const result = trialSectionData[1];
      invariant(typeof result === 'number', 'Invalid thick web');
      return result;
    }
    if (name === 'Light Lip Channel Section') {
      const result = trialSectionData[4];
      invariant(typeof result === 'number', 'Invalid thick web');
      return result;
    }
    if (name === 'Rectangular Tube Section') {
      const result = trialSectionData[3];
      invariant(typeof result === 'number', 'Invalid thick web');
      return result;
    }
    if (name === 'Light Channel Section') {
      const result = trialSectionData[3];
      invariant(typeof result === 'number', 'Invalid thick web');
      return result;
    }
    if (name === 'I Section') {
      const result = trialSectionData[3];
      invariant(typeof result === 'number', 'Invalid thick web');
      return result;
    }
    if (name === 'WF Section') {
      const result = trialSectionData[3];
      invariant(typeof result === 'number', 'Invalid thick web');
      return result;
    }

    throw new Error(`Invalid type of section: ${name}`);
  };

  const getThickFlange = () => {
    const [name, trialSectionTable] = typeOfSection;
    const trialSectionData = trialSectionTable[trialSectionNo - 1];

    if (name === 'Pile Section') {
      const result = trialSectionData[1];
      invariant(typeof result === 'number', 'Invalid thick flange');
      return result;
    }
    if (name === 'Light Lip Channel Section') {
      const result = trialSectionData[4];
      invariant(typeof result === 'number', 'Invalid thick flange');
      return result;
    }
    if (name === 'Rectangular Tube Section') {
      const result = trialSectionData[3];
      invariant(typeof result === 'number', 'Invalid thick flange');
      return result;
    }
    if (name === 'Light Channel Section') {
      const result = trialSectionData[4];
      invariant(typeof result === 'number', 'Invalid thick flange');
      return result;
    }
    if (name === 'I Section') {
      const result = trialSectionData[4];
      invariant(typeof result === 'number', 'Invalid thick flange');
      return result;
    }
    if (name === 'WF Section') {
      const result = trialSectionData[4];
      invariant(typeof result === 'number', 'Invalid thick flange');
      return result;
    }

    throw new Error(`Invalid type of section: ${name}`);
  };

  const getSectionArea = () => {
    const [name, trialSectionTable] = typeOfSection;
    const trialSectionData = trialSectionTable[trialSectionNo - 1];

    if (name === 'Pile Section') {
      return trialSectionData[3];
    }
    if (name === 'Light Lip Channel Section') {
      return trialSectionData[6];
    }
    if (name === 'Rectangular Tube Section') {
      return trialSectionData[5];
    }
    if (name === 'Light Channel Section') {
      return trialSectionData[6];
    }
    if (name === 'I Section') {
      return trialSectionData[6];
    }
    if (name === 'WF Section') {
      return trialSectionData[6];
    }

    throw new Error(`Invalid type of section: ${name}`);
  };

  const getWeightOfSection = () => {
    const [name, trialSectionTable] = typeOfSection;
    const trialSectionData = trialSectionTable[trialSectionNo - 1];

    if (name === 'Pile Section') {
      return trialSectionData[2];
    }
    if (name === 'Light Lip Channel Section') {
      return trialSectionData[5];
    }
    if (name === 'Rectangular Tube Section') {
      return trialSectionData[4];
    }
    if (name === 'Light Channel Section') {
      return trialSectionData[5];
    }
    if (name === 'I Section') {
      return trialSectionData[5];
    }
    if (name === 'WF Section') {
      return trialSectionData[5];
    }

    throw new Error(`Invalid type of section: ${name}`);
  };

  const getSectModulus = () => {
    const [name, trialSectionTable] = typeOfSection;
    const trialSectionData = trialSectionTable[trialSectionNo - 1];

    let result: number | undefined;
    if (name === 'Pile Section') {
      result = trialSectionData[5];
    } else if (name === 'Light Lip Channel Section') {
      result = trialSectionData[9];
    } else if (name === 'Rectangular Tube Section') {
      result = trialSectionData[8];
    } else if (name === 'Light Channel Section') {
      result = trialSectionData[9];
    } else if (name === 'I Section') {
      result = trialSectionData[9];
    } else if (name === 'WF Section') {
      result = trialSectionData[9];
    } else {
      throw new Error(`Invalid type of section: ${name}`);
    }

    invariant(typeof result === 'number', 'Invalid SectModulus');
    return result;
  };

  const getMOfIn = () => {
    const [name, trialSectionTable] = typeOfSection;
    const trialSectionData = trialSectionTable[trialSectionNo - 1];

    let result: number | undefined;
    if (name === 'Pile Section') {
      result = trialSectionData[4];
    } else if (name === 'Light Lip Channel Section') {
      result = trialSectionData[7];
    } else if (name === 'Rectangular Tube Section') {
      result = trialSectionData[6];
    } else if (name === 'Light Channel Section') {
      result = trialSectionData[7];
    } else if (name === 'I Section') {
      result = trialSectionData[7];
    } else if (name === 'WF Section') {
      result = trialSectionData[7];
    } else {
      throw new Error(`Invalid type of section: ${name}`);
    }

    invariant(typeof result === 'number', 'Invalid MOfIn');
    return result;
  };

  const getRadOfGyr = () => {
    const [name, trialSectionTable] = typeOfSection;
    const trialSectionData = trialSectionTable[trialSectionNo - 1];

    if (name === 'Pile Section') {
      return trialSectionData[6];
    }
    if (name === 'Light Lip Channel Section') {
      return Math.min(trialSectionData[11] ?? 0, trialSectionData[12] ?? 0);
    }
    if (name === 'Rectangular Tube Section') {
      return Math.min(trialSectionData[10] ?? 0, trialSectionData[11] ?? 0);
    }
    if (name === 'Light Channel Section') {
      return Math.min(trialSectionData[11] ?? 0, trialSectionData[12] ?? 0);
    }
    if (name === 'I Section') {
      return Math.min(trialSectionData[11] ?? 0, trialSectionData[12] ?? 0);
    }
    if (name === 'WF Section') {
      return Math.min(trialSectionData[11] ?? 0, trialSectionData[12] ?? 0);
    }

    throw new Error(`Invalid type of section: ${name}`);
  };

  const getIy = () => {
    const [name, trialSectionTable] = typeOfSection;
    const trialSectionData = trialSectionTable[trialSectionNo - 1];

    let result: number | undefined;
    if (name === 'Pile Section') {
      result = trialSectionData[5];
    } else if (name === 'Light Lip Channel Section') {
      result = trialSectionData[8];
    } else if (name === 'Rectangular Tube Section') {
      result = trialSectionData[7];
    } else if (name === 'Light Channel Section') {
      result = trialSectionData[8];
    } else if (name === 'I Section') {
      result = trialSectionData[8];
    } else if (name === 'WF Section') {
      result = trialSectionData[8];
    } else {
      throw new Error(`Invalid type of section: ${name}`);
    }

    invariant(typeof result === 'number', 'Invalid Iy');
    return result;
  };

  const getZy = () => {
    const [name, trialSectionTable] = typeOfSection;
    const trialSectionData = trialSectionTable[trialSectionNo - 1];

    let result: number | undefined;
    if (name === 'Pile Section') {
      result = trialSectionData[5];
    } else if (name === 'Light Lip Channel Section') {
      result = trialSectionData[10];
    } else if (name === 'Rectangular Tube Section') {
      result = trialSectionData[9];
    } else if (name === 'Light Channel Section') {
      result = trialSectionData[10];
    } else if (name === 'I Section') {
      result = trialSectionData[10];
    } else if (name === 'WF Section') {
      result = trialSectionData[10];
    } else {
      throw new Error(`Invalid type of section: ${name}`);
    }

    invariant(typeof result === 'number', 'Invalid Zy');
    return result;
  };

  const getActualBendingStress = () => {
    // =((100*I22)/N24)+((100*I23)/V22)
    return Decimal.add(
      Decimal.mul(100, getMomentOfMx()).div(getSectModulus()),
      Decimal.mul(100, getMomentOfMy()).div(getZy())
    ).toNumber();
  };

  const getActualDeflextion = () => {
    // =I24/(N10*MAX(N25,V23)*100)
    return Decimal.div(
      getDeflextion(),
      Decimal.mul(modulusOfElasticity, 100).mul(Decimal.max(getMOfIn(), getIy()))
    ).toNumber();
  };

  const getActualSectModulus = () => {
    return Decimal.max(getSectModulus(), getZy()).toNumber();
  };

  const getValidatedActualBendingStress = () => {
    if (getActualBendingStress() <= getAllBendStress()) {
      return {
        status: 'success',
        message: 'OK.!',
      };
    }
    return {
      status: 'failed',
      message: 'Fail!',
    };
  };

  const getValidatedActualDeflextion = () => {
    const calculatedDeflextion = Decimal.mul(spanLength, 100).div(+allowableDeflection).toNumber();
    if (getActualDeflextion() <= calculatedDeflextion) {
      return {
        status: 'success',
        message: `OK.! (L/${allowableDeflection})`,
      };
    }
    return {
      status: 'failed',
      message: `เกิน ${formatNumber(calculatedDeflextion)} cm. Fail!`,
    };
  };

  const getValidatedSectModulus = () => {
    if (getActualSectModulus() >= getReqSectModulus()) {
      return {
        status: 'success',
        message: 'OK.!',
      };
    }
    return {
      status: 'failed',
      message: 'Fail!',
    };
  };

  const getValidatedActualSelfWeight = () => {
    console.log('getWeightOfSection()', getWeightOfSection());
    console.log('useSelfWeight', useSelfWeight);
    if (
      getValidatedActualBendingStress().status === 'success' &&
      getValidatedActualDeflextion().status === 'success' &&
      getValidatedSectModulus().status === 'success' &&
      getWeightOfSection() > useSelfWeight
    ) {
      return {
        status: 'failed',
        message: 'ไปเพิ่ม นน. ออกแบบ',
      };
    }
    return {
      status: 'success',
      message: 'OK.!',
    };
  };

  return {
    getUseSteelGrade,
    getUltimateStrength,
    getAllBendStress,
    getLoadOnPurlin,
    getUnifLoadOfWx,
    getUnifLoadOfWy,
    getMomentOfMx,
    getMomentOfMy,
    getDeflextion,
    getReqSectModulus,
    typeOfSection,
    getSizeOfSection,
    getThickWeb,
    getThickFlange,
    getSectionArea,
    getWeightOfSection,
    getSectModulus,
    getMOfIn,
    getRadOfGyr,
    getActualBendingStress,
    getActualDeflextion,
    getActualSectModulus,
    getValidatedActualBendingStress,
    getValidatedActualDeflextion,
    getValidatedSectModulus,
    getValidatedActualSelfWeight,
  };
};

const PropertiesOfSteelForDesign = ({ form }: { form: UseFormReturn<z.infer<typeof formSchema>> }) => {
  const { getUseSteelGrade, getUltimateStrength, getAllBendStress } = usePurlinComputations({ form });

  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold mb-4">Part II: Properties Of Steel For Design</h2>
      <div>
        <FormLabel>Use Steel Grade</FormLabel>
        <TextField disabled value={getUseSteelGrade()} />
      </div>
      <FormField
        control={form.control}
        name="modulusOfElasticity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Modulus Of Elastic</FormLabel>
            <FormControl>
              <NumberField {...field} unit={'ksc.'} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="yieldStrength"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Yield Strength</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select yield strength" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {YIELD_STRENGTHS.map((deflection) => (
                  <SelectItem key={deflection} value={deflection}>
                    {deflection}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <div>
        <FormLabel>Ultimate Strength</FormLabel>
        <NumberField disabled value={getUltimateStrength()} unit={'ksc.'} decimalScale={2} />
      </div>
      <div>
        <FormLabel>All. Bend. Stress</FormLabel>
        <NumberField disabled value={getAllBendStress()} unit={'ksc.'} decimalScale={2} />
      </div>
      <FormField
        control={form.control}
        name="allowableDeflection"
        render={({ field }) => (
          <FormItem>
            <FormLabel>All. Deflextion= L /</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select type of sag rod" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ALLOWABLE_DEFLECTIONS.map((deflection) => (
                  <SelectItem key={deflection} value={deflection}>
                    {deflection}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

const ResultOfCalculationView = ({ form }: { form: UseFormReturn<z.infer<typeof formSchema>> }) => {
  const {
    getLoadOnPurlin,
    getUnifLoadOfWx,
    getUnifLoadOfWy,
    getMomentOfMx,
    getMomentOfMy,
    getDeflextion,
    getReqSectModulus,
  } = usePurlinComputations({ form });

  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold mb-4">Result Of Calculation</h2>
      <div>
        <FormLabel>Load On Purlin(Wt)</FormLabel>
        <NumberField disabled value={getLoadOnPurlin()} unit={'kg./m.'} decimalScale={2} />
      </div>
      <div>
        <FormLabel>Unif. Load Of Wx</FormLabel>
        <NumberField disabled value={getUnifLoadOfWx()} unit={'kg./m.'} decimalScale={2} />
      </div>
      <div>
        <FormLabel>Unif. Load Of Wy</FormLabel>
        <NumberField disabled value={getUnifLoadOfWy()} unit={'kg./m.'} decimalScale={2} />
      </div>
      <div>
        <FormLabel>Moment Of Mx</FormLabel>
        <NumberField disabled value={getMomentOfMx()} unit={'kg.-m.'} decimalScale={2} />
      </div>
      <div>
        <FormLabel>Moment Of My</FormLabel>
        <NumberField disabled value={getMomentOfMy()} unit={'kg.-m.'} decimalScale={2} />
      </div>
      <div>
        <FormLabel>Deflextion (∆/IE)</FormLabel>
        <TextField
          disabled
          value={getDeflextion().toExponential(2)}
          unit={
            <span>
              kg.-cm<sup>3</sup>
            </span>
          }
        />
      </div>
      <div>
        <FormLabel>Req. Sect. Modulus</FormLabel>
        <NumberField
          disabled
          value={getReqSectModulus()}
          unit={
            <span>
              cm<sup>3</sup>
            </span>
          }
          decimalScale={2}
        />
      </div>
    </div>
  );
};

const SelectTypeAndSectionOfSteelForm = ({ form }: { form: UseFormReturn<z.infer<typeof formSchema>> }) => {
  const trialSectionNoController = useController({
    control: form.control,
    name: 'trialSectionNo',
  });
  const {
    typeOfSection: [, table],
    getReqSectModulus,
    getSizeOfSection,
    getThickWeb,
    getThickFlange,
    getSectionArea,
    getWeightOfSection,
    getSectModulus,
    getMOfIn,
    getRadOfGyr,
  } = usePurlinComputations({ form });
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold mb-4">Part IV: Select Type & Section Of Steel</h2>
      <div>
        <FormLabel>Required Smax.</FormLabel>
        <NumberField
          disabled
          value={getReqSectModulus()}
          unit={
            <span>
              cm<sup>3</sup>
            </span>
          }
          decimalScale={2}
        />
      </div>
      <FormField
        control={form.control}
        name="typeOfSection"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type Of Section</FormLabel>
            <Select
              onValueChange={(v) => {
                field.onChange(v);
                // Reset trialSectionNo to No. 1
                trialSectionNoController.field.onChange(1);
              }}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select type of section" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {typeOfSections.map(([tableName]) => (
                  <SelectItem key={tableName} value={tableName}>
                    {tableName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="trialSectionNo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Trial Section No.</FormLabel>
            <Select onValueChange={(value) => field.onChange(+value)} value={field.value.toString()}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select trial section no." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {table.map((data, index) => (
                  <SelectItem key={index} value={(index + 1).toString()}>
                    {`No. ${index + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <div>
        <FormLabel>Size Of Section</FormLabel>
        <TextField disabled value={getSizeOfSection().toString()} unit="mm." />
      </div>
      <div>
        <FormLabel>Thick. Web(t , tw)</FormLabel>
        <NumberField disabled value={getThickWeb()} unit={'mm.'} decimalScale={2} />
      </div>
      <div>
        <FormLabel>Thick. Flange(tf)</FormLabel>
        <NumberField disabled value={getThickFlange()} unit={'mm.'} decimalScale={2} />
      </div>
      <div>
        <FormLabel>Section Area(As)</FormLabel>
        <NumberField
          disabled
          value={getSectionArea()}
          unit={
            <span>
              cm<sup>2</sup>
            </span>
          }
          decimalScale={2}
        />
      </div>
      <div>
        <FormLabel>Weight Of Section</FormLabel>
        <NumberField disabled value={getWeightOfSection()} unit={'kg./m.'} decimalScale={2} />
      </div>
      <div>
        <FormLabel>Sect. Modulus(Sx-x)</FormLabel>
        <NumberField
          disabled
          value={getSectModulus()}
          unit={
            <span>
              cm<sup>3</sup>
            </span>
          }
          decimalScale={2}
        />
      </div>
      <div>
        <FormLabel>M. Of In.(Ix-x)</FormLabel>
        <NumberField
          disabled
          value={getMOfIn()}
          unit={
            <span>
              cm<sup>4</sup>
            </span>
          }
          decimalScale={2}
        />
      </div>
      <div>
        <FormLabel>Rad. Of Gyr.(rmin.)</FormLabel>
        <NumberField disabled value={getRadOfGyr()} unit={'cm.'} decimalScale={2} />
      </div>
    </div>
  );
};

const RecheckAllowableStressOnSection = ({ form }: { form: UseFormReturn<z.infer<typeof formSchema>> }) => {
  const {
    getActualBendingStress,
    getActualDeflextion,
    getWeightOfSection,
    getActualSectModulus,
    getValidatedActualBendingStress,
    getValidatedActualDeflextion,
    getValidatedSectModulus,
    getValidatedActualSelfWeight,
  } = usePurlinComputations({ form });
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold mb-4">Part IV: Select Type & Section Of Steel</h2>
      <div>
        <FormLabel>Actual Bending Stress</FormLabel>
        <NumberField disabled value={getActualBendingStress()} decimalScale={2} />
        {getValidatedActualBendingStress().status === 'success' ? (
          <FormMessage className="text-green-500">{getValidatedActualBendingStress().message}</FormMessage>
        ) : (
          <FormMessage className="text-red-500">{getValidatedActualBendingStress().message}</FormMessage>
        )}
      </div>
      <div>
        <FormLabel>Actual Deflextion</FormLabel>
        <NumberField disabled value={getActualDeflextion()} unit={'cm.'} decimalScale={2} />
        {getValidatedActualDeflextion().status === 'success' ? (
          <FormMessage className="text-green-500">{getValidatedActualDeflextion().message}</FormMessage>
        ) : (
          <FormMessage className="text-red-500">{getValidatedActualDeflextion().message}</FormMessage>
        )}
      </div>
      <div>
        <FormLabel>Actual Self Weight</FormLabel>
        <NumberField disabled value={getWeightOfSection()} unit={'kg./m.'} decimalScale={2} />
        {getValidatedActualSelfWeight().status === 'success' ? (
          <FormMessage className="text-green-500">{getValidatedActualSelfWeight().message}</FormMessage>
        ) : (
          <FormMessage className="text-red-500">{getValidatedActualSelfWeight().message}</FormMessage>
        )}
      </div>
      <div>
        <FormLabel>Actual Sect. Modulus</FormLabel>
        <NumberField disabled value={getActualSectModulus()} decimalScale={2} />
        {getValidatedSectModulus().status === 'success' ? (
          <FormMessage className="text-green-500">{getValidatedSectModulus().message}</FormMessage>
        ) : (
          <FormMessage className="text-red-500">{getValidatedSectModulus().message}</FormMessage>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      typeOfSagRod: '1',
      spanLength: 0,
      rangeOfPurlin: 0,
      slopeOfRoof: 0,
      weightOfTiles: 0,
      liveLoad: 30,
      windLoad: 30,
      useSelfWeight: 0,
      yieldStrength: '2400',
      modulusOfElasticity: 0,
      allowableDeflection: '120',
      typeOfSection: typeOfSections[0][0],
      trialSectionNo: 1,
      // typeOfSection: '1',
    },
  });

  return (
    <Tabs defaultValue="i" className="w-full h-full">
      <TabsList className="w-full flex">
        <TabsTrigger value="i" className="flex-1">
          I
        </TabsTrigger>
        <TabsTrigger value="ii" className="flex-1">
          II
        </TabsTrigger>
        <TabsTrigger value="iii" className="flex-1">
          III
        </TabsTrigger>
        <TabsTrigger value="iv" className="flex-1">
          IV
        </TabsTrigger>
        <TabsTrigger value="v" className="flex-1">
          V
        </TabsTrigger>
      </TabsList>
      <Form {...form}>
        <form className="px-6 pb-16">
          <TabsContent value="i">
            <DataForDesignForm form={form} />
          </TabsContent>
          <TabsContent value="ii">
            <PropertiesOfSteelForDesign form={form} />
          </TabsContent>
          <TabsContent value="iii">
            <ResultOfCalculationView form={form} />
          </TabsContent>
          <TabsContent value="iv">
            <SelectTypeAndSectionOfSteelForm form={form} />
          </TabsContent>
          <TabsContent value="v">
            <RecheckAllowableStressOnSection form={form} />
          </TabsContent>
        </form>
      </Form>
    </Tabs>
  );
}
