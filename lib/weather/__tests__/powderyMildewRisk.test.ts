import { assessPowderyMildewRisk } from '@/lib/weather/powderyMildewRisk';

describe('assessPowderyMildewRisk', () => {
  it('returns low risk for dry conditions below 60% humidity', () => {
    const result = assessPowderyMildewRisk([
      { dayHumidity: 52, dayTemperatureC: 23 },
    ]);

    expect(result.level).toBe('low');
    expect(result.shouldWarn).toBe(false);
  });

  it('returns watch risk when humidity is at the risk start threshold', () => {
    const result = assessPowderyMildewRisk([
      { dayHumidity: 60, dayTemperatureC: 23 },
    ]);

    expect(result.level).toBe('watch');
    expect(result.shouldWarn).toBe(false);
  });

  it('returns high risk in 65-85% humidity with favorable temperature', () => {
    const result = assessPowderyMildewRisk([
      { dayHumidity: 70, dayTemperatureC: 23 },
    ]);

    expect(result.level).toBe('high');
    expect(result.shouldWarn).toBe(true);
  });

  it('returns very high risk when 70%+ humidity persists for two warm days', () => {
    const result = assessPowderyMildewRisk([
      { dayHumidity: 71, dayTemperatureC: 22 },
      { dayHumidity: 74, dayTemperatureC: 24 },
    ]);

    expect(result.level).toBe('very_high');
    expect(result.shouldWarn).toBe(true);
    expect(result.consecutiveVeryHumidWarmDays).toBe(2);
  });

  it('keeps very high risk for three consecutive humid warm days', () => {
    const result = assessPowderyMildewRisk([
      { dayHumidity: 70, dayTemperatureC: 21 },
      { dayHumidity: 72, dayTemperatureC: 22 },
      { dayHumidity: 75, dayTemperatureC: 24 },
    ]);

    expect(result.level).toBe('very_high');
    expect(result.consecutiveVeryHumidWarmDays).toBe(3);
  });

  it('drops risk when it is too cold (<12C)', () => {
    const result = assessPowderyMildewRisk([
      { dayHumidity: 80, dayTemperatureC: 10 },
    ]);

    expect(result.level).not.toBe('very_high');
    expect(result.shouldWarn).toBe(false);
  });

  it('drops risk when it is too hot (>30C)', () => {
    const result = assessPowderyMildewRisk([
      { dayHumidity: 80, dayTemperatureC: 32 },
    ]);

    expect(result.level).toBe('watch');
    expect(result.shouldWarn).toBe(false);
  });

  it('escalates to very high when humid nights combine with warm days', () => {
    const result = assessPowderyMildewRisk([
      { dayHumidity: 66, dayTemperatureC: 22, nightHumidity: 72 },
      { dayHumidity: 68, dayTemperatureC: 23, nightHumidity: 75 },
    ]);

    expect(result.level).toBe('very_high');
    expect(result.shouldWarn).toBe(true);
    expect(result.reasons.join(' ')).toContain('Humid nights');
  });

  it('reduces mildew risk by one level with high wind under humid mild daytime conditions', () => {
    const result = assessPowderyMildewRisk([
      { dayHumidity: 70, dayTemperatureC: 23, windSpeedKph: 28 },
    ]);

    expect(result.level).toBe('watch');
    expect(result.shouldWarn).toBe(false);
    expect(result.reasons.join(' ')).toContain('Wind near');
  });

  it('escalates mildew risk with low wind under humid mild daytime conditions', () => {
    const result = assessPowderyMildewRisk([
      { dayHumidity: 70, dayTemperatureC: 23, windSpeedKph: 4 },
    ]);

    expect(result.level).toBe('very_high');
    expect(result.shouldWarn).toBe(true);
    expect(result.reasons.join(' ')).toContain('Low wind');
  });

  it('escalates risk on condensation nights even when daytime averages are the same', () => {
    const control = assessPowderyMildewRisk([
      { dayHumidity: 64, dayTemperatureC: 23, nightHumidity: 82, dewPointC: 10, nightTemperatureC: 16 },
    ]);
    const condensation = assessPowderyMildewRisk([
      { dayHumidity: 64, dayTemperatureC: 23, nightHumidity: 82, dewPointC: 14, nightTemperatureC: 15 },
    ]);

    expect(control.level).toBe('high');
    expect(condensation.level).toBe('very_high');
    expect(condensation.shouldWarn).toBe(true);
    expect(condensation.reasons.join(' ')).toContain('condensation');
  });

  it('handles empty samples defensively', () => {
    const result = assessPowderyMildewRisk([]);

    expect(result.level).toBe('low');
    expect(result.shouldWarn).toBe(false);
    expect(result.consecutiveVeryHumidWarmDays).toBe(0);
  });
});
