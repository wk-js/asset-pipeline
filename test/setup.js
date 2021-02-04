require("mocha");
const { ensureDirSync, isDirectory, removeSync, writeFileSync } = require("lol/js/node/fs");
const { statSync, unlinkSync } = require("fs");
const { Pipeline, PathBuilder } = require("../cjs");

const LOAD_PATH = new PathBuilder('tmp/test-units')
const DST_PATH = new PathBuilder('tmp/test-units-dist')

function isSymbolicLink(path) {
  try {
    const { isSymbolicLink } = statSync(path)
    return isSymbolicLink()
  } catch (e) { }

  return false
}

function _before() {
  ensureDirSync(LOAD_PATH.os())
  writeFileSync(LOAD_PATH.join("app/scripts/main.ts").os(), "")
  writeFileSync(LOAD_PATH.join("app/styles/common.styl").os(), "")
  writeFileSync(LOAD_PATH.join("app/views/_layout.html.ejs").os(), "")
  writeFileSync(LOAD_PATH.join("app/views/index.html.ejs").os(), "")
  writeFileSync(LOAD_PATH.join("app/assets/flags.png").os(), "")
  writeFileSync(LOAD_PATH.join("app/assets/emoji/emoji0.png").os(), "")
  writeFileSync(LOAD_PATH.join("app/assets/emoji/emoji1.png").os(), "")
  writeFileSync(LOAD_PATH.join("app/assets/emoji/emoji2.png").os(), "")
}

function _after() {
  if (isSymbolicLink(DST_PATH.join("assets").os())) unlinkSync(DST_PATH.join("assets").os())
  if (isDirectory(DST_PATH.os())) removeSync(DST_PATH.os())
  if (isDirectory(LOAD_PATH.os())) removeSync(LOAD_PATH.os())
}

/**
 *
 * @param {(p: Pipeline) => Promise<void>} callback
 */
async function setup(callback) {
  const p = new Pipeline()
  p.resolver.output = DST_PATH
  if (callback) await callback(p)
  p.fetch(true)
  return p
}

/**
 *
 * @param {(p: Pipeline) => Promise<void>} callback
 */
async function setupWithEntries(callback) {
  return setup(async p => {
    const source = LOAD_PATH.join("app")

    p.files
      .include(
        source.join("scripts/main.ts"),
        source.join("styles/*.styl"),
        source.join("views/*.html.ejs"),
        source.join("assets/**/*"),
      )
      .exclude(
        source.join("styles/_*.styl"),
        source.join("views/**/_*.html.ejs"),
      )
      .shadow(
        source.join("styles/main.css"),
      )

    p.rules
      .add("**/*.ts")
      .extension(".js")
      .keepDirectory(false)

    p.rules
      .add("**/*.styl")
      .extension(".css")
      .keepDirectory(false)

    p.rules
      .add("**/*.html.ejs")
      .extension(".html")
      .keepDirectory(false)
      .cachebreak(false)

    p.rules
      // .add("**/assets/**/*") // or
      .add(source.join("assets/**/*")) // more precise
      .relative(source.os())

    if (callback) await callback(p)
  })
}

before(_before)
beforeEach(_before)
after(_after)
afterEach(_after)

module.exports = {
  LOAD_PATH,
  DST_PATH,
  setup,
  setupWithEntries,
}