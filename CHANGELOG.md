# Changelog

# [0.25.0](https://github.com/gunnartorfis/sonner-native-toasts/compare/v0.24.0...v0.25.0) (2026-04-29)


### Bug Fixes

* address PR feedback — pnpm CI, test sync, permissions ([f21702a](https://github.com/gunnartorfis/sonner-native-toasts/commit/f21702acc3290d72cb2255ffdcecd1c2cdf1e8e9))
* address PR review feedback for stacking toasts ([e691fab](https://github.com/gunnartorfis/sonner-native-toasts/commit/e691faba893b3b3fbafbda1fe170945d864accb5))
* address review issues in stacking toasts ([fa7586a](https://github.com/gunnartorfis/sonner-native-toasts/commit/fa7586a5e56dba292c4a60ceb288a7131d8d7239))
* always measure toast heights, remove marginBottom ([53c680b](https://github.com/gunnartorfis/sonner-native-toasts/commit/53c680ba899cc41f06b756057a15d4fb691c81e6))
* anchor center position at vertical midline and mirror bottom stacking ([7fa14b0](https://github.com/gunnartorfis/sonner-native-toasts/commit/7fa14b0bac8b8b0071caf740744fa0481da103df))
* bottom-center toast safe area positioning ([c7b5f17](https://github.com/gunnartorfis/sonner-native-toasts/commit/c7b5f1778e146d05322290a237510a714f6e4f73))
* cache pnpm store instead of node_modules ([c5fb58b](https://github.com/gunnartorfis/sonner-native-toasts/commit/c5fb58b210d3f9983f4b9403989053fd8bef281c))
* **ci:** use shared setup action and Node 22 in test workflow ([7e4dc7a](https://github.com/gunnartorfis/sonner-native-toasts/commit/7e4dc7aa04b184c53aa0c00eb0345f53f7a3494a))
* clean up stale toastHeights entry on shift() removal ([1964fd0](https://github.com/gunnartorfis/sonner-native-toasts/commit/1964fd0fd5e33fc92672f6c49cec3aef1482f9ff))
* configure git identity for docusaurus deploy ([cf19276](https://github.com/gunnartorfis/sonner-native-toasts/commit/cf19276fd63c4614c5b213bf4376591a5ab5ad04))
* consistent stacking gaps via stackGap offsets ([f84144e](https://github.com/gunnartorfis/sonner-native-toasts/commit/f84144e3dcd927d0d4999fb7dea25138624b857d))
* deduplicate deps, align versions across workspaces ([68651d0](https://github.com/gunnartorfis/sonner-native-toasts/commit/68651d0c003ae17aa7cf71e9bd939bc6078c1b2c))
* **deploy:** add netlify.toml to use pnpm for docs build ([9bc7da8](https://github.com/gunnartorfis/sonner-native-toasts/commit/9bc7da8f8d94aeb628576ed6718cc5521fcb8efe))
* disable enableStacking by default ([76095b7](https://github.com/gunnartorfis/sonner-native-toasts/commit/76095b7d6c97af8bcedf1eb4984d91eec848c737))
* dismiss toast explicitly on close button tap when stacked and expanded ([ad00758](https://github.com/gunnartorfis/sonner-native-toasts/commit/ad00758b1288fbd36ea645b4deb93e2dfe00dba5))
* **example:** add elevation to Toaster on Android so it renders above Compose Host ([688a1e7](https://github.com/gunnartorfis/sonner-native-toasts/commit/688a1e7d718e0f2a804b2e2d4964a9aa10d2b39c))
* **example:** address PR review feedback ([db46255](https://github.com/gunnartorfis/sonner-native-toasts/commit/db4625517ad8befaeba732b140bf1358e3324c89))
* height-aware stacking position for different-height toasts ([5bda48e](https://github.com/gunnartorfis/sonner-native-toasts/commit/5bda48e5e8c7a80a7a31199ff2ea8a3b1cbafcf0))
* id=0 falsy guard + stale height on promise toast transition ([bf213ee](https://github.com/gunnartorfis/sonner-native-toasts/commit/bf213ee421320cdffffc207ba1ea37269e61fad9))
* incremental Map index + jsx dep in useLayoutEffect ([c8cb047](https://github.com/gunnartorfis/sonner-native-toasts/commit/c8cb04765d7f009bbfd4a56bfd35d8f52b12c90e))
* move absolute positioning outside ToastSwipeHandler for Android gesture hit testing ([e5dda54](https://github.com/gunnartorfis/sonner-native-toasts/commit/e5dda54c3b700a21fbeff680f797aa56ae06c9af))
* remove double onAutoClose invocation + areActionsEqual false positive ([79c23a1](https://github.com/gunnartorfis/sonner-native-toasts/commit/79c23a1bd7ad2e5c1a664a405aa42c7d0c1c989c))
* remove double-reversal in orderedToastIds for expanded mode ([80debd9](https://github.com/gunnartorfis/sonner-native-toasts/commit/80debd933f701c138c680724c1e4563c443656f9))
* remove redundant useSyncExternalStore in ToasterUI ([9c62407](https://github.com/gunnartorfis/sonner-native-toasts/commit/9c62407a753b9b850f20171d70b49b151470aa62))
* remove unused eslint-disable directive ([d537f26](https://github.com/gunnartorfis/sonner-native-toasts/commit/d537f263762c5544fd96a1e3d8999a4d0eef2d1d))
* resolve all TypeScript errors in src and example ([92bc1e0](https://github.com/gunnartorfis/sonner-native-toasts/commit/92bc1e01c7f97fb082889187a6efd6ee652fff46))
* restore type exports and toast prop spread order ([0cb2007](https://github.com/gunnartorfis/sonner-native-toasts/commit/0cb20070d1d27612b0607965777925a9769aedef))
* revert example app to default top-center position ([a71e1e8](https://github.com/gunnartorfis/sonner-native-toasts/commit/a71e1e8dec7834dc617342cfd02d2555c2c2e31e))
* skips animation when Reduce Motion is turned on ([b69234b](https://github.com/gunnartorfis/sonner-native-toasts/commit/b69234b9995b67e1ed8c9839dc5b8a165f3291be))
* stabilize AppState callbacks, sync store config, restore styles merge, remove dead prop ([3261412](https://github.com/gunnartorfis/sonner-native-toasts/commit/3261412fddfeaac27a364e4e393d733d3b387612))
* stacking toast layout issues with zIndex and visual narrowing ([815ce7e](https://github.com/gunnartorfis/sonner-native-toasts/commit/815ce7e4a452aafef6860e0333ce5ac8d748ff63))
* thread promise styles through to success/error toast states ([e3e3903](https://github.com/gunnartorfis/sonner-native-toasts/commit/e3e39031f1dd11d9cbe72162f39d1e87459e74b7))
* timer resume broken for numeric IDs + hasDescription check ([cab90b8](https://github.com/gunnartorfis/sonner-native-toasts/commit/cab90b8186860c08558221f6164c673d81ccad84))
* toast positioning and safe area handling ([35e4684](https://github.com/gunnartorfis/sonner-native-toasts/commit/35e4684036d3bab097d2285e4c3c6e20ac5a02fc))
* typo possiblePossition → possiblePosition ([d917365](https://github.com/gunnartorfis/sonner-native-toasts/commit/d917365227897f2e9b491030af1aa2ae3c7be357))
* use gap from context for stackGap, add gap setting to example ([4f407e6](https://github.com/gunnartorfis/sonner-native-toasts/commit/4f407e62098941ce40d012cecf0c6c2bce51d4d1))
* use sync getBoundingClientRect for toast measurement (New Arch) ([cc0423a](https://github.com/gunnartorfis/sonner-native-toasts/commit/cc0423a19c47294a4a247683260d5061e4437bd1))
* wiggle guard falsy check for id=0 ([9f3fd96](https://github.com/gunnartorfis/sonner-native-toasts/commit/9f3fd96581c782cacdbf478bf8a73bc3509f427c))


### Features

* **example:** add cross-platform tabs layout and settings screen ([e9ae984](https://github.com/gunnartorfis/sonner-native-toasts/commit/e9ae9843af9a4484f864fc2c7eff65f77ccc4b35))
* **example:** add inline toaster config and improve demo UX ([0ce9bff](https://github.com/gunnartorfis/sonner-native-toasts/commit/0ce9bffc6a4e76ae825e199b737f618fbbb3fe14))
* stacking toasts ([65b5b58](https://github.com/gunnartorfis/sonner-native-toasts/commit/65b5b5851e7746f603d466150a3dd0f008a4e952))


### Performance Improvements

* address audit findings — split context, memoize styles, O(1) lookups ([f27fd1b](https://github.com/gunnartorfis/sonner-native-toasts/commit/f27fd1b15c885dba05c619b3e894590d903fd300))
* fix critical re-render cascade and remove expensive per-toast work ([9417033](https://github.com/gunnartorfis/sonner-native-toasts/commit/9417033c775c413a25a1095ee3d1d4bb04869fd8))


### Reverts

* drop netlify.toml — config moved to dashboard ([ec4f9db](https://github.com/gunnartorfis/sonner-native-toasts/commit/ec4f9dbdfcd3536ccdecc3d6294f78639ce29b80))

## Unreleased

### ⚠ BREAKING CHANGES

* **New Architecture required.** Toast height measurement uses synchronous `useLayoutEffect` + `getBoundingClientRect()` for flicker-free stacking. Old architecture is no longer supported.

### Features

* stacking toasts with scale/translate animations
* tap to expand stacked toasts, outside press to collapse
* `enableStacking` prop on `<Toaster>` (default: `false`)

# [0.24.0](https://github.com/gunnartorfis/react-native-reanimated-toasts/compare/v0.23.1...v0.24.0) (2026-04-01)


### Features

* allow toast text container to be styled ([22d2e80](https://github.com/gunnartorfis/react-native-reanimated-toasts/commit/22d2e80ed970c9dfd84a9b6934520fb3e5c3d929))

## [0.23.1](https://github.com/gunnartorfis/react-native-reanimated-toasts/compare/v0.23.0...v0.23.1) (2026-02-11)


### Bug Fixes

* remove early return to resume timer after tap or slight drag ([4e7692d](https://github.com/gunnartorfis/react-native-reanimated-toasts/commit/4e7692d38c9e1e41f5ac615aa12f52995affb209))

# [0.23.0](https://github.com/gunnartorfis/react-native-reanimated-toasts/compare/v0.23.0-beta.1...v0.23.0) (2026-01-11)


### Bug Fixes

* explicitly merge styles ([4db13b3](https://github.com/gunnartorfis/react-native-reanimated-toasts/commit/4db13b3aedfda94f632033122c89891c9fd9b9fc))


### Features

* adding positionerStyle property ([9f71bae](https://github.com/gunnartorfis/react-native-reanimated-toasts/commit/9f71baeb3f387a53986dc89afba8c7e1000684e1))
* allow styles to be passed to promise toasts through api ([cc74fb8](https://github.com/gunnartorfis/react-native-reanimated-toasts/commit/cc74fb8783da82715e8a8e80b1095c0ff2c307ce))

# [0.23.0-beta.1](https://github.com/gunnartorfis/react-native-reanimated-toasts/compare/v0.23.0-beta.0...v0.23.0-beta.1) (2025-12-18)

# [0.23.0-beta.0](https://github.com/gunnartorfis/react-native-reanimated-toasts/compare/v0.22.2...v0.23.0-beta.0) (2025-12-18)



# [0.22.0-beta.0](https://github.com/gunnartorfis/react-native-reanimated-toasts/compare/v0.22.2...v0.23.0-beta.0) (2025-07-05)

## [0.22.2](https://github.com/gunnartorfis/sonner-native/compare/v0.22.1...v0.22.2) (2025-12-18)

## [0.22.1](https://github.com/gunnartorfis/sonner-native/compare/v0.22.0...v0.22.1) (2025-12-17)

# [0.22.0](https://github.com/gunnartorfis/sonner-native/compare/v0.21.2...v0.22.0) (2025-12-17)


### Features

* add backgroundComponent prop for custom toast backgrounds ([b2940c5](https://github.com/gunnartorfis/sonner-native/commit/b2940c527e96c858ef3397e2e523c47776916fb5))
* allow variant-specific default styles in Toaster ([96d9bed](https://github.com/gunnartorfis/sonner-native/commit/96d9bedb33d9d199e28a2ad1617b2bde6d21e54e))

## [0.21.2](https://github.com/gunnartorfis/sonner-native/compare/v0.21.1...v0.21.2) (2025-12-01)


### Bug Fixes

* **app:** android ghost element ([1ed8a62](https://github.com/gunnartorfis/sonner-native/commit/1ed8a6245b4c8557f40858553ad986c2a5ec5062))

## [0.21.1](https://github.com/gunnartorfis/sonner-native/compare/v0.21.0...v0.21.1) (2025-08-28)


### Bug Fixes

* fixes flicker caused by two animations trying animating the same view and property ([89d606c](https://github.com/gunnartorfis/sonner-native/commit/89d606c9497d1220ba83a34e0d1b3bd223ebf47a))

# [0.21.0](https://github.com/gunnartorfis/sonner-native/compare/v0.20.0...v0.21.0) (2025-06-10)


### Features

* add elastic resistance for toast wrong-direction gestures ([bb345b4](https://github.com/gunnartorfis/sonner-native/commit/bb345b4b7d265af660a26df7476871214e04f38c))

# [0.20.0](https://github.com/gunnartorfis/sonner-native/compare/v0.20.0-beta.0...v0.20.0) (2025-05-14)

# [0.20.0-beta.0](https://github.com/gunnartorfis/sonner-native/compare/v0.19.1...v0.20.0-beta.0) (2025-05-14)


### Bug Fixes

* attempt to fix android crash ([4c9f042](https://github.com/gunnartorfis/sonner-native/commit/4c9f04272a9c73332fb563ca1bf7a3946dafc2e4))

## [0.19.1](https://github.com/gunnartorfis/sonner-native/compare/v0.19.0...v0.19.1) (2025-05-10)


### Bug Fixes

* temporarily disable opacity gesture animation on Android ([350ac2f](https://github.com/gunnartorfis/sonner-native/commit/350ac2ffc14f190449ea3deda3d5408c5512457d))
* the missed style props for the toaster props ([27200a1](https://github.com/gunnartorfis/sonner-native/commit/27200a1c959431b1bd0d401cdb10d173c4708089))

# [0.19.0](https://github.com/gunnartorfis/sonner-native/compare/v0.18.1...v0.19.0) (2025-04-01)


### Features

* centered toasts ([d0648d4](https://github.com/gunnartorfis/sonner-native/commit/d0648d4f2c327d1912b41ee9d98dede9b728df52))

## [0.18.1](https://github.com/gunnartorfis/sonner-native/compare/v0.18.0...v0.18.1) (2025-04-01)


### Bug Fixes

* key missing prop ([1158284](https://github.com/gunnartorfis/sonner-native/commit/115828487d06ae88dc357c5c76f8197fe8c11644))

# [0.18.0](https://github.com/gunnartorfis/sonner-native/compare/v0.18.0-beta.0...v0.18.0) (2025-03-31)

# [0.18.0-beta.0](https://github.com/gunnartorfis/sonner-native/compare/v0.17.0...v0.18.0-beta.0) (2025-03-29)


### Bug Fixes

* bottom positioned toast animation fix ([8196552](https://github.com/gunnartorfis/sonner-native/commit/8196552ad02df1272d5e5f9a81dbe1d8b98d8201))
* set full width to ToastWrapper by default ([5b196ca](https://github.com/gunnartorfis/sonner-native/commit/5b196ca6d2e93ae9a0826d49fcfaf9c7689e3edb))
* updating toasts race condition ([393f6bb](https://github.com/gunnartorfis/sonner-native/commit/393f6bb1773764f2f5993f835de4559e62d7f97a))


### Features

* add a ToastWrapper to wrap the toast with a custom component ([0040467](https://github.com/gunnartorfis/sonner-native/commit/00404676261ce38fa99d513faddb4de19fe058ea))

# [0.17.0](https://github.com/gunnartorfis/sonner-native/compare/v0.16.2...v0.17.0) (2025-02-04)

## [0.16.2](https://github.com/gunnartorfis/sonner-native/compare/v0.16.1...v0.16.2) (2024-12-10)

### Bug Fixes

- let animation finish before hiding toasts ([cf4ed8e](https://github.com/gunnartorfis/sonner-native/commit/cf4ed8e9bcdb024dd36bacecde85cbe82d4720d9))

## [0.16.1](https://github.com/gunnartorfis/sonner-native/compare/v0.16.0...v0.16.1) (2024-11-19)

### Bug Fixes

- custom jsx component breaks animation ([fab7d6f](https://github.com/gunnartorfis/sonner-native/commit/fab7d6f77b5b058c0940069d5059dc07007fc612))
- render custom jsx in if block and use ToastSwipeHandler with memoized props ([61e5ead](https://github.com/gunnartorfis/sonner-native/commit/61e5ead8c34631cca7aa9233b06f50049193792d))

# [0.16.0](https://github.com/gunnartorfis/sonner-native/compare/v0.16.0-beta.0...v0.16.0) (2024-11-05)

# [0.16.0-beta.0](https://github.com/gunnartorfis/sonner-native/compare/v0.15.0...v0.16.0-beta.0) (2024-10-27)

### Bug Fixes

- conditional full window overlay ([d6f8990](https://github.com/gunnartorfis/sonner-native/commit/d6f899041e5553fa76b5a03b5bb8f0ba800da3b3))

# [0.15.0](https://github.com/gunnartorfis/sonner-native/compare/v0.14.2...v0.15.0) (2024-10-04)

### Bug Fixes

- prettier ([8dc3666](https://github.com/gunnartorfis/sonner-native/commit/8dc36660188d15a5e9806b0a1605332f29bc30bc))
- type guard ([d594e08](https://github.com/gunnartorfis/sonner-native/commit/d594e08aa1eceeded5e2b30fcee640a4e3624b0e))

### Features

- added customizeable close button ([98855df](https://github.com/gunnartorfis/sonner-native/commit/98855df50357f28056701093ccf71f2de916f49a))

## [0.14.2](https://github.com/gunnartorfis/sonner-native/compare/v0.14.1...v0.14.2) (2024-09-22)

### Bug Fixes

- add missing worklet directive ([b5796de](https://github.com/gunnartorfis/sonner-native/commit/b5796de6d71727e7a0152c50f8af5e0b9e2e1e57))

## [0.14.1](https://github.com/gunnartorfis/sonner-native/compare/v0.14.0...v0.14.1) (2024-09-20)

### Bug Fixes

- close button press didn't trigger dismiss ([d83a529](https://github.com/gunnartorfis/sonner-native/commit/d83a529dbf4f4ad3d851bdccf3104eb2588173d3))

# [0.14.0](https://github.com/gunnartorfis/sonner-native/compare/v0.13.0...v0.14.0) (2024-09-19)

### Bug Fixes

- android action onclick ([5e8a4b0](https://github.com/gunnartorfis/sonner-native/commit/5e8a4b015f0f429d66433504b250cf0250bfa6ff))
- handle dismissible false with onPress ([c10b936](https://github.com/gunnartorfis/sonner-native/commit/c10b9365c342f9bcd7070ff79c4361e7c7ce06b7))
- toastOption.style wasn't applied ([b13ea69](https://github.com/gunnartorfis/sonner-native/commit/b13ea694fe77610552065deecde7c2225f8f4b71))

### Features

- add onPress ([102e092](https://github.com/gunnartorfis/sonner-native/commit/102e09286ad94037b7690d30db24185b8bdfeb06))
- toast.promise error option can be a callback fn or a string ([89d0872](https://github.com/gunnartorfis/sonner-native/commit/89d0872f5625d617c745dbf589efb0e7c3ac7e3f))

# [0.13.0](https://github.com/gunnartorfis/sonner-native/compare/v0.12.1...v0.13.0) (2024-09-14)

### Bug Fixes

- await the promise to be able to catch its error and render an error toast ([671fb5d](https://github.com/gunnartorfis/sonner-native/commit/671fb5de87058eb29238cd80ae6a0370a4c37fb6))
- bottom positioned toast should swipe down ([6051c62](https://github.com/gunnartorfis/sonner-native/commit/6051c62122935c02eb85090cdd0743064d835155))
- corrected typo in "swipeToDismissDirection" prop ([f2c9788](https://github.com/gunnartorfis/sonner-native/commit/f2c97888e033eea0c50f9a9b52256d34cca22211))
- renamed "ivertProps" to "invertProps" in "use-colors.ts" ([411ecf2](https://github.com/gunnartorfis/sonner-native/commit/411ecf2025d598c425bf4726aec673ac0cc402f7))

### Features

- rich colors support ([4a3d3e3](https://github.com/gunnartorfis/sonner-native/commit/4a3d3e33a58cc522d3ae589b897183cc77a11896))

## [0.12.1](https://github.com/gunnartorfis/sonner-native/compare/v0.12.0...v0.12.1) (2024-09-11)

### Bug Fixes

- crash when trying to wiggle duration Infinity ([3e81b34](https://github.com/gunnartorfis/sonner-native/commit/3e81b34313ea11d942bf6a53390f0b9fef29a95e))

# [0.12.0](https://github.com/gunnartorfis/sonner-native/compare/v0.12.0-alpha.0...v0.12.0) (2024-09-11)

### Bug Fixes

- reset duration on wiggle ([e927659](https://github.com/gunnartorfis/sonner-native/commit/e927659c0a5a6aef3902c83a8b06295f2f9dab2f))

# [0.12.0-alpha.0](https://github.com/gunnartorfis/sonner-native/compare/v0.11.0...v0.12.0-alpha.0) (2024-09-11)

### Features

- wiggle toasts on update + toast.wiggle() ([de60ddc](https://github.com/gunnartorfis/sonner-native/commit/de60ddc8ef53781a3e3c2094b62c10f6fbee9c2f))

# [0.11.0](https://github.com/gunnartorfis/sonner-native/compare/v0.10.1...v0.11.0) (2024-09-11)

### Features

- more accurately represent Sonner's way of styling via the Toaster ([aefd6c4](https://github.com/gunnartorfis/sonner-native/commit/aefd6c492fec42fb44f0f6adba2dc7a6de8f7d13))

## [0.10.1](https://github.com/gunnartorfis/sonner-native/compare/v0.10.0...v0.10.1) (2024-09-10)

# [0.10.0](https://github.com/gunnartorfis/sonner-native/compare/v0.9.2...v0.10.0) (2024-09-10)

### Features

- wrap Toaster with the ToasterOverlayWrapper prop ([e1dee05](https://github.com/gunnartorfis/sonner-native/commit/e1dee05a6af4d979b30426169c4e677dea548915))

## [0.9.2](https://github.com/gunnartorfis/sonner-native/compare/v0.9.1...v0.9.2) (2024-09-10)

### Bug Fixes

- custom icons not rendering with <CssInterop.xx /> ([c7f281d](https://github.com/gunnartorfis/sonner-native/commit/c7f281dad5539ecaffee55066c7112c5c4198331))
- theme was not used when passed to Toaster ([34904f5](https://github.com/gunnartorfis/sonner-native/commit/34904f56403ba39bef0857c041928f255f882260))

## [0.9.1](https://github.com/gunnartorfis/sonner-native/compare/v0.9.0...v0.9.1) (2024-09-09)

### Bug Fixes

- updating toasts is now more stable ([2260ed7](https://github.com/gunnartorfis/sonner-native/commit/2260ed7aaf2355ba5f01aeb5174b2773ac06664d))

# [0.9.0](https://github.com/gunnartorfis/sonner-native/compare/v0.8.3...v0.9.0) (2024-09-09)

### Bug Fixes

- custom id was trying to update an existing toast ([83f2f49](https://github.com/gunnartorfis/sonner-native/commit/83f2f497e5f3ce715d7f50fc2a635b2de384895c))
- passing invert to toast() now works ([4de18df](https://github.com/gunnartorfis/sonner-native/commit/4de18df8b058f26da98db50cad00bfa066610787))
- pull request template directory ([0dab465](https://github.com/gunnartorfis/sonner-native/commit/0dab465243b1a9b2d1bbdffe2b0f88bd56470f87))
- remove hard code ([8eed260](https://github.com/gunnartorfis/sonner-native/commit/8eed2605464f6f4de222b07653dcf4aeec222de2))

### Features

- add pull request template ([afb4daa](https://github.com/gunnartorfis/sonner-native/commit/afb4daacce8a906acaa008a92246b2731e28fae0))

## [0.8.3](https://github.com/gunnartorfis/sonner-native/compare/v0.8.2...v0.8.3) (2024-09-09)

### Bug Fixes

- respect the gap value passed via <Toaster /> ([2cb5f02](https://github.com/gunnartorfis/sonner-native/commit/2cb5f022e99eb5a7655f85b1a49fd6c6163dc4c0))

## [0.8.2](https://github.com/gunnartorfis/sonner-native/compare/v0.8.1...v0.8.2) (2024-09-09)

## [0.8.1](https://github.com/gunnartorfis/sonner-native/compare/v0.8.0...v0.8.1) (2024-09-09)

### Bug Fixes

- warning by y gesture handler ([3e11b91](https://github.com/gunnartorfis/sonner-native/commit/3e11b91b747abd13b2aed08f45632ad634f9ed1d))

# [0.8.0](https://github.com/gunnartorfis/sonner-native/compare/v0.7.0...v0.8.0) (2024-09-08)

### Features

- dynamic positioning ([676cbc7](https://github.com/gunnartorfis/sonner-native/commit/676cbc7e8c92c691e953313e3432245c2cf86dca))
- important accessibility settings for Androi ([a663f65](https://github.com/gunnartorfis/sonner-native/commit/a663f650c2db8bd1ccd91640dc89f992644d03a8))

# [0.7.0](https://github.com/gunnartorfis/sonner-native/compare/v0.6.0...v0.7.0) (2024-09-08)

### Bug Fixes

- bottom bars weren't tappable with custom offset ([cc664a5](https://github.com/gunnartorfis/sonner-native/commit/cc664a5df352c8bbe16f2c3e681b043cd3156c30))

### Features

- custom loading icon ([881ab67](https://github.com/gunnartorfis/sonner-native/commit/881ab67e6690f66c35ed97b88855dccbde0f3427))
- pause timer when app enters background ([2a1a2c5](https://github.com/gunnartorfis/sonner-native/commit/2a1a2c5c2c9255b9cc465228ca19bd9c4397dcfe))
- pause timer when app enters background ([d6e04e7](https://github.com/gunnartorfis/sonner-native/commit/d6e04e715938f63189fc5660f19b9cbd851fee49))
- remove cn as dependency and add is as a prop ([464d800](https://github.com/gunnartorfis/sonner-native/commit/464d800a56201c3932b64e698c94c0dddd2a8044))
- warning variant ([4cc58e8](https://github.com/gunnartorfis/sonner-native/commit/4cc58e8aed0c3635fe82b9b23bb4ec41ba990602))

# [0.6.0](https://github.com/gunnartorfis/sonner-native/compare/v0.5.0...v0.6.0) (2024-09-08)

### Features

- offset support ([6f37c36](https://github.com/gunnartorfis/sonner-native/commit/6f37c36d8a6f1aaf3069af199789c52e2a47b96d))

# [0.5.0](https://github.com/gunnartorfis/sonner-native/compare/v0.4.1...v0.5.0) (2024-09-07)

### Bug Fixes

- import path ([74b53b8](https://github.com/gunnartorfis/sonner-native/commit/74b53b8e3facb7c15ef06b3cfc12028ab2dfdb15))

### Features

- action as jsx ([bcca41a](https://github.com/gunnartorfis/sonner-native/commit/bcca41a45173e7dab64b2770629125ab095f38ff))
- cancel button ([0c5892b](https://github.com/gunnartorfis/sonner-native/commit/0c5892b705daed5403f8900e43b7579fd5d6ee52))
- loading variant ([f05f641](https://github.com/gunnartorfis/sonner-native/commit/f05f6413531fa4fc2d30869969973b80f96b4688))

## [0.4.1](https://github.com/gunnartorfis/sonner-native/compare/v0.4.0...v0.4.1) (2024-09-07)

### Bug Fixes

- import relative ([98e727b](https://github.com/gunnartorfis/sonner-native/commit/98e727b905bacfbe5f63d708967ef70964fde291))

# [0.4.0](https://github.com/gunnartorfis/sonner-native/compare/v0.3.9...v0.4.0) (2024-09-06)

### Bug Fixes

- matching sonner's api more, refactor types ([eba154a](https://github.com/gunnartorfis/sonner-native/commit/eba154a4c4a1f366ff17dd8fd177fbcd78e0c465))
- reset duration on toast update ([aabb673](https://github.com/gunnartorfis/sonner-native/commit/aabb673746935b4e47ff2ac2beb23e9da3023b3c))
- separate onDismiss & onAutoClose callbacks ([9122f22](https://github.com/gunnartorfis/sonner-native/commit/9122f22fcf48cb00e753b2545d08bd1a52c5cff5))

### Features

- closeButton prop to show X or not ([22b64a6](https://github.com/gunnartorfis/sonner-native/commit/22b64a61decc0ec21daa8dcb7bd29465a2d195d2))
- custom icons ([481903b](https://github.com/gunnartorfis/sonner-native/commit/481903bf630d3cdf18e4233971a4f428c7efd51a))
- custom icons ([d7c4829](https://github.com/gunnartorfis/sonner-native/commit/d7c48295f7577843d3153a8fc6fce1de5d612e65))
- customize toasts with styles ([876eaaa](https://github.com/gunnartorfis/sonner-native/commit/876eaaa96f653b256bf4621e157a75eea5402345))
- dismissible prop to make a toast non-swipable nor X to close ([130a1ef](https://github.com/gunnartorfis/sonner-native/commit/130a1efe42f63f3a791b96af3fbdad1624c855bd))
- fully customizable, every view with style ([9e53391](https://github.com/gunnartorfis/sonner-native/commit/9e53391cafcae8e3e04ca8eb9c91621390eb75d8))
- invert prop ([8887cd3](https://github.com/gunnartorfis/sonner-native/commit/8887cd3e7f99b6c733d35f0e43f2429b7adb24d6))
- new onAutoClose callback ([dc28ea9](https://github.com/gunnartorfis/sonner-native/commit/dc28ea9e721957dec156a9178f977fd8ef5a3c0d))
- support Infinity duration ([47ac273](https://github.com/gunnartorfis/sonner-native/commit/47ac27368febde1e73231855a7a5d5135a53310d))
- toast.dismiss() ([5b996ec](https://github.com/gunnartorfis/sonner-native/commit/5b996ecdd6d8f6318d57cb40984ae32e8d9bf3b0))
- unstyled prop to Toaster ([ff56e30](https://github.com/gunnartorfis/sonner-native/commit/ff56e30ef40ad70d510e4814ea5ce7a503bfa352))

## [0.3.9](https://github.com/gunnartorfis/sonner-native/compare/v0.3.8...v0.3.9) (2024-09-05)

## [0.3.8](https://github.com/gunnartorfis/sonner-native/compare/v0.3.7...v0.3.8) (2024-09-05)

## [0.3.7](https://github.com/gunnartorfis/sonner-native/compare/v0.3.6...v0.3.7) (2024-09-05)

### Bug Fixes

- android tweaks ([f14f59e](https://github.com/gunnartorfis/sonner-native/commit/f14f59e28fe5e248052286a5a39f678dd5538644))

## [0.3.6](https://github.com/gunnartorfis/sonner-native/compare/v0.3.5...v0.3.6) (2024-09-05)

### Bug Fixes

- toaster default values ([ea9f397](https://github.com/gunnartorfis/sonner-native/commit/ea9f397a7fb1a3e0429a9fb999e1a6465b4e7d86))

## [0.3.5](https://github.com/gunnartorfis/sonner-native/compare/v0.3.4...v0.3.5) (2024-09-05)

## [0.3.4](https://github.com/gunnartorfis/sonner-native/compare/v0.3.3...v0.3.4) (2024-09-05)

## [0.3.3](https://github.com/gunnartorfis/sonner-native/compare/v0.3.2...v0.3.3) (2024-09-05)

## [0.3.2](https://github.com/gunnartorfis/sonner-native/compare/v0.3.1...v0.3.2) (2024-09-05)

## [0.3.1](https://github.com/gunnartorfis/sonner-native/compare/v0.3.0...v0.3.1) (2024-09-05)
