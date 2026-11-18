import { describe, expect, it, vi } from 'vitest';
import { HttpError, getJson } from '../../src/lib/cp/http';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const fast = { retryDelayMs: 0 };

describe('getJson', () => {
  it('returns the parsed body', async () => {
    const fetch = vi.fn().mockResolvedValue(json({ ok: true }));
    await expect(getJson('https://x.test', {}, { ...fast, fetch })).resolves.toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('retries server errors and then succeeds', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(json({}, 503))
      .mockResolvedValueOnce(json({ ok: true }));
    await expect(getJson('https://x.test', {}, { ...fast, fetch })).resolves.toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('retries network failures such as timeouts', async () => {
    const fetch = vi
      .fn()
      .mockRejectedValueOnce(new DOMException('timed out', 'TimeoutError'))
      .mockResolvedValueOnce(json({ ok: true }));
    await expect(getJson('https://x.test', {}, { ...fast, fetch })).resolves.toEqual({ ok: true });
  });

  it('gives up after the allowed retries', async () => {
    const fetch = vi.fn().mockResolvedValue(json({}, 502));
    await expect(getJson('https://x.test', {}, { ...fast, retries: 2, fetch })).rejects.toThrow(
      'answered 502',
    );
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('does not retry client errors', async () => {
    const fetch = vi.fn().mockResolvedValue(json({}, 404));
    await expect(getJson('https://x.test', {}, { ...fast, fetch })).rejects.toBeInstanceOf(
      HttpError,
    );
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('reports a body that is not JSON', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('<html>busy</html>', { status: 200 }));
    await expect(getJson('https://x.test', {}, { ...fast, retries: 0, fetch })).rejects.toThrow(
      'did not return valid JSON',
    );
  });

  it('passes a timeout signal to fetch', async () => {
    const fetch = vi.fn().mockResolvedValue(json({}));
    await getJson('https://x.test', {}, { ...fast, fetch });
    expect(fetch.mock.calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal);
  });
});
