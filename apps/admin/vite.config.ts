// import { defineConfig } from '@tanstack/react-start/config'
// import viteTsConfigPaths from 'vite-tsconfig-paths'
// import tailwindcss from '@tailwindcss/vite'

// export default defineConfig({
//   tsr: {
//     appDirectory: 'src',
//   },
//   vite: {
//     plugins: [
//       // this is the plugin that enables path aliases
//       viteTsConfigPaths({
//         projects: ['./tsconfig.json'],
//       }),
//       tailwindcss(),
//     ],
//   },
// })


// vite.config.ts
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    // tailwindcss(), sentry(), ...
    tanstackStart({ /** Add your options here */ })
  ]
})