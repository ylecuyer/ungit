export default {
    css: {
        preprocessorOptions: {
            less: {}
        }
    },
    server: {
        proxy: {
            '/plugins': {
                target: 'http://localhost:8448',
                changeOrigin: true,
                bypass: (req, res, options) => {
                    if (req.url.endsWith('.less')) {
                        return req.url;
                    }
                }
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