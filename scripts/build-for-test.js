require('dotenv').config();
const fs = require('fs-extra')
const path = require('path');

const SRC_DIR = path.join(process.cwd(), 'chrome-extension')
const DIST_DIR = path.join(process.cwd(), 'dist', 'ui-test', 'chrome-extension')

const manifest = require('../chrome-extension/manifest.json')

const addContentPermission = (manifest) => {
  return {
    ...manifest,
    "content_scripts": [
      {
        "matches": [
          "<all_urls>"
        ],
        "js": ["js/content.js"]
      }
    ],
  }
}

fs.removeSync(DIST_DIR)

fs.ensureDirSync(DIST_DIR)

fs.copySync(SRC_DIR, DIST_DIR)

console.info('adding content_scripts in manifest.json for testing purposes')
const testManifest = addContentPermission(manifest)

const testManifestPath = path.join(DIST_DIR, 'manifest.json')

fs.writeFileSync(testManifestPath, JSON.stringify(testManifest, null, 2))
