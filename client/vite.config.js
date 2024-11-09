import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  //use mobile to test responsive
  server:{
    host: '0.0.0.0'
  }
})
