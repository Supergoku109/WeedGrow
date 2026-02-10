import { evaluateWateringInsights } from '@/lib/suggestions/wateringSuggestions';
import { fetchLogsAndWeatherForRange } from '@/lib/logs/fetchLogsAndWeatherForRange';
import { fetchWeather } from '@/lib/weather/fetchWeather';
import { parseWeatherData } from '@/lib/weather/parseWeatherData';
import { updateWeatherCache } from '@/lib/weather/updateFirestore';
import logger from '@/lib/logger';
import {
  addDays,
  addRangeLog,
  createRangeWindow,
  makeLog,
  makePlantSummary,
  makeTimestamp,
  makeWeatherEntry,
  setRangeWeather,
  startOfDay,
  toDateKey,
  type RangeMap,
} from './fixtures';

jest.mock('@/lib/logs/fetchLogsAndWeatherForRange', () => ({
  fetchLogsAndWeatherForRange: jest.fn(),
}));

jest.mock('@/lib/weather/fetchWeather', () => ({
  fetchWeather: jest.fn(),
}));

jest.mock('@/lib/weather/parseWeatherData', () => ({
  parseWeatherData: jest.fn(),
}));

jest.mock('@/lib/weather/updateFirestore', () => ({
  updateWeatherCache: jest.fn(),
}));

jest.mock('@/lib/logger', () => ({
  __esModule: true,
  default: {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const fetchRangeMock = fetchLogsAndWeatherForRange as jest.MockedFunction<
  typeof fetchLogsAndWeatherForRange
>;
const fetchWeatherMock = fetchWeather as jest.MockedFunction<typeof fetchWeather>;
const parseWeatherDataMock = parseWeatherData as jest.MockedFunction<typeof parseWeatherData>;
const updateWeatherCacheMock = updateWeatherCache as jest.MockedFunction<typeof updateWeatherCache>;
const loggerMock = logger as jest.Mocked<typeof logger>;

const FROZEN_NOW = new Date(2026, 1, 10, 12, 0, 0, 0);
const TODAY_START = startOfDay(FROZEN_NOW);
const TODAY_KEY = toDateKey(TODAY_START);
const YESTERDAY_KEY = toDateKey(addDays(TODAY_START, -1));
const TOMORROW_KEY = toDateKey(addDays(TODAY_START, 1));

function makeFullPathRange(lookbackDays = 6): RangeMap {
  const range = createRangeWindow(TODAY_START, lookbackDays);
  setRangeWeather(range, TODAY_KEY, makeWeatherEntry(TODAY_KEY));
  setRangeWeather(range, YESTERDAY_KEY, makeWeatherEntry(YESTERDAY_KEY));
  setRangeWeather(range, TOMORROW_KEY, makeWeatherEntry(TOMORROW_KEY));
  return range;
}

function makePlanBRange(lookbackDays = 6): RangeMap {
  const range = createRangeWindow(TODAY_START, lookbackDays);
  setRangeWeather(range, TODAY_KEY, makeWeatherEntry(TODAY_KEY));
  setRangeWeather(range, YESTERDAY_KEY, null);
  setRangeWeather(range, TOMORROW_KEY, makeWeatherEntry(TOMORROW_KEY));
  return range;
}

describe('evaluateWateringInsights (black-box)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FROZEN_NOW);
    jest.clearAllMocks();
    fetchWeatherMock.mockResolvedValue({} as any);
    parseWeatherDataMock.mockReturnValue({});
    updateWeatherCacheMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('1) returns [] for empty input', async () => {
    const result = await evaluateWateringInsights([]);
    expect(result).toEqual([]);
    expect(fetchRangeMock).not.toHaveBeenCalled();
  });

  it('2) skips non-active plant', async () => {
    const archived = makePlantSummary({ id: 'p-archived', status: 'archived' as any });
    const result = await evaluateWateringInsights([archived]);
    expect(result).toEqual([]);
    expect(fetchRangeMock).not.toHaveBeenCalled();
  });

  it('3) uses default lookback (6) and end window (tomorrow)', async () => {
    const plant = makePlantSummary({ id: 'p-default-window' });
    fetchRangeMock.mockResolvedValue(makeFullPathRange(6));

    await evaluateWateringInsights([plant]);

    expect(fetchRangeMock).toHaveBeenCalledWith(
      plant.id,
      toDateKey(addDays(TODAY_START, -6)),
      toDateKey(addDays(TODAY_START, 1)),
    );
  });

  it('4) honors custom lookbackDays option', async () => {
    const plant = makePlantSummary({ id: 'p-custom-window' });
    fetchRangeMock.mockResolvedValue(makeFullPathRange(2));

    await evaluateWateringInsights([plant], { lookbackDays: 2 });

    expect(fetchRangeMock).toHaveBeenCalledWith(
      plant.id,
      toDateKey(addDays(TODAY_START, -2)),
      toDateKey(addDays(TODAY_START, 1)),
    );
  });

  it('5) omits plant when range fetch fails and logs error', async () => {
    const plant = makePlantSummary({ id: 'p-fetch-fail' });
    fetchRangeMock.mockRejectedValue(new Error('range failed'));

    const result = await evaluateWateringInsights([plant]);

    expect(result).toEqual([]);
    expect(loggerMock.error).toHaveBeenCalledWith(
      'Failed to fetch logs/weather for plant',
      expect.objectContaining({ plantId: plant.id, error: expect.any(Error) }),
    );
  });

  it('6) mixed batch keeps successful insights when one fetch fails', async () => {
    const badPlant = makePlantSummary({ id: 'p-bad' });
    const goodPlant = makePlantSummary({ id: 'p-good' });

    fetchRangeMock.mockImplementation(async (plantId) => {
      if (plantId === badPlant.id) throw new Error('bad range');
      return makeFullPathRange(6);
    });

    const result = await evaluateWateringInsights([badPlant, goodPlant]);

    expect(result).toHaveLength(1);
    expect(result[0].plantId).toBe(goodPlant.id);
  });

  it('7) triggers weather refresh when today/tomorrow weather missing and coords exist', async () => {
    const plant = makePlantSummary({ id: 'p-refresh' });
    const range = createRangeWindow(TODAY_START, 6);
    setRangeWeather(range, YESTERDAY_KEY, makeWeatherEntry(YESTERDAY_KEY));
    setRangeWeather(range, TODAY_KEY, null);
    setRangeWeather(range, TOMORROW_KEY, null);

    const parsed = {
      [TODAY_KEY]: makeWeatherEntry(TODAY_KEY, { temperature: 27 }),
      [TOMORROW_KEY]: makeWeatherEntry(TOMORROW_KEY, { rainfall: 0 }),
    };

    fetchRangeMock.mockResolvedValue(range);
    parseWeatherDataMock.mockReturnValue(parsed as any);

    const result = await evaluateWateringInsights([plant]);

    expect(result).toHaveLength(1);
    expect(fetchWeatherMock).toHaveBeenCalledWith(plant.location!.lat, plant.location!.lng);
    expect(updateWeatherCacheMock).toHaveBeenCalledWith(plant.id, parsed);
  });

  it('8) does not refresh weather when coordinates are missing', async () => {
    const plant = makePlantSummary({ id: 'p-no-coords', location: undefined as any });
    const range = makeFullPathRange(6);
    setRangeWeather(range, TOMORROW_KEY, null);
    fetchRangeMock.mockResolvedValue(range);

    const [insight] = await evaluateWateringInsights([plant]);

    expect(insight).toBeDefined();
    expect(fetchWeatherMock).not.toHaveBeenCalled();
    expect(updateWeatherCacheMock).not.toHaveBeenCalled();
  });

  it('9) refresh failure does not throw and falls back safely', async () => {
    const plant = makePlantSummary({ id: 'p-refresh-fail' });
    const range = createRangeWindow(TODAY_START, 6);
    setRangeWeather(range, YESTERDAY_KEY, makeWeatherEntry(YESTERDAY_KEY));
    setRangeWeather(range, TODAY_KEY, null);
    setRangeWeather(range, TOMORROW_KEY, null);
    fetchRangeMock.mockResolvedValue(range);
    fetchWeatherMock.mockRejectedValue(new Error('weather API down'));

    const [insight] = await evaluateWateringInsights([plant]);

    expect(insight.reason).toContain('Weather data is still syncing');
    expect(loggerMock.error).toHaveBeenCalledWith(
      'Failed to refresh weather for plant',
      expect.objectContaining({ plantId: plant.id, error: expect.any(Error) }),
    );
  });

  it('10) missing today weather after fallback returns neutral/manual-check insight', async () => {
    const plant = makePlantSummary({ id: 'p-missing-today', location: undefined as any });
    const range = createRangeWindow(TODAY_START, 6);
    setRangeWeather(range, YESTERDAY_KEY, makeWeatherEntry(YESTERDAY_KEY));
    setRangeWeather(range, TODAY_KEY, null);
    setRangeWeather(range, TOMORROW_KEY, makeWeatherEntry(TOMORROW_KEY));
    fetchRangeMock.mockResolvedValue(range);

    const [insight] = await evaluateWateringInsights([plant]);

    expect(insight.needsWater).toBe(false);
    expect(insight.lastWaterSource).toBe('unknown');
    expect(insight.score).toBe(0);
    expect(insight.reason).toContain('Weather data is still syncing');
  });

  it('11) Plan B is used when yesterday weather is missing and today exists', async () => {
    const plant = makePlantSummary({ id: 'p-plan-b' });
    fetchRangeMock.mockResolvedValue(makePlanBRange(6));

    const [insight] = await evaluateWateringInsights([plant]);

    expect(insight.score).toBe(0);
    expect(insight.daysSinceLastWater).toBe(1);
    expect(insight.lastWaterSource).toBe('unknown');
    expect(insight.reason).toContain('Using current and forecast data only');
  });

  it('12) Plan B with today rain above threshold marks needsWater=false', async () => {
    const plant = makePlantSummary({ id: 'p-plan-b-rain' });
    const range = makePlanBRange(6);
    setRangeWeather(range, TODAY_KEY, makeWeatherEntry(TODAY_KEY, { rainfall: 10 }));
    fetchRangeMock.mockResolvedValue(range);

    const [insight] = await evaluateWateringInsights([plant]);

    expect(insight.needsWater).toBe(false);
    expect(insight.todayRainfall).toBe(10);
  });

  it('13) Plan B with no significant rain and hot forecast marks needsWater=true', async () => {
    const plant = makePlantSummary({ id: 'p-plan-b-hot' });
    const range = makePlanBRange(6);
    setRangeWeather(range, TODAY_KEY, makeWeatherEntry(TODAY_KEY, { temperature: 35, rainfall: 0 }));
    setRangeWeather(range, TOMORROW_KEY, makeWeatherEntry(TOMORROW_KEY, { rainfall: 0 }));
    fetchRangeMock.mockResolvedValue(range);

    const [insight] = await evaluateWateringInsights([plant]);

    expect(insight.needsWater).toBe(true);
    expect(insight.reason).toContain('Forecast is sunny/hot');
  });

  it('14) picks manual as lastWaterSource when manual event is newer than rain', async () => {
    const plant = makePlantSummary({ id: 'p-manual-newer' });
    const range = makeFullPathRange(6);
    const rainDay = toDateKey(addDays(TODAY_START, -3));
    setRangeWeather(range, rainDay, makeWeatherEntry(rainDay, { rainfall: 2 }));

    const manualAt = new Date(TODAY_START);
    manualAt.setDate(manualAt.getDate() - 1);
    manualAt.setHours(15, 0, 0, 0);
    addRangeLog(range, YESTERDAY_KEY, makeLog(manualAt, 'watering'));

    fetchRangeMock.mockResolvedValue(range);

    const [insight] = await evaluateWateringInsights([plant]);

    expect(insight.lastWaterSource).toBe('manual');
    expect(insight.daysSinceLastWater).toBe(1);
  });

  it('15) picks rain as lastWaterSource when rain event is newer than manual', async () => {
    const plant = makePlantSummary({ id: 'p-rain-newer' });
    const range = makeFullPathRange(6);

    const manualAt = new Date(TODAY_START);
    manualAt.setDate(manualAt.getDate() - 5);
    manualAt.setHours(10, 0, 0, 0);
    addRangeLog(range, toDateKey(addDays(TODAY_START, -5)), makeLog(manualAt, 'watering'));

    setRangeWeather(range, YESTERDAY_KEY, makeWeatherEntry(YESTERDAY_KEY, { rainfall: 10 }));

    fetchRangeMock.mockResolvedValue(range);

    const [insight] = await evaluateWateringInsights([plant]);

    expect(insight.lastWaterSource).toBe('rain');
    expect(insight.daysSinceLastWater).toBe(1);
  });

  it('16) created-today + no history currently resolves via Plan B fallback behavior', async () => {
    const plant = makePlantSummary({
      id: 'p-created-today',
      createdAt: makeTimestamp(TODAY_START),
    } as any);
    fetchRangeMock.mockResolvedValue(makePlanBRange(6));

    const [insight] = await evaluateWateringInsights([plant]);

    expect(insight.daysSinceLastWater).toBe(1);
    expect(insight.reason).toContain('Using current and forecast data only');
  });

  it('17) older createdAt + no history currently resolves via Plan B fallback behavior', async () => {
    const oldCreatedAt = addDays(TODAY_START, -30);
    const plant = makePlantSummary({
      id: 'p-created-old',
      createdAt: makeTimestamp(oldCreatedAt),
    } as any);
    fetchRangeMock.mockResolvedValue(makePlanBRange(6));

    const [insight] = await evaluateWateringInsights([plant]);

    expect(insight.daysSinceLastWater).toBe(1);
    expect(insight.reason).toContain('Using current and forecast data only');
  });

  it('18) base thresholdDays by environment are indoor=3, greenhouse=2.5, outdoor=2', async () => {
    const indoor = makePlantSummary({ id: 'p-indoor', environment: 'indoor' });
    const greenhouse = makePlantSummary({ id: 'p-greenhouse', environment: 'greenhouse' });
    const outdoor = makePlantSummary({ id: 'p-outdoor', environment: 'outdoor' });
    fetchRangeMock.mockResolvedValue(makePlanBRange(6));

    const result = await evaluateWateringInsights([indoor, greenhouse, outdoor]);
    const byPlant = new Map(result.map((r) => [r.plantId, r]));

    expect(byPlant.get(indoor.id)?.thresholdDays).toBe(3);
    expect(byPlant.get(greenhouse.id)?.thresholdDays).toBe(2.5);
    expect(byPlant.get(outdoor.id)?.thresholdDays).toBe(2);
  });

  it('19) climate reductions apply (very hot/hot/low-humidity)', async () => {
    const plant = makePlantSummary({ id: 'p-climate-reduce' });

    const veryHotRange = makeFullPathRange(6);
    setRangeWeather(veryHotRange, TODAY_KEY, makeWeatherEntry(TODAY_KEY, { temperature: 34, humidity: 60 }));
    setRangeWeather(veryHotRange, TOMORROW_KEY, makeWeatherEntry(TOMORROW_KEY, { rainfall: 0 }));
    fetchRangeMock.mockResolvedValueOnce(veryHotRange);
    const [veryHotInsight] = await evaluateWateringInsights([plant]);

    const hotLowHumidityRange = makeFullPathRange(6);
    setRangeWeather(
      hotLowHumidityRange,
      TODAY_KEY,
      makeWeatherEntry(TODAY_KEY, { temperature: 31, humidity: 40 }),
    );
    setRangeWeather(hotLowHumidityRange, TOMORROW_KEY, makeWeatherEntry(TOMORROW_KEY, { rainfall: 0 }));
    fetchRangeMock.mockResolvedValueOnce(hotLowHumidityRange);
    const [hotLowHumidityInsight] = await evaluateWateringInsights([plant]);

    expect(veryHotInsight.thresholdDays).toBe(1.25);
    expect(hotLowHumidityInsight.thresholdDays).toBe(1.2);
  });

  it('20) climate increases and clamping keep thresholdDays in [1, 4]', async () => {
    const indoorPlant = makePlantSummary({ id: 'p-clamp-high', environment: 'indoor' });
    const highRange = makeFullPathRange(6);
    setRangeWeather(
      highRange,
      TODAY_KEY,
      makeWeatherEntry(TODAY_KEY, { temperature: 18, cloudCoverage: 80, humidity: 60 }),
    );
    setRangeWeather(highRange, TOMORROW_KEY, makeWeatherEntry(TOMORROW_KEY, { rainfall: 10 }));
    fetchRangeMock.mockResolvedValueOnce(highRange);
    const [highInsight] = await evaluateWateringInsights([indoorPlant]);

    const outdoorPlant = makePlantSummary({ id: 'p-clamp-low', environment: 'outdoor' });
    const lowRange = makeFullPathRange(6);
    setRangeWeather(
      lowRange,
      TODAY_KEY,
      makeWeatherEntry(TODAY_KEY, { temperature: 35, humidity: 20, cloudCoverage: 20 }),
    );
    setRangeWeather(lowRange, TOMORROW_KEY, makeWeatherEntry(TOMORROW_KEY, { rainfall: 0 }));
    fetchRangeMock.mockResolvedValueOnce(lowRange);
    const [lowInsight] = await evaluateWateringInsights([outdoorPlant]);

    expect(highInsight.thresholdDays).toBe(4);
    expect(lowInsight.thresholdDays).toBe(1);
  });

  it('21) dryness decision and today-rain override behave as expected', async () => {
    const plant = makePlantSummary({ id: 'p-dryness' });

    const dryRange = makeFullPathRange(6);
    setRangeWeather(dryRange, TODAY_KEY, makeWeatherEntry(TODAY_KEY, { rainfall: 0, temperature: 24, humidity: 55 }));
    setRangeWeather(dryRange, TOMORROW_KEY, makeWeatherEntry(TOMORROW_KEY, { rainfall: 0 }));
    fetchRangeMock.mockResolvedValueOnce(dryRange);
    const [dryInsight] = await evaluateWateringInsights([plant]);

    const rainRange = makeFullPathRange(6);
    setRangeWeather(rainRange, TODAY_KEY, makeWeatherEntry(TODAY_KEY, { rainfall: 10 }));
    setRangeWeather(rainRange, TOMORROW_KEY, makeWeatherEntry(TOMORROW_KEY, { rainfall: 0 }));
    fetchRangeMock.mockResolvedValueOnce(rainRange);
    const [rainOverrideInsight] = await evaluateWateringInsights([plant]);

    expect(dryInsight.needsWater).toBe(true);
    expect(rainOverrideInsight.needsWater).toBe(false);
    expect(rainOverrideInsight.daysSinceLastWater).toBe(0);
    expect(rainOverrideInsight.lastWaterSource).toBe('rain');
  });

  it('22) significant tomorrow rain only suppresses watering when still near threshold', async () => {
    const plant = makePlantSummary({ id: 'p-tomorrow-rain-lock' });

    const nearRange = makeFullPathRange(6);
    const nearManual = new Date(TODAY_START);
    nearManual.setDate(nearManual.getDate() - 1);
    nearManual.setHours(14, 0, 0, 0);
    addRangeLog(nearRange, YESTERDAY_KEY, makeLog(nearManual));
    setRangeWeather(nearRange, TOMORROW_KEY, makeWeatherEntry(TOMORROW_KEY, { rainfall: 10 }));
    fetchRangeMock.mockResolvedValueOnce(nearRange);
    const [nearInsight] = await evaluateWateringInsights([plant]);

    const farRange = makeFullPathRange(6);
    const farManual = new Date(TODAY_START);
    farManual.setDate(farManual.getDate() - 4);
    farManual.setHours(14, 0, 0, 0);
    addRangeLog(farRange, toDateKey(addDays(TODAY_START, -4)), makeLog(farManual));
    setRangeWeather(farRange, TOMORROW_KEY, makeWeatherEntry(TOMORROW_KEY, { rainfall: 10 }));
    fetchRangeMock.mockResolvedValueOnce(farRange);
    const [farInsight] = await evaluateWateringInsights([plant]);

    expect(nearInsight.needsWater).toBe(false);
    expect(farInsight.needsWater).toBe(true);
    expect(farInsight.daysSinceLastWater).toBe(4);
  });
});
