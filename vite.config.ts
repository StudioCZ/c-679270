import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import crypto from "crypto";

// Helper function to generate HMAC SHA256 signature (server-side only)
const generateSignatureServer = (queryString: string, apiSecret: string): string => {
  return crypto.createHmac('sha256', apiSecret).update(queryString).digest('hex');
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/binance-futures-api': {
        target: 'https://fapi.binance.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/binance-futures-api/, ''),
        secure: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      },
      '/binance-futures-testnet-api': {
        target: 'https://testnet.binancefuture.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/binance-futures-testnet-api/, ''),
        secure: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      },
      '/binance-futures-signed-api': {
        target: 'https://fapi.binance.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/binance-futures-signed-api/, ''),
        secure: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            const apiKey = process.env.VITE_BINANCE_API_KEY;
            const apiSecret = process.env.VITE_BINANCE_API_SECRET;
            
            if (!apiKey || !apiSecret) {
              console.error('❌ Missing Binance API credentials in environment variables');
              return;
            }

            // Set API key header
            proxyReq.setHeader('X-MBX-APIKEY', apiKey);

            // Handle signature generation for different HTTP methods
            if (req.method === 'GET' || req.method === 'DELETE') {
              // For GET/DELETE, parameters are in the URL
              const url = new URL(req.url!, 'http://localhost');
              const queryString = url.search.substring(1); // Remove the '?' prefix
              
              if (queryString) {
                const signature = generateSignatureServer(queryString, apiSecret);
                const signedQuery = `${queryString}&signature=${signature}`;
                
                // Update the path with the signed query
                proxyReq.path = `${url.pathname}?${signedQuery}`;
              }
            } else if (req.method === 'POST' || req.method === 'PUT') {
              // For POST/PUT, we need to handle the body
              let body = '';
              
              req.on('data', (chunk) => {
                body += chunk.toString();
              });
              
              req.on('end', () => {
                if (body) {
                  const signature = generateSignatureServer(body, apiSecret);
                  const signedBody = `${body}&signature=${signature}`;
                  
                  // Update content length and write the signed body
                  proxyReq.setHeader('Content-Length', Buffer.byteLength(signedBody));
                  proxyReq.setHeader('Content-Type', 'application/x-www-form-urlencoded');
                  proxyReq.write(signedBody);
                }
                proxyReq.end();
              });
            }
          });
        }
      },
      '/binance-futures-testnet-signed-api': {
        target: 'https://testnet.binancefuture.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/binance-futures-testnet-signed-api/, ''),
        secure: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            const apiKey = process.env.VITE_BINANCE_API_KEY;
            const apiSecret = process.env.VITE_BINANCE_API_SECRET;
            
            if (!apiKey || !apiSecret) {
              console.error('❌ Missing Binance API credentials in environment variables');
              return;
            }

            // Set API key header
            proxyReq.setHeader('X-MBX-APIKEY', apiKey);

            // Handle signature generation for different HTTP methods
            if (req.method === 'GET' || req.method === 'DELETE') {
              // For GET/DELETE, parameters are in the URL
              const url = new URL(req.url!, 'http://localhost');
              const queryString = url.search.substring(1); // Remove the '?' prefix
              
              if (queryString) {
                const signature = generateSignatureServer(queryString, apiSecret);
                const signedQuery = `${queryString}&signature=${signature}`;
                
                // Update the path with the signed query
                proxyReq.path = `${url.pathname}?${signedQuery}`;
              }
            } else if (req.method === 'POST' || req.method === 'PUT') {
              // For POST/PUT, we need to handle the body
              let body = '';
              
              req.on('data', (chunk) => {
                body += chunk.toString();
              });
              
              req.on('end', () => {
                if (body) {
                  const signature = generateSignatureServer(body, apiSecret);
                  const signedBody = `${body}&signature=${signature}`;
                  
                  // Update content length and write the signed body
                  proxyReq.setHeader('Content-Length', Buffer.byteLength(signedBody));
                  proxyReq.setHeader('Content-Type', 'application/x-www-form-urlencoded');
                  proxyReq.write(signedBody);
                }
                proxyReq.end();
              });
            }
          });
        }
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));