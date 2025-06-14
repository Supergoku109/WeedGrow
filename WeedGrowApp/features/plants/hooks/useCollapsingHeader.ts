import { useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';

export function useCollapsingHeader(
  maxHeight: number,
  minHeight: number,
  insetsTop: number,
  themeBackground: string
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

    const opacity = interpolate(
      scrollY.value,
      [0, maxScroll * 0.8, maxScroll],
      [1, 1, 0],
      Extrapolate.CLAMP
    );

    return {
      position: 'absolute',
      top: insetsTop,
      left: 0,
      right: 0,
      width: '100%',
      height,
      opacity,
      zIndex: 0,
    };
  });

  const galleryBarAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, maxScroll],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      position: 'absolute',
      top: insetsTop,
      left: 0,
      right: 0,
      height: minHeight,
      opacity,
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [0, maxScroll],
            [minHeight, 0],
            Extrapolate.CLAMP
          ),
        },
      ],
      zIndex: 10,
      backgroundColor: themeBackground,
      borderBottomWidth: opacity > 0.95 ? 1 : 0,
      borderBottomColor: '#ddd',
      justifyContent: 'center',
    };
  });

  return { onScroll, animatedBgImageStyle, galleryBarAnimatedStyle };
}
