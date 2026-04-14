import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? ''
const isUserOrOrgPages = repositoryName.endsWith('.github.io')
const githubPagesBase = repositoryName && !isUserOrOrgPages ? `/${repositoryName}/` : '/'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? githubPagesBase : '/',
  plugins: [react()],
})
