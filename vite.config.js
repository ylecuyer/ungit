export default {
    root: 'frontend',
    server: {
        proxy: {
            '/images': {
                target: 'http://localhost:8448',
                changeOrigin: true,
            },
            '/plugins': {
                target: 'http://localhost:8448',
                changeOrigin: true,
            },
            '/fonts': {
                target: 'http://localhost:8448',
                changeOrigin: true,
            },
            '/socket.io': {
                target: 'http://localhost:8448',
                changeOrigin: true,
                ws: true
            },
            '/serverdata.js': {
                target: 'http://localhost:8448',
                changeOrigin: true
            },
            '/api': {
                target: 'http://localhost:8448',
                changeOrigin: true
            },
            '/js': {
                target: 'http://localhost:8448',
                changeOrigin: true
            },
        }
    }
}