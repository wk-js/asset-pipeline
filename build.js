const { writeFileSync } = require("fs")
const { ensureDirSync } = require("lol/js/node/fs")
const { spawnSync } = require("child_process")

const Options = { shell: true, stdio: 'inherit' }

async function main() {
  const cjsPkg = JSON.stringify({
    type: "commonjs"
  }, null, 2)

  const esmPkg = JSON.stringify({
    type: "module"
  }, null, 2)

  ensureDirSync("dist/esm")
  writeFileSync("dist/esm/package.json", esmPkg)
  ensureDirSync("dist/cjs")
  writeFileSync("dist/cjs/package.json", cjsPkg)
  ensureDirSync("js")
  writeFileSync("js/package.json", cjsPkg)

  spawnSync("npx tsc -p tsconfig.json", Options)
  spawnSync("npx tsc -p tsconfig.cjs.json", Options)
  spawnSync("npx tsc -p tsconfig.esm.json", Options)
}

main()
  .then(null, console.log)
