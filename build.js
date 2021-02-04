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

  ensureDirSync("esm")
  writeFileSync("esm/package.json", esmPkg)
  ensureDirSync("cjs")
  writeFileSync("cjs/package.json", cjsPkg)

  spawnSync("npx tsc -p tsconfig.json", Options)
  spawnSync("npx tsc -p tsconfig.esm.json", Options)
}

main()
  .then(null, console.log)
