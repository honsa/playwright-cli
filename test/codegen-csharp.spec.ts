/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as path from 'path';
import { it, expect } from './fixtures';

const emptyHTML = new URL('file://' + path.join(__dirname, 'assets', 'empty.html')).toString();

it('should print the correct imports and context options', async ({ runCLI }) => {
  const cli = runCLI(['codegen', '--target=csharp', emptyHTML]);
  const expectedResult = `await Playwright.InstallAsync();
using var playwright = await Playwright.CreateAsync();
await using var browser = await playwright.Chromium.LaunchAsync(headless: false);
var context = await browser.NewContextAsync();`;
  await cli.waitFor(expectedResult).catch(e => e);
  expect(cli.text()).toContain(expectedResult);
});

it('should print the correct context options for custom settings', async ({ runCLI }) => {
  const cli = runCLI([
    '--color-scheme=dark',
    '--geolocation=37.819722,-122.478611',
    '--lang=es',
    '--proxy-server=http://myproxy:3128',
    '--timezone=Europe/Rome',
    '--timeout=1000',
    '--user-agent=hardkodemium',
    '--viewport-size=1280,720',
    'codegen',
    '--target=csharp',
    emptyHTML]);
  const expectedResult = `await Playwright.InstallAsync();
using var playwright = await Playwright.CreateAsync();
await using var browser = await playwright.Chromium.LaunchAsync(
    headless: false,
    proxy: new ProxySettings
    {
        Server = "http://myproxy:3128",
    });
var context = await browser.NewContextAsync(
    viewport: new ViewportSize
    {
        Width = 1280,
        Height = 720,
    },
    geolocation: new Geolocation
    {
        Latitude = 37.819722m,
        Longitude = -122.478611m,
    },
    permissions: new[] { ContextPermission.Geolocation },
    userAgent: "hardkodemium",
    locale: "es",
    colorScheme: ColorScheme.Dark,
    timezoneId: "Europe/Rome");`;
  await cli.waitFor(expectedResult);
  expect(cli.text()).toContain(expectedResult);
});

it('should print the correct context options when using a device', async ({ runCLI }) => {
  const cli = runCLI(['--device=Pixel 2', 'codegen', '--target=csharp', emptyHTML]);
  const expectedResult = `await Playwright.InstallAsync();
using var playwright = await Playwright.CreateAsync();
await using var browser = await playwright.Chromium.LaunchAsync(headless: false);
var context = await browser.NewContextAsync(playwright.Devices["Pixel 2"]);`;

  await cli.waitFor(expectedResult);
  expect(cli.text()).toContain(expectedResult);
});

it('should print the correct context options when using a device and additional options', async ({ runCLI }) => {
  const cli = runCLI([
    '--device=Pixel 2',
    '--color-scheme=dark',
    '--geolocation=37.819722,-122.478611',
    '--lang=es',
    '--proxy-server=http://myproxy:3128',
    '--timezone=Europe/Rome',
    '--timeout=1000',
    '--user-agent=hardkodemium',
    '--viewport-size=1280,720',
    'codegen',
    '--target=csharp',
    emptyHTML]);
  const expectedResult = `await Playwright.InstallAsync();
using var playwright = await Playwright.CreateAsync();
await using var browser = await playwright.Chromium.LaunchAsync(
    headless: false,
    proxy: new ProxySettings
    {
        Server = "http://myproxy:3128",
    });
var context = await browser.NewContextAsync(new BrowserContextOptions(playwright.Devices["Pixel 2"])
{
    UserAgent = "hardkodemium",
    Viewport = new ViewportSize
    {
        Width = 1280,
        Height = 720,
    },
    Geolocation = new Geolocation
    {
        Latitude = 37.819722m,
        Longitude = -122.478611m,
    },
    Permissions = new[] { ContextPermission.Geolocation },
    Locale = "es",
    ColorScheme = ColorScheme.Dark,
    TimezoneId = "Europe/Rome",
});`;

  await cli.waitFor(expectedResult);
  expect(cli.text()).toContain(expectedResult);
});