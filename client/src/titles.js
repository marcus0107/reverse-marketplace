// Browser tab titles for every page
export const TITLES = {
  '/': 'Reverse | Your need. Their offers. Your choice.', '/request': 'Post a buyer need', '/matches': 'Your matches',
  '/pricing': 'Pricing', '/login': 'Company login', '/signup': 'Join as a seller', '/dashboard': 'Dashboard',
  '/listing': 'My listing', '/billing': 'Plans & billing', '/admin': 'Admin',
  '/forgot-password': 'Forgot password', '/reset-password': 'New password'
};

export function pageTitle(pathname) {
  if (pathname.startsWith('/company/')) return 'Company profile';
  return TITLES[pathname] || 'Reverse';
}
