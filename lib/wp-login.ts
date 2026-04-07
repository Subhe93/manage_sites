/**
 * Opens the WordPress auto-login page in a new tab.
 * The API endpoint submits credentials directly to WordPress without the
 * testcookie check (we omit testcookie from the POST so WP skips the check).
 */
export function openWpLogin(websiteId: number, _adminUrl?: string | null): void {
  window.open(`/api/websites/${websiteId}/wp-autologin`, '_blank');
}
