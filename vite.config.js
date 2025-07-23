export default {
    root: 'public',
    server: {
        proxy: {
            '/plugins': {
                target: 'http://localhost:8448',
                changeOrigin: true
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
            }
        }
    }
}