export interface PrintableMenuItem {
  description?: string;
  harmonization?: string;
  name: string;
  subtitle?: string;
}

export interface PrintableMenu {
  categories: Array<{ items: PrintableMenuItem[]; name: string }>;
  name: string;
  obs?: string;
  tagline?: string;
}

export default async function generateMenuPdf(menu: PrintableMenu) {
  const html2pdf = (await import('html2pdf.js')).default;
  const container = document.createElement('div');

  container.style.cssText = hiddenContainerStyles;
  container.innerHTML = renderDocument(menu);
  document.body.appendChild(container);

  try {
    await html2pdf()
      .set({
        margin: 0,
        filename: `${menu.name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(container.querySelector<HTMLElement>('#menu-pdf')!)
      .save();
  } finally {
    document.body.removeChild(container);
  }
}

function renderDocument(menu: PrintableMenu) {
  const categories = menu.categories.map(renderCategory).join('');
  const observation = menu.obs ? `<div class="obs">OBS * ${menu.obs}</div>` : '';

  return `
    <div id="menu-pdf">
      <style>${pdfStyles}</style>
      <div class="doc-header">
        <div class="brand">Soul<span>540</span> Pizzas</div>
        <div class="tagline">· artesanal food ·</div>
        <div class="menu-title">${menu.name.toUpperCase()}</div>
        <div class="menu-sub">${menu.tagline ?? ''}</div>
      </div>
      <div class="body">${categories}${observation}</div>
      <div class="footer"><span>@soul.pizzas</span><span>19 98160-5481</span></div>
    </div>`;
}

function renderCategory(category: PrintableMenu['categories'][number]) {
  const className = category.name.toLowerCase().includes('doce') ? 'cat-sweet' : '';
  const items = category.items.map(renderItem).join('');

  return `
    <div class="section">
      <div class="cat-title ${className}">${category.name}</div>
      <div class="items">${items}</div>
    </div>`;
}

function renderItem(item: PrintableMenuItem) {
  const subtitle = item.subtitle ? `<span class="item-sub">${item.subtitle}</span>` : '';
  const description = item.description ? `<p class="item-desc">${item.description}</p>` : '';
  const harmonization = item.harmonization
    ? `<p class="item-harm"><strong>Harmonização:</strong> ${item.harmonization}</p>`
    : '';

  return `
    <div class="item">
      <div class="item-header"><span class="item-name">${item.name}</span>${subtitle}</div>
      ${description}${harmonization}
    </div>`;
}

const hiddenContainerStyles = 'position:absolute;left:-9999px;top:0;width:210mm;color-scheme:light;color:#1a1a1a';

const pdfStyles = [
  '*{box-sizing:border-box;margin:0;padding:0}',
  '#menu-pdf{font-family:Arial,sans-serif;background:#fff;color:#1a1a1a;width:210mm}',
  '.doc-header{background:#111;color:#fff;text-align:center;padding:28px 40px 22px;border-bottom:3px solid #8b1a1a}',
  '.brand{font-size:22px;font-weight:800;letter-spacing:-.5px}.brand span{color:#f59e0b}',
  '.tagline{font-size:10px;color:#ffffff73;letter-spacing:2px;margin:3px 0 14px}',
  '.menu-title{font-size:20px;font-weight:800;letter-spacing:3px;margin:8px 0 4px}',
  '.menu-sub{font-size:11px;color:#ffffff66;font-style:italic;margin-top:8px}',
  '.body{padding:24px 40px 32px}.section{margin-bottom:24px}',
  '.cat-title{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;' +
    'background:#8b1a1a;color:#fff;display:inline-block;padding:4px 14px;border-radius:2px;margin-bottom:14px}',
  '.cat-sweet{background:#6d28d9}.items{display:flex;flex-direction:column;gap:14px}',
  '.item{padding-bottom:14px;border-bottom:1px solid #e5e7eb}.item:last-child{border-bottom:none;padding-bottom:0}',
  '.item-header{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px;margin-bottom:4px}',
  '.item-name{font-size:13px;font-weight:700;color:#111}.item-sub{font-size:11px;color:#6b7280;font-style:italic}',
  '.item-desc{font-size:12px;line-height:1.65;color:#374151}',
  '.item-harm{font-size:11px;color:#9ca3af;font-style:italic;margin-top:5px;line-height:1.5}',
  '.item-harm strong{color:#6b7280;font-style:normal}',
  '.obs{font-size:10px;color:#9ca3af;font-style:italic;padding:10px 14px;background:#f9fafb;' +
    'border:1px solid #e5e7eb;border-radius:4px;margin-bottom:20px}',
  '.footer{background:#8b1a1a;color:#fff;text-align:center;padding:14px 40px;display:flex;' +
    'align-items:center;justify-content:center;gap:32px;font-size:13px;font-weight:700}',
].join('');
