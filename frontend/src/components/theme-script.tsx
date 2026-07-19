/**
 * Inline script that applies the persisted theme before hydration to avoid a flash.
 */
export function ThemeScript() {
  const code = `
(function(){try{
  var t = localStorage.getItem('sn-theme') || 'system';
  var m = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var d = t === 'dark' || (t === 'system' && m);
  document.documentElement.classList.toggle('dark', d);
}catch(e){}})();
`.trim();
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
