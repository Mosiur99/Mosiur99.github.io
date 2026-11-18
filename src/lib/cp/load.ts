import data from '../../data/cp-stats.json';
import { cpStatsSchema } from './types';

export const cpStats = cpStatsSchema.parse(data);
