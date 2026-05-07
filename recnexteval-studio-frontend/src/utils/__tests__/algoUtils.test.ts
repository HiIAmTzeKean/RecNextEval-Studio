import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchAlgorithmParams, updateAlgorithmsForStream } from '../algoUtils'
import * as api from '../../lib/api'
import { Algorithm, SelectedAlgorithm } from '../../types/algoTypes'

vi.mock('../../lib/api', () => ({
  apiFetch: vi.fn(),
}))

const mockApiFetch = vi.mocked(api.apiFetch)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('fetchAlgorithmParams', () => {
  it('returns parsed params on a successful response', async () => {
    const params = { k: 10, threshold: 0.5 }
    mockApiFetch.mockResolvedValue({
      json: async () => params,
    } as Response)

    const result = await fetchAlgorithmParams('algo-1')

    expect(mockApiFetch).toHaveBeenCalledWith('/api/v1/algorithm/get_params/algo-1')
    expect(result).toEqual(params)
  })

  it('returns an empty object when the request throws', async () => {
    mockApiFetch.mockRejectedValue(new Error('Network error'))

    const result = await fetchAlgorithmParams('algo-1')

    expect(result).toEqual({})
  })
})

describe('updateAlgorithmsForStream', () => {
  const streamJobId = 42

  const selected: SelectedAlgorithm[] = [
    { name: 'AlgoA', params: { k: 5 } },
  ]

  const original: Algorithm[] = [
    { id: 1, name: 'AlgoA', description: 'kept' },
    { id: 2, name: 'AlgoB', description: 'removed' },
  ]

  it('deletes algorithms that are no longer selected', async () => {
    mockApiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ stream_job_id: streamJobId }),
    } as Response)

    await updateAlgorithmsForStream(streamJobId, selected, original)

    expect(mockApiFetch).toHaveBeenCalledWith(
      `/api/v1/stream/${streamJobId}/remove_algorithm/2`,
      { method: 'DELETE' }
    )
  })

  it('does not delete algorithms that are still selected', async () => {
    mockApiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)

    await updateAlgorithmsForStream(streamJobId, selected, original)

    const deleteCalls = mockApiFetch.mock.calls.filter(([, opts]) => opts?.method === 'DELETE')
    expect(deleteCalls).toHaveLength(1)
    expect(deleteCalls[0][0]).not.toContain('/remove_algorithm/1')
  })

  it('posts all selected algorithms', async () => {
    mockApiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)

    await updateAlgorithmsForStream(streamJobId, selected, original)

    expect(mockApiFetch).toHaveBeenCalledWith(
      `/api/v1/stream/${streamJobId}/add_algorithms`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ algorithms: selected }),
      })
    )
  })

  it('throws when the add-algorithms request fails', async () => {
    // First call = DELETE (ok), second call = POST (not ok)
    mockApiFetch
      .mockResolvedValueOnce({ ok: true } as Response)
      .mockResolvedValueOnce({ ok: false } as Response)

    await expect(
      updateAlgorithmsForStream(streamJobId, selected, original)
    ).rejects.toThrow('Failed to update algorithms')
  })

  it('skips the DELETE call for original algorithms without an id', async () => {
    const originalWithoutId: Algorithm[] = [
      { name: 'AlgoB', description: 'no id' },
    ]
    mockApiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)

    await updateAlgorithmsForStream(streamJobId, selected, originalWithoutId)

    const deleteCalls = mockApiFetch.mock.calls.filter(([, opts]) => opts?.method === 'DELETE')
    expect(deleteCalls).toHaveLength(0)
  })
})
