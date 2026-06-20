import { ref } from 'vue'
import { idbGetAll, idbPut, idbDelete } from '@/shared/lib/idb'
import type { SavedFormula } from './types'

const STORE = 'formulas'

const formulas = ref<SavedFormula[]>([])

async function refresh() {
  const all = await idbGetAll<SavedFormula>(STORE)
  formulas.value = all.sort((a, b) => b.createdAt - a.createdAt)
}

export function useFormulaLibrary() {
  async function load() {
    await refresh()
  }

  async function save(name: string, formula: string) {
    const entry: SavedFormula = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim() || 'Untitled',
      formula,
      createdAt: Date.now(),
    }
    await idbPut<SavedFormula>(STORE, entry)
    await refresh()
  }

  async function remove(id: string) {
    await idbDelete(STORE, id)
    await refresh()
  }

  return { formulas, load, save, remove }
}
