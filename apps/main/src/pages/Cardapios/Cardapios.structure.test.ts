import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('organizes standard menus with compact metadata, categories, and footer actions', () => {
  const page = source('./components/StaticMenuGrid.tsx');

  assert.match(page, /styles\.standardCardMeta/);
  assert.match(page, /styles\.standardCategoryList/);
  assert.match(page, /styles\.standardCardFooter/);
  assert.match(page, /onPreview\(menu\)/);
  assert.match(page, /onEdit\(menu\)/);
  assert.match(page, /onGeneratePdf\(menu\)/);
});

test('organizes custom menus with compact metadata and footer actions', () => {
  const page = source('./components/CustomMenuList.tsx');

  assert.match(page, /styles\.cardMeta/);
  assert.match(page, /styles\.cardIdentity/);
  assert.match(page, /styles\.cardFooter/);
  assert.match(page, /styles\.searchInput/);
  assert.match(page, /onPreview\(menu\)/);
  assert.match(page, /onEdit\(menu\)/);
  assert.match(page, /onDelete\(menu\.id\)/);
});

test('keeps card actions theme-aware and mobile-safe', () => {
  const staticPage = source('./components/StaticMenuGrid.tsx');
  const customPage = source('./components/CustomMenuList.tsx');
  const styles = source('./styles/Cardapios.module.Cards.scss');
  const actionStyles = source('./styles/Cardapios.module.CardActions.scss');

  assert.match(staticPage, /styles\.cardPrimaryButton/);
  assert.match(staticPage, /styles\.cardSecondaryButton/);
  assert.match(staticPage, /styles\.cardPdfButton/);
  assert.match(customPage, /styles\.cardDangerButton/);
  assert.match(styles, /\.cardIdentity[\s\S]*min-width: 0/);
  assert.match(actionStyles, /\.standardCardFooter,[\s\S]*flex-wrap: nowrap/);
  assert.match(actionStyles, /\$info/);
  assert.match(actionStyles, /\$danger/);
});
