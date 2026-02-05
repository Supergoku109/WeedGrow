import React from 'react';
import { View, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/ui/ThemedText';

interface PlantHeaderProps {
  imageUri?: string;
  height: number;
  name: string;
  strain?: string;
  stage?: string;
  onEdit?: () => void;
}

function formatStage(stage?: string) {
  if (!stage) return '';
  return stage.charAt(0).toUpperCase() + stage.slice(1);
}

export default function PlantHeader({ imageUri, height, name, strain, stage, onEdit }: PlantHeaderProps) {
  if (!imageUri) {
    return (
      <View style={[styles.placeholder, { height }]}>
        <View style={styles.overlay}>
          <View style={styles.textBlock}>
            <ThemedText style={styles.name}>{name}</ThemedText>
            {strain ? <ThemedText style={styles.strain}>{strain}</ThemedText> : null}
            {stage ? (
              <View style={styles.stagePill}>
                <ThemedText style={styles.stageText}>{formatStage(stage)}</ThemedText>
              </View>
            ) : null}
          </View>
          {onEdit ? (
            <TouchableOpacity style={styles.editButton} onPress={onEdit} activeOpacity={0.85}>
              <MaterialCommunityIcons name="note-edit-outline" size={16} color="#ffffff" />
              <ThemedText style={styles.editButtonText}>Edit Plant</ThemedText>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <ImageBackground source={{ uri: imageUri }} style={[styles.image, { height }]} resizeMode="cover">
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.65)']}
        style={styles.gradient}
      />
      <View style={styles.overlay}>
        <View style={styles.textBlock}>
          <ThemedText style={styles.name}>{name}</ThemedText>
          {strain ? <ThemedText style={styles.strain}>{strain}</ThemedText> : null}
          {stage ? (
            <View style={styles.stagePill}>
              <ThemedText style={styles.stageText}>{formatStage(stage)}</ThemedText>
            </View>
          ) : null}
        </View>
        {onEdit ? (
          <TouchableOpacity style={styles.editButton} onPress={onEdit} activeOpacity={0.85}>
            <MaterialCommunityIcons name="note-edit-outline" size={16} color="#ffffff" />
            <ThemedText style={styles.editButtonText}>Edit Plant</ThemedText>
          </TouchableOpacity>
        ) : null}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  placeholder: {
    width: '100%',
    backgroundColor: '#1b1f22',
    justifyContent: 'flex-end',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 18,
    paddingTop: 60,
  },
  textBlock: {
    flex: 1,
    paddingRight: 12,
  },
  name: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f4f7f8',
  },
  strain: {
    marginTop: 4,
    fontSize: 16,
    color: '#d6dbe0',
  },
  stagePill: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  stageText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f4f7f8',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(120, 155, 130, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(200, 230, 210, 0.35)',
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
