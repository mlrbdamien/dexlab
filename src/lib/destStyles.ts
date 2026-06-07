import type { DestinationCategorie } from '@/lib/types'

export const destColors: Record<DestinationCategorie, string> = {
  '8100':     'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800 [&_strong]:text-green-700 dark:[&_strong]:text-green-400',
  bleu:       'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800 [&_strong]:text-blue-700 dark:[&_strong]:text-blue-400',
  hemato:     'bg-rose-50 border-rose-200 dark:bg-rose-950 dark:border-rose-800 [&_strong]:text-rose-700 dark:[&_strong]:text-rose-400',
  mm:         'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800 [&_strong]:text-purple-700 dark:[&_strong]:text-purple-400',
  envoi:      'bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-700 [&_strong]:text-slate-700 dark:[&_strong]:text-slate-300',
  is:         'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800 [&_strong]:text-orange-700 dark:[&_strong]:text-orange-400',
  chimie:     'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800 [&_strong]:text-blue-800 dark:[&_strong]:text-blue-300',
  bacterio:   'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800 [&_strong]:text-amber-800 dark:[&_strong]:text-amber-300',
  genetique:  'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800 [&_strong]:text-green-800 dark:[&_strong]:text-green-300',
}
