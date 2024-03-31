// @ts-ignore

import {resolve} from 'path'
import  dts from 'vite-plugin-dts'
import vitePluginRequire from "vite-plugin-require";
import {defineConfig} from 'vite'

export default defineConfig({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    plugins:[ vitePluginRequire.default(),dts({rollupTypes:true})],
    build: {
        rollupOptions:{
            external:["ws"]
        },
        lib: {
            entry: resolve(__dirname, 'lib/main.ts'),
            fileName:'index',
            formats: ['es','cjs']
        }
    }
});
