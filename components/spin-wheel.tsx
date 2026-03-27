import React, { useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Circle, G, Path, Svg, Text as SvgText } from 'react-native-svg';

interface SpinWheelProps {
  meals: string[];
  onResult: (meal: string) => void;
}

const SEGMENT_COLORS = [
  '#E63946',
  '#2A9D8F',
  '#E9C46A',
  '#264653',
  '#F4A261',
  '#457B9D',
  '#A8DADC',
  '#6A0572',
  '#CB904D',
  '#1D6A96',
];

const WHEEL_SIZE = 280;
const CENTER = WHEEL_SIZE / 2;
const RADIUS = CENTER - 4;

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const s = polarToXY(cx, cy, r, startAngle);
  const e = polarToXY(cx, cy, r, endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M${cx},${cy} L${s.x},${s.y} A${r},${r},0,${large},1,${e.x},${e.y} Z`;
}

export default function SpinWheel({ meals, onResult }: SpinWheelProps) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const currentRotation = useRef(0);
  const isSpinning = useRef(false);

  if (!meals || meals.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>🍽️ Add meals to spin!</Text>
        <Text style={styles.emptySubText}>
          {`Add at least one meal below,\nthen press Spin!`}
        </Text>
      </View>
    );
  }

  const segmentAngle = 360 / meals.length;

  function spin() {
    if (isSpinning.current) return;
    isSpinning.current = true;

    const randomSegment = Math.floor(Math.random() * meals.length);
    const extraRotations = 5 + Math.floor(Math.random() * 6); // 5–10 full rotations
    // pointer is at top (0°). Segment i starts at i*segmentAngle.
    // To land on middle of randomSegment, the wheel must rotate so that
    // targetSegmentMid ends up at 0° (top). We need to rotate by -(targetSegmentMid)
    // plus extra full rotations.
    const targetSegmentMid = randomSegment * segmentAngle + segmentAngle / 2;
    const totalRotation = extraRotations * 360 + (360 - targetSegmentMid);
    const newRotation = currentRotation.current + totalRotation;

    Animated.timing(spinAnim, {
      toValue: newRotation,
      duration: 3500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      isSpinning.current = false;
      // Keep both the ref and the animated value in sync at the reduced angle so
      // subsequent spins always animate forward (toValue is always > current value).
      currentRotation.current = newRotation % 360;
      spinAnim.setValue(currentRotation.current);
      onResult(meals[randomSegment]);
    });
  }

  const rotate = spinAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
    extrapolate: 'extend',
  });

  return (
    <View style={styles.container}>
      {/* Pointer arrow at top */}
      <View style={styles.pointerContainer}>
        <View style={styles.pointer} />
      </View>

      {/* Animated wheel */}
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
          {/* Outer border circle */}
          <Circle cx={CENTER} cy={CENTER} r={RADIUS + 3} fill="#D4AF37" />

          {meals.map((meal, i) => {
            const startAngle = i * segmentAngle;
            const endAngle = startAngle + segmentAngle;
            const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
            const midAngle = startAngle + segmentAngle / 2;
            const midRad = ((midAngle - 90) * Math.PI) / 180;
            const labelR = RADIUS * 0.62;
            const lx = CENTER + labelR * Math.cos(midRad);
            const ly = CENTER + labelR * Math.sin(midRad);

            // Truncate label if too long
            const maxChars = Math.max(6, Math.floor(segmentAngle / 12));
            const displayLabel =
              meal.length > maxChars ? meal.substring(0, maxChars - 1) + '…' : meal;

            return (
              <G key={`seg-${i}`}>
                <Path d={slicePath(CENTER, CENTER, RADIUS, startAngle, endAngle)} fill={color} />
                <SvgText
                  x={lx}
                  y={ly}
                  fill="white"
                  fontSize={Math.max(8, Math.min(13, segmentAngle / 3))}
                  fontWeight="bold"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  rotation={midAngle}
                  originX={lx}
                  originY={ly}
                >
                  {displayLabel}
                </SvgText>
              </G>
            );
          })}

          {/* Divider lines between segments */}
          {meals.map((_, i) => {
            const angle = i * segmentAngle;
            const p = polarToXY(CENTER, CENTER, RADIUS, angle);
            return (
              <Path
                key={`div-${i}`}
                d={`M${CENTER},${CENTER} L${p.x},${p.y}`}
                stroke="rgba(255,255,255,0.4)"
                strokeWidth={1.5}
              />
            );
          })}

          {/* Center gold circle */}
          <Circle cx={CENTER} cy={CENTER} r={18} fill="#D4AF37" />
          <Circle cx={CENTER} cy={CENTER} r={10} fill="#fff" />
        </Svg>
      </Animated.View>

      {/* Spin button */}
      <TouchableOpacity style={styles.spinButton} onPress={spin} activeOpacity={0.8}>
        <Text style={styles.spinButtonText}>🌙 SPIN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  pointerContainer: {
    zIndex: 10,
    alignItems: 'center',
    marginBottom: -6,
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 26,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#D4AF37',
  },
  spinButton: {
    marginTop: 20,
    backgroundColor: '#1A5C38',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#D4AF37',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  spinButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    height: WHEEL_SIZE + 80,
  },
  emptyText: {
    fontSize: 28,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
