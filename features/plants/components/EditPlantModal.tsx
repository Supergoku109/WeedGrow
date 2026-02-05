import React from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '@/ui/ThemedText';
import { WeedGrowFormSection } from '@/ui/WeedGrowFormSection';
import { AnimatedMakikoInput } from '@/components/ui/AnimatedMakikoInput';
import { AnimatedMakikoDropdownInput } from '@/components/ui/AnimatedMakikoDropdownInput';
import { getAvailableStrains } from '@/features/addPlant/api/basicInfoApi';
import { potSizeOptions, sunlightOptions } from '@/features/addPlant/api/environmentApi';
import { deletePlantAndSubcollections, updatePlant } from '../api/plantService';
import logger from '@/lib/logger';
import type { Plant } from '@/firestoreModels';
import { LinearGradient } from 'expo-linear-gradient';
import { ColorTokens, Typography } from '@/design-system/tokens';
import { useColorScheme } from '@/hooks/useColorScheme';

type EditPlantFormState = {
  name: string;
  height: string;
  strain: string;
  potSize: string;
  growthStage: string;
  environment: string;
  sunlightExposure: string;
  lat: string;
  lng: string;
};

type EditPlantFormErrors = {
  name?: string;
  height?: string;
  lat?: string;
  lng?: string;
  location?: string;
};

type EditPlantModalProps = {
  visible: boolean;
  plant: Plant;
  plantId: string;
  onClose: () => void;
};

const STAGE_OPTIONS = [
  { label: 'Germination', value: 'germination' },
  { label: 'Seedling', value: 'seedling' },
  { label: 'Vegetative', value: 'vegetative' },
  { label: 'Flowering', value: 'flowering' },
];

const ENVIRONMENT_OPTIONS = [
  { label: 'Outdoor', value: 'outdoor' },
  { label: 'Greenhouse', value: 'greenhouse' },
  { label: 'Indoor', value: 'indoor' },
];

const emptyFormState: EditPlantFormState = {
  name: '',
  height: '',
  strain: '',
  potSize: '',
  growthStage: '',
  environment: '',
  sunlightExposure: '',
  lat: '',
  lng: '',
};

export default function EditPlantModal({ visible, plant, plantId, onClose }: EditPlantModalProps) {
  const router = useRouter();
  const theme = (useColorScheme() ?? 'dark') as 'light' | 'dark';
  const [form, setForm] = React.useState<EditPlantFormState>(emptyFormState);
  const [errors, setErrors] = React.useState<EditPlantFormErrors>({});
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const hydratedForId = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!visible) {
      hydratedForId.current = null;
      return;
    }
    if (hydratedForId.current === plantId) return;
    setForm({
      name: plant.name ?? '',
      height: typeof plant.height === 'number' ? String(plant.height) : '',
      strain: plant.strain ?? '',
      potSize: plant.potSize ?? '',
      growthStage: plant.growthStage ?? '',
      environment: plant.environment ?? '',
      sunlightExposure: plant.sunlightExposure ?? '',
      lat: typeof plant.location?.lat === 'number' ? String(plant.location.lat) : '',
      lng: typeof plant.location?.lng === 'number' ? String(plant.location.lng) : '',
    });
    setErrors({});
    hydratedForId.current = plantId;
  }, [visible, plant, plantId]);

  const setField = React.useCallback(<K extends keyof EditPlantFormState>(key: K, value: EditPlantFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      if (key === 'name') delete next.name;
      if (key === 'height') delete next.height;
      if (key === 'lat') {
        delete next.lat;
        delete next.location;
      }
      if (key === 'lng') {
        delete next.lng;
        delete next.location;
      }
      return next;
    });
  }, []);

  const validate = React.useCallback(() => {
    const nextErrors: EditPlantFormErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Name is required.';
    if (form.height.trim() && Number.isNaN(Number(form.height))) {
      nextErrors.height = 'Height must be a number.';
    }

    const latFilled = form.lat.trim().length > 0;
    const lngFilled = form.lng.trim().length > 0;
    if (latFilled || lngFilled) {
      if (!latFilled || !lngFilled) {
        nextErrors.location = 'Enter both latitude and longitude.';
      } else {
        if (Number.isNaN(Number(form.lat))) nextErrors.lat = 'Latitude must be a number.';
        if (Number.isNaN(Number(form.lng))) nextErrors.lng = 'Longitude must be a number.';
      }
    }

    setErrors(nextErrors);
    return nextErrors;
  }, [form]);

  const buildUpdates = React.useCallback((current: Plant) => {
    const updates: Partial<Plant> = {};

    const trimmedName = form.name.trim();
    if (trimmedName && trimmedName !== current.name) updates.name = trimmedName;

    const nextHeight = form.height.trim() ? Number(form.height) : null;
    const currentHeight = typeof current.height === 'number' ? current.height : null;
    if (currentHeight !== nextHeight) updates.height = nextHeight as any;

    const nextStrain = form.strain.trim();
    if ((current.strain ?? '') !== nextStrain) updates.strain = nextStrain;

    const nextPotSize = form.potSize.trim() || null;
    if ((current.potSize ?? null) !== nextPotSize) updates.potSize = nextPotSize as any;

    const nextStage = form.growthStage;
    if (nextStage && nextStage !== current.growthStage) updates.growthStage = nextStage as any;

    const nextEnvironment = form.environment;
    if (nextEnvironment && nextEnvironment !== current.environment) updates.environment = nextEnvironment as any;

    const nextSunlight = form.sunlightExposure.trim() || null;
    if ((current.sunlightExposure ?? null) !== nextSunlight) {
      updates.sunlightExposure = nextSunlight as any;
    }

    const latFilled = form.lat.trim().length > 0;
    const lngFilled = form.lng.trim().length > 0;
    let nextLocation: Plant['location'] | null = null;
    if (latFilled && lngFilled) {
      nextLocation = { lat: Number(form.lat), lng: Number(form.lng) };
    }
    const currentLocation = current.location ?? null;
    const locationChanged =
      (!currentLocation && nextLocation) ||
      (currentLocation && !nextLocation) ||
      (currentLocation &&
        nextLocation &&
        (currentLocation.lat !== nextLocation.lat || currentLocation.lng !== nextLocation.lng));
    if (locationChanged) updates.location = nextLocation as any;

    return updates;
  }, [form]);

  const handleSave = React.useCallback(async () => {
    if (saving) return;
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) return;

    const updates = buildUpdates(plant);
    if (Object.keys(updates).length === 0) {
      onClose();
      return;
    }

    try {
      setSaving(true);
      await updatePlant(plantId, updates);
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save changes.';
      Alert.alert('Save failed', message);
      logger.error('Error saving plant edits', error);
    } finally {
      setSaving(false);
    }
  }, [plant, plantId, saving, validate, buildUpdates, onClose]);

  const handleDelete = React.useCallback(() => {
    if (deleting) return;
    Alert.alert('Delete Plant?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeleting(true);
            await deletePlantAndSubcollections(plantId);
            onClose();
            router.replace('/(tabs)?tabIndex=1');
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete plant.';
            Alert.alert('Delete failed', message);
            logger.error('Error deleting plant', error);
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  }, [plantId, deleting, router, onClose]);

  if (!visible) return null;

  const saveDisabled = saving;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={[ThemeColorsBgStart, ThemeColorsBgEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, theme === 'dark' ? styles.cardDark : styles.cardLight]}
        >
          <LinearGradient
            colors={['rgba(16,185,129,0.22)', 'rgba(59,130,246,0.16)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.accent}
          />

          <View style={styles.headerRow}>
            <ThemedText type="title" style={styles.title} accessibilityRole="header">
              Edit Plant
            </ThemedText>
            <Pressable
              onPress={onClose}
              style={styles.iconBtn}
              accessibilityRole="button"
              accessibilityLabel="Close edit plant"
            >
              <Feather name="x" size={22} color={ColorTokens.text.secondary} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <WeedGrowFormSection label="Basics" style={styles.section} labelStyle={styles.sectionLabel} spacing={16}>
              <AnimatedMakikoInput
                label="Plant Name"
                iconClass={FontAwesomeIcon}
                iconName="leaf"
                iconColor="#4caf50"
                value={form.name}
                onChangeText={(val) => setField('name', val)}
                inputStyle={styles.input}
              />
              {errors.name ? <ThemedText style={styles.errorText}>{errors.name}</ThemedText> : null}

              <AnimatedMakikoInput
                label="Height"
                iconClass={MaterialCommunityIcons}
                iconName="ruler"
                iconColor="#4caf50"
                value={form.height}
                onChangeText={(val) => setField('height', val)}
                keyboardType="numeric"
                inputStyle={styles.input}
              />
              {errors.height ? <ThemedText style={styles.errorText}>{errors.height}</ThemedText> : null}

              <AnimatedMakikoDropdownInput
                label="Strain"
                iconName="dna"
                iconClass={MaterialCommunityIcons}
                iconColor="#4caf50"
                value={form.strain}
                options={getAvailableStrains().map((opt) => ({ label: opt, value: opt }))}
                onSelect={(val) => setField('strain', val)}
                placeholder="Select strain"
              />
            </WeedGrowFormSection>

            <WeedGrowFormSection label="Setup" style={styles.section} labelStyle={styles.sectionLabel} spacing={16}>
              <AnimatedMakikoDropdownInput
                label="Stage"
                iconName="sprout"
                iconClass={MaterialCommunityIcons}
                iconColor="#4caf50"
                value={form.growthStage}
                options={STAGE_OPTIONS}
                onSelect={(val) => setField('growthStage', val)}
                placeholder="Select stage"
              />
              <AnimatedMakikoDropdownInput
                label="Environment"
                iconName="weather-partly-cloudy"
                iconClass={MaterialCommunityIcons}
                iconColor="#4caf50"
                value={form.environment}
                options={ENVIRONMENT_OPTIONS}
                onSelect={(val) => setField('environment', val)}
                placeholder="Select environment"
              />
              <AnimatedMakikoDropdownInput
                label="Pot Size"
                iconName="flower-pot"
                iconClass={MaterialCommunityIcons}
                iconColor="#4caf50"
                value={form.potSize}
                options={potSizeOptions.map((opt) => ({ label: opt, value: opt }))}
                onSelect={(val) => setField('potSize', val)}
                placeholder="Select pot size"
              />
              <AnimatedMakikoDropdownInput
                label="Sunlight Exposure"
                iconName="white-balance-sunny"
                iconClass={MaterialCommunityIcons}
                iconColor="#4caf50"
                value={form.sunlightExposure}
                options={sunlightOptions.map((opt) => ({ label: opt.label, value: opt.value }))}
                onSelect={(val) => setField('sunlightExposure', val)}
                placeholder="Select sunlight"
              />
            </WeedGrowFormSection>

            <WeedGrowFormSection label="Location" style={styles.section} labelStyle={styles.sectionLabel} spacing={16}>
              <View style={styles.locationRow}>
                <View style={styles.locationField}>
                  <AnimatedMakikoInput
                    label="Latitude"
                    iconClass={MaterialCommunityIcons}
                    iconName="map-marker"
                    iconColor="#4caf50"
                    value={form.lat}
                    onChangeText={(val) => setField('lat', val)}
                    keyboardType="numeric"
                    inputStyle={styles.input}
                    style={styles.inlineInput}
                  />
                  {errors.lat ? <ThemedText style={styles.errorText}>{errors.lat}</ThemedText> : null}
                </View>
                <View style={styles.locationField}>
                  <AnimatedMakikoInput
                    label="Longitude"
                    iconClass={MaterialCommunityIcons}
                    iconName="map-marker-outline"
                    iconColor="#4caf50"
                    value={form.lng}
                    onChangeText={(val) => setField('lng', val)}
                    keyboardType="numeric"
                    inputStyle={styles.input}
                    style={styles.inlineInput}
                  />
                  {errors.lng ? <ThemedText style={styles.errorText}>{errors.lng}</ThemedText> : null}
                </View>
              </View>
              {errors.location ? <ThemedText style={styles.errorText}>{errors.location}</ThemedText> : null}
            </WeedGrowFormSection>

            <View style={styles.buttonRow}>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.actionBtn,
                  styles.cancelBtn,
                  pressed && styles.btnPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Cancel editing plant"
                disabled={saving}
              >
                <ThemedText style={styles.cancelText}>Cancel</ThemedText>
              </Pressable>

              <LinearGradient
                colors={[ColorTokens.brand.primary, ColorTokens.brand.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.saveGradient}
              >
                <Pressable
                  onPress={handleSave}
                  style={({ pressed }) => [
                    styles.actionBtn,
                    styles.saveBtn,
                    pressed && !saveDisabled && styles.btnPressed,
                    saveDisabled && styles.btnDisabled,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Save plant changes"
                  disabled={saveDisabled}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
                  ) : (
                    <MaterialCommunityIcons name="content-save" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                  )}
                  <ThemedText style={styles.saveText}>{saving ? 'Saving...' : 'Save Changes'}</ThemedText>
                </Pressable>
              </LinearGradient>
            </View>

            <View style={styles.deleteRow}>
              <LinearGradient
                colors={['#ef4444', '#b91c1c']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.deleteGradient}
              >
                <Pressable
                  onPress={handleDelete}
                  style={({ pressed }) => [
                    styles.actionBtn,
                    styles.deleteBtn,
                    pressed && !deleting && styles.btnPressed,
                    deleting && styles.btnDisabled,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Delete plant"
                  disabled={deleting}
                >
                  {deleting ? (
                    <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
                  ) : (
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                  )}
                  <ThemedText style={styles.deleteText}>{deleting ? 'Deleting...' : 'Delete Plant'}</ThemedText>
                </Pressable>
              </LinearGradient>
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const ThemeColorsBgStart = 'rgba(20, 24, 31, 1)';
const ThemeColorsBgEnd = 'rgba(20, 24, 31, 1)';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 640,
    maxHeight: '92%',
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  cardDark: {
    backgroundColor: ColorTokens.background.card,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardLight: {
    backgroundColor: '#ffffff',
    borderColor: 'rgba(0,0,0,0.06)',
  },
  accent: {
    position: 'absolute',
    top: -60,
    right: -80,
    width: 280,
    height: 220,
    transform: [{ rotate: '20deg' }],
    borderRadius: 140,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    ...Typography.styles.h3,
    color: ColorTokens.text.primary,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingBottom: 12,
    gap: 16,
  },
  section: {
    marginTop: 0,
  },
  sectionLabel: {
    ...Typography.styles.label,
    color: ColorTokens.text.secondary,
    marginBottom: 12,
    marginLeft: 2,
  },
  input: {
    color: '#fff',
    fontSize: 16,
    paddingLeft: 45,
    height: 48,
    textAlignVertical: 'center',
    paddingTop: 0,
    paddingBottom: 0,
  },
  errorText: {
    color: ColorTokens.status.error,
    fontSize: 12,
    marginTop: -8,
  },
  locationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  locationField: {
    flex: 1,
  },
  inlineInput: {
    marginBottom: 0,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  cancelBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
  },
  cancelText: {
    color: ColorTokens.text.primary,
    fontWeight: '700',
  },
  saveGradient: {
    flex: 1,
    borderRadius: 12,
  },
  saveBtn: {
    backgroundColor: 'transparent',
  },
  saveText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  deleteRow: {
    marginTop: 12,
  },
  deleteGradient: {
    flex: 1,
    borderRadius: 12,
  },
  deleteBtn: {
    backgroundColor: 'transparent',
  },
  deleteText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  btnPressed: {
    opacity: 0.8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
