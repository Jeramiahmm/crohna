// Middleware intentionally left empty — pages handle their own auth states
// to avoid silent redirects that confuse users (e.g. /settings → /)
export { };

export const config = {
  matcher: [],
};
