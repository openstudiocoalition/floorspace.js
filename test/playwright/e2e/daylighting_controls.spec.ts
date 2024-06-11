import { expect, type Page, test } from '@playwright/test';
import * as d3 from 'd3';

type DrawSquare = {
  x0: number;
  y0: number;
  width: number;
  height: number;
}
const drawSquare = async (page: Page,  square: DrawSquare, xScale: d3.ScaleLinear<number, number>, yScale: d3.ScaleLinear<number, number>) => {
  const { x0, y0, width, height } = square;

  await page.mouse.click(xScale(x0), yScale(y0));
  await page.mouse.click(xScale(x0 + width), yScale(y0 + height));
}

const draw50By50Square = (page: Page, xScale: d3.ScaleLinear<number, number>, yScale: d3.ScaleLinear<number, number>) => {
  return drawSquare(page, { x0: -50, y0: 0, width: 50, height: 50 }, xScale, yScale);
}

type ReturnScaleData = {
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
}
const getScaleData = async (page: Page): Promise<ReturnScaleData> => {
  const scaleData = await page.evaluate(() => {
    // This code runs in the browser context
    return {
      scale: window.application.$store.state.application.scale,
      xDomain: window.application.$store.state.application.scale.x.rwuRange,
      xPixels: window.application.$store.state.application.scale.x.pixels,
      yDomain: window.application.$store.state.application.scale.y.rwuRange,
      yPixels: window.application.$store.state.application.scale.y.pixels,
    };
  });
  
  const gridRect = await page.locator('#grid svg').evaluate(element => element.getBoundingClientRect());

  const xScale = d3
    .scaleLinear()
    .domain(scaleData.xDomain)
    .range([gridRect.left, gridRect.right])
    .interpolate(d3.interpolateRound);

  const yScale = d3
    .scaleLinear()
    .domain(scaleData.yDomain)
    .range([gridRect.bottom, gridRect.top])
    .interpolate(d3.interpolateRound);

  return {
    xScale,
    yScale,
  }
}

const beforeEachSetup = async (page: Page) => {
  await page.goto('http://localhost:8080/');

  await page.waitForSelector('.modal .new-floorplan svg', { state: 'visible' });

  await page.click('.modal .new-floorplan svg');

  const { xScale, yScale } = await getScaleData(page);

  await draw50By50Square(page, xScale, yScale);

  await page.click('[data-modetab="components"]');
  // await page.click('#list [value="daylighting_control_definitions"]');

  await page.selectOption('[data-object-type] .input-select .pretty-select', {
    value: 'daylighting_control_definitions',
  });

  await page.click('[data-object-type="daylighting_control_definitions"] .add-new');

  await page.hover('#grid svg');
  await page.mouse.click(xScale(-40), yScale(40));
  await page.click('[data-modetab="floorplan"]');

  return {
    xScale,
    yScale,
  }
}

test('deleting defn deletes all instances', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  // implement 0 deleting defn deletes all instances
  expect(await page.$$('.daylighting-control')).toHaveLength(1);

  await page.click('[data-modetab="components"]');
  await page.selectOption('[data-object-type] .input-select .pretty-select', {
    value: 'daylighting_control_definitions',
  });
  await page.click('[data-object-type="daylighting_control_definitions"] .rows a.destroy');
  await page.click('[data-modetab="floorplan"]');

  expect(await page.$('.daylighting-control')).not.toBeTruthy();
});

test('replacing section of space moves daylighting control to new space', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  // implement 0 deleting defn deletes all instances
  expect(await page.$$('.daylighting-control')).toHaveLength(1);

  await page.click('[data-object-type="spaces"] .add-new');

  await drawSquare(page, { x0: -50, y0: 0, width: 30, height: 50 }, xScale, yScale);

  expect(await page.$$('.current.poly .daylighting-control')).toHaveLength(1);
});

// not working as expected
test('daylighting control wont "jump" to stay in space', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  // implement 0 deleting defn deletes all instances
  expect(await page.$$('.daylighting-control')).toHaveLength(1);

  await page.click('.tools [data-tool="Eraser"]');

  // height: 20 does not have daylighting control
  await drawSquare(page, { x0: -50, y0: 25, width: 30, height: 20 }, xScale, yScale);
  // await drawSquare(page, { x0: -50, y0: 25, width: 30, height: 30 }, xScale, yScale);

  expect(await page.$('.daylighting-control')).not.toBeTruthy();
});

test('modifying edge preserves daylighting controls', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  // implement 0 deleting defn deletes all instances
  expect(await page.$$('.daylighting-control')).toHaveLength(1);

  await page.click('.tools [data-tool="Rectangle"]');

  await drawSquare(page, { x0: -10, y0: 50, width: 10, height: 10 }, xScale, yScale);

  expect(await page.$$('.daylighting-control')).toHaveLength(1);
});

test('splitting edge preserves daylighting controls', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  // implement 0 deleting defn deletes all instances
  expect(await page.$$('.daylighting-control')).toHaveLength(1);

  await page.click('.tools [data-tool="Rectangle"]');
  await page.click('[data-object-type="spaces"] .add-new');

  await drawSquare(page, { x0: -10, y0: 50, width: 10, height: 10 }, xScale, yScale);

  expect(await page.$$('.daylighting-control')).toHaveLength(1);
});

test('covering daylighting control should not remove it', async ({ page }) => {
  const { xScale, yScale } = await beforeEachSetup(page);

  // implement 0 deleting defn deletes all instances
  expect(await page.$$('.daylighting-control')).toHaveLength(1);

  await page.click('.tools [data-tool="Rectangle"]');
  await page.click('[data-object-type="spaces"] .add-new');

  await drawSquare(page, { x0: -45, y0: 35, width: 30, height: 30 }, xScale, yScale);

  expect(await page.$$('.daylighting-control')).toHaveLength(1);
});
