import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useColorScheme } from '@/hooks/useColorScheme'
import { Colors } from '@/constants/Colors'
import { savePlantToFirestore } from '../api/savePlant'
import type { PlantForm } from '@/features/plants/form/PlantForm'

export interface Step6ReviewLogic {
  backgroundColor: string
  tint: string
  saving: boolean
  handleSave(): void
}

export function useStep6Review(form: PlantForm): Step6ReviewLogic {
  const scheme = (useColorScheme() ?? 'dark') as keyof typeof Colors
  const backgroundColor = Colors[scheme].background
  const tint = Colors[scheme].tint

  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      await savePlantToFirestore(form)
      router.replace('/')
    } catch (e) {
      console.error('Error saving plant:', e)
    } finally {
      setSaving(false)
    }
  }

  return {
    backgroundColor,
    tint,
    saving,
    handleSave
  }
}
