import { apiFetch } from '../lib/api'
import { SelectedAlgorithm, Algorithm } from '../types/algoTypes'

export const fetchAlgorithmParams = async (algorithmId: string): Promise<Record<string, any>> => {
  try {
    const response = await apiFetch(`/api/v1/algorithm/get_params/${algorithmId}`)
    return await response.json()
  } catch (err) {
    console.error('Failed to fetch params:', err)
    return {}
  }
}

export const updateAlgorithmsForStream = async (
  selectedStreamJob: number,
  selectedAlgorithms: SelectedAlgorithm[],
  originalAlgorithms: Algorithm[]
) => {
  // Determine algorithms to delete: those in original but not in selected
  const algorithmsToDelete = originalAlgorithms.filter(o =>
    !selectedAlgorithms.some(s => s.name === o.name)
  )

  // Delete removed algorithms
  for (const algo of algorithmsToDelete) {
    if (algo.id) {
      await apiFetch(`/api/v1/stream/${selectedStreamJob}/remove_algorithm/${algo.id}`, {
        method: 'DELETE'
      })
    }
  }

  // Add/update all selected algorithms
  const response = await apiFetch(`/api/v1/stream/${selectedStreamJob}/add_algorithms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      algorithms: selectedAlgorithms
    })
  })

  if (!response.ok) {
    throw new Error('Failed to update algorithms')
  }

  return await response.json()
}