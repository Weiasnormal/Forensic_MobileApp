import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  icon: () => React.ReactNode;
}

const slides: OnboardingSlide[] = [
  {
    id: 0,
    title: 'AI-powered signature verification',
    description:
      "Upload reference signatures and let Avera's forensic AI detect forgeries with high accuracy — in seconds.",
    icon: () => (
      <Svg width={48} height={48} viewBox="0 0 48 48" fill="none">
        <Path
          d="M24 6c0 0-10 7-10 16 0 5.52 4.48 10 10 10s10-4.48 10-10c0-9-10-16-10-16z"
          stroke="#185FA5"
          strokeWidth={2}
          strokeLinecap="round"
          fill="#E6F1FB"
        />
        <Circle cx={24} cy={22} r={3.5} stroke="#185FA5" strokeWidth={1.5} />
        <Path
          d="M18 31.5c0 2 2 3.5 6 3.5s6-1.5 6-3.5"
          stroke="#6AAEE8"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </Svg>
    ),
  },
  {
    id: 1,
    title: 'Three visualization modes',
    description:
      'Heatmap, bounding box, and stroke diff overlays highlight exactly where signatures deviate — for clear, defensible results.',
    icon: () => (
      <Svg width={48} height={48} viewBox="0 0 48 48" fill="none">
        <Rect
          x={8}
          y={8}
          width={32}
          height={32}
          rx={8}
          stroke="#185FA5"
          strokeWidth={2}
          fill="#E6F1FB"
        />
        <Path
          d="M16 24h16M16 32h10M24 16l6 6-6 6"
          stroke="#185FA5"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
  },
  {
    id: 2,
    title: 'Trusted by institutions',
    description:
      'Designed for PNP crime labs, academic forensic departments, and courts. Export a signed PDF report for every case.',
    icon: () => (
      <Svg width={48} height={48} viewBox="0 0 48 48" fill="none">
        <Circle cx={24} cy={24} r={16} stroke="#185FA5" strokeWidth={2} fill="#E6F1FB" />
        <Path
          d="M16 24l5 5 11-11"
          stroke="#185FA5"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
  },
];

const GetStartedPage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push('/_login/CreateAccountpage');
    }
  };

  const handleSkip = () => {
    router.push('/_login/LogInPage');
  };

  const currentSlide = slides[currentIndex];
  const isLastSlide = currentIndex === slides.length - 1;
  const buttonText = isLastSlide ? 'Get started' : 'Next';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statusBar}>
        <Text style={styles.time}>9:41</Text>
      </View>

      <View style={styles.slidesContainer}>
        {slides.map((slide, index) => (
          <View
            key={slide.id}
            style={[
              styles.slide,
              {
                opacity: index === currentIndex ? 1 : 0,
                display: index === currentIndex ? 'flex' : 'none',
              },
            ]}
          >
            <View style={styles.iconWrapper}>{slide.icon()}</View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navButtons}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  statusBar: {
    height: 54,
    justifyContent: 'flex-end',
    paddingHorizontal: 28,
    paddingBottom: 10,
    flexDirection: 'row',
  },
  time: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: '#0F172A',
  },
  slidesContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingTop: 40,
    paddingBottom: 20,
  },
  iconWrapper: {
    width: 104,
    height: 104,
    borderRadius: 30,
    backgroundColor: '#E6F1FB',
    borderWidth: 1.5,
    borderColor: '#B5D4F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 23.5,
  },
  footer: {
    paddingHorizontal: 26,
    paddingBottom: 32,
    paddingTop: 24,
    flexShrink: 0,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
    marginBottom: 24,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#E2E8F0',
  },
  dotActive: {
    width: 22,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#185FA5',
  },
  navButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  skipButton: {
    flex: 0,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0C447C',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: '#185FA5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default GetStartedPage;
