// The backend wraps failures as { success: false, error: { message, details } }.
// Pull the human message out of an axios error, falling back to a caller-supplied
// default when the response shape is missing (network error, non-API response…).
export function getApiErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  return err?.response?.data?.error?.message || fallback;
}
