// ============================================================
// hooks/useStore.js — Estado global con Zustand
// ============================================================
import { create } from 'zustand'
import { getNombres, getMesActivo, getResumen } from '../services/api'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export const useStore = create((set, get) => ({
  // Estado
  nombres  : { p1: 'P1', p2: 'P2' },
  mes      : MESES[new Date().getMonth()],
  meses    : MESES,
  resumen  : null,
  loading  : true,

  // Acciones
  init: async () => {
    try {
      const [nom, mesData] = await Promise.all([getNombres(), getMesActivo()])
      set({ nombres: { p1: nom.p1, p2: nom.p2 }, mes: mesData.mes })
      await get().refreshResumen()
    } finally {
      set({ loading: false })
    }
  },

  setMes: async (mes) => {
    set({ mes })
    await get().refreshResumen()
  },

  refreshResumen: async () => {
    try {
      const r = await getResumen(get().mes)
      set({ resumen: r })
    } catch {
      set({ resumen: null })
    }
  },
}))
