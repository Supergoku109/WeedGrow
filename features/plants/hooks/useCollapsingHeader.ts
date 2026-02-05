import { useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, interpolate, Extrapolate, useDerivedValue } from 'react-native-reanimated';

export function useCollapsingHeader(
  maxHeight: number,
  minHeight: number
) {
  const scrollY = useSharedValue(0);
  const maxScroll = maxHeight - minHeight;

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = Math.min(event.contentOffset.y, maxScroll);
    },
  });

  const animatedBgImageStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, maxScroll],
      [maxHeight, minHeight],
      Extrapolate.CLAMP
    );

    return {
      position: 'absolute',
      top: 0, // changed from insetsTop to 0
      left: 0,
      right: 0,
      width: '100%',
      height,
      overflow: 'hidden',
      zIndex: 0,
    };
  });

  const collapseProgress = useDerivedValue(() => {
    if (maxScroll <= 0) return 0;
    return Math.min(1, Math.max(0, scrollY.value / maxScroll));
  });

  return { onScroll, animatedBgImageStyle, collapseProgress };
}
