"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, Save, RotateCcw } from "lucide-react"
import Swal from "sweetalert2"
import type { UtbkScore } from "@/types"

const FALLBACK_SUBTESTS = [
  { code: "PU", name: "Penalaran Umum" },
  { code: "PPU", name: "Pengetahuan & Pemahaman Umum" },
  { code: "PBM", name: "Pemahaman Bacaan & Menulis" },
  { code: "PK", name: "Pengetahuan Kuantitatif" },
  { code: "LBI", name: "Literasi Bahasa Indonesia" },
  { code: "LBE", name: "Literasi Bahasa Inggris" },
  { code: "PM", name: "Penalaran Matematika" },
]

function todayISO() {
  return new Date().toISOString().split("T")[0]
}

interface UtbkInputModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  competencies: Array<{ code: string; name: string; weight?: number }>
  editingId: number | null
  onSave: (input: { total_score: number; scores: Record<string, number>; label?: string | null; recorded_on?: string }) => Promise<void>
  onEditRequest: (row: UtbkScore) => void
  onDeleteRequest: (row: UtbkScore) => void
  utbkRows: UtbkScore[]
}

export function UtbkInputModal({ open, onOpenChange, competencies, editingId, onSave, onEditRequest, onDeleteRequest, utbkRows }: UtbkInputModalProps) {
  const subtests = competencies.length > 0 ? competencies.map((c) => ({ code: c.code, name: c.name })) : FALLBACK_SUBTESTS

  const [utbkScores, setUtbkScores] = React.useState<Record<string, string>>({})
  const [utbkTotal, setUtbkTotal] = React.useState<string>("")
  const [utbkTotalTouched, setUtbkTotalTouched] = React.useState(false)
  const [utbkLabel, setUtbkLabel] = React.useState("")
  const [utbkDate, setUtbkDate] = React.useState(todayISO())
  const [saving, setSaving] = React.useState(false)

  const weightOf = (code: string) => {
    const c = competencies.find((x) => x.code === code)
    return c && c.weight ? c.weight : 1
  }

  const numericScores = React.useMemo(() => {
    const out: Record<string, number> = {}
    subtests.forEach((s) => {
      const raw = utbkScores[s.code]
      if (raw === "" || raw == null) return
      const num = Number(raw)
      if (!Number.isNaN(num)) out[s.code] = num
    })
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [utbkScores, competencies])

  const suggestedTotal = React.useMemo(() => {
    const codes = subtests.map((s) => s.code).filter((c) => numericScores[c] != null)
    if (codes.length === 0) return 0
    const sum = codes.reduce((acc, c) => acc + numericScores[c] * weightOf(c), 0)
    const wsum = codes.reduce((acc, c) => acc + weightOf(c), 0) || 1
    return Math.round((sum / wsum) * 10) / 10
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericScores, competencies])

  React.useEffect(() => {
    if (!utbkTotalTouched) {
      setUtbkTotal(suggestedTotal ? String(suggestedTotal) : "")
    }
  }, [suggestedTotal, utbkTotalTouched])

  const resetForm = () => {
    setUtbkScores({})
    setUtbkTotal("")
    setUtbkTotalTouched(false)
    setUtbkLabel("")
    setUtbkDate(todayISO())
  }

  const handleScoreChange = (code: string, val: string) => {
    setUtbkTotalTouched(false)
    if (val === "") {
      setUtbkScores((prev) => ({ ...prev, [code]: "" }))
      return
    }
    let num = parseFloat(val.replace(",", "."))
    if (Number.isNaN(num)) num = 0
    num = Math.max(0, Math.min(1000, num))
    setUtbkScores((prev) => ({ ...prev, [code]: String(Math.round(num * 10) / 10) }))
  }

  const handleTotalChange = (val: string) => {
    setUtbkTotalTouched(true)
    if (val === "") {
      setUtbkTotal("")
      return
    }
    let num = parseFloat(val.replace(",", "."))
    if (Number.isNaN(num)) num = 0
    num = Math.max(0, Math.min(1000, num))
    setUtbkTotal(String(Math.round(num * 10) / 10))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const codes = subtests.map((s) => s.code)
    const missing = codes.filter((c) => utbkScores[c] === "" || utbkScores[c] == null)
    if (missing.length > 0) {
      Swal.fire({ icon: "warning", title: "Lengkapi semua subtes", text: `Masih ada ${missing.length} subtes yang belum diisi.`, confirmButtonColor: "#6355d8" })
      return
    }
    const total = Number(utbkTotal)
    if (Number.isNaN(total) || total < 0 || total > 1000) {
      Swal.fire({ icon: "warning", title: "Skor total tidak valid", text: "Masukkan skor total antara 0 sampai 1000.", confirmButtonColor: "#6355d8" })
      return
    }
    setSaving(true)
    await onSave({ total_score: total, scores: numericScores, label: utbkLabel || null, recorded_on: utbkDate })
    setSaving(false)
    resetForm()
    onOpenChange(false)
  }

  const handleEditClick = (row: UtbkScore) => {
    const s: Record<string, string> = {}
    subtests.forEach((x) => {
      s[x.code] = row.scores?.[x.code] != null ? String(row.scores[x.code]) : ""
    })
    setUtbkScores(s)
    setUtbkTotal(String(row.total_score))
    setUtbkTotalTouched(true)
    setUtbkLabel(row.label || "")
    setUtbkDate(row.recorded_on || todayISO())
    onEditRequest(row)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-3xl" showCloseButton>
        <DialogHeader>
          <DialogTitle>{editingId != null ? "Edit Nilai UTBK" : "Input Nilai Tryout UTBK"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <label className="text-[11px] font-semibold text-slate-500">Tanggal Tryout</label>
              <Input type="date" value={utbkDate} onChange={(e) => setUtbkDate(e.target.value)} className="h-auto px-3 py-2 rounded-lg text-sm" />
            </div>
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <label className="text-[11px] font-semibold text-slate-500">Keterangan</label>
              <Input type="text" value={utbkLabel} onChange={(e) => setUtbkLabel(e.target.value)} placeholder="cth: Tryout GO #3" className="h-auto px-3 py-2 rounded-lg text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {subtests.map((s) => (
              <div key={s.code} className="p-2.5 rounded-xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-card/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-800 dark:text-white">{s.code}</span>
                  <span className="text-[10px] text-slate-400">/1000</span>
                </div>
                <Input type="number" min="0" max="1000" step="0.1" inputMode="decimal" value={utbkScores[s.code] ?? ""} onChange={(e) => handleScoreChange(s.code, e.target.value)} placeholder="0" className="h-auto px-2.5 py-1.5 rounded-lg text-sm font-bold text-center" />
                <span className="text-[10px] text-slate-400 block truncate mt-1">{s.name}</span>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">Skor Total UTBK</span>
              <span className="text-[10px] text-slate-400">{utbkTotalTouched ? "Diisi manual" : "Otomatis (rata-rata berbobot)"}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Input type="number" min="0" max="1000" step="0.1" inputMode="decimal" value={utbkTotal} onChange={(e) => handleTotalChange(e.target.value)} placeholder="0" className="w-20 h-auto px-2.5 py-1.5 rounded-lg text-sm font-extrabold text-center text-primary" />
              <span className="text-[10px] text-slate-400">/1000</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button type="submit" disabled={saving} className="flex-1 gap-1.5 text-xs">
              {editingId == null ? (
                <>
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{saving ? "Menyimpan..." : "Simpan"}</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Menyimpan..." : "Perbarui"}</span>
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm} className="text-xs gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </Button>
          </div>
        </form>

        {utbkRows.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-border">
            <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">Riwayat Singkat</h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {utbkRows.slice(0, 5).map((row) => (
                <div key={row.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-card/50 text-xs">
                  <div className="min-w-0">
                    <span className="font-bold text-slate-800 dark:text-white">{row.total_score}</span>
                    <span className="text-slate-400 ml-2">{row.label || ""}</span>
                    <span className="text-[10px] text-slate-400 block">{new Date(row.recorded_on).toLocaleDateString("id-ID")}</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon-sm" variant="ghost" onClick={() => handleEditClick(row)}>
                      Edit
                    </Button>
                    <Button size="icon-sm" variant="ghost" className="text-red-500" onClick={() => onDeleteRequest(row)}>
                      Hapus
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
