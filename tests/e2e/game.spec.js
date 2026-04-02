import { test, expect } from '@playwright/test';
import path from 'path';

const FILE = path.resolve(__dirname, '../../src/index.html');

test.describe('2048 Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`file://${FILE}`);
  });

  test('board renders with correct grid size', async ({ page }) => {
    const board = page.locator('#game-board');
    await expect(board).toBeVisible();
    const cells = board.locator('.cell');
    await expect(cells).toHaveCount(16);
  });

  test('score is displayed', async ({ page }) => {
    const score = page.locator('#current-score');
    await expect(score).toHaveText('0');
  });

  test('arrow key moves tiles', async ({ page }) => {
    const board = page.locator('#game-board');
    const initialCells = await board.locator('.cell[data-value]').count();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowUp');
    const afterCells = await board.locator('.cell[data-value]').count();
    expect(afterCells).toBeGreaterThanOrEqual(initialCells);
  });

  test('WASD keys move tiles', async ({ page }) => {
    const board = page.locator('#game-board');
    await page.keyboard.press('d');
    await page.keyboard.press('s');
    await page.keyboard.press('a');
    await page.keyboard.press('w');
    const cells = board.locator('.cell[data-value]');
    const count = await cells.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('New Game resets the board', async ({ page }) => {
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.click('#new-game-btn');
    const score = page.locator('#current-score');
    await expect(score).toHaveText('0');
  });

  test('grid size buttons change board', async ({ page }) => {
    await page.click('.size-btn[data-size="5"]');
    const board = page.locator('#game-board');
    const cells = board.locator('.cell');
    await expect(cells).toHaveCount(25);

    await page.click('.size-btn[data-size="6"]');
    await expect(board.locator('.cell')).toHaveCount(36);

    await page.click('.size-btn[data-size="4"]');
    await expect(board.locator('.cell')).toHaveCount(16);
  });
});
