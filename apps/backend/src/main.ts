import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, RequestMethod } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import express, { json, urlencoded } from 'express';
import {
  createProxyMiddleware,
  responseInterceptor,
} from 'http-proxy-middleware';

// Initialize the secondary ThingsBoard Proxy Server for Iframe embedding
function bootstrapTbProxy() {
  const tbProxy = express();
  const tbProxyPort = 3002;

  // The bridge.html page which will receive postMessage and set localStorage keys.
  tbProxy.use('/bridge.html', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>ThingsBoard Auth Bridge</title>
          <script>
            window.addEventListener("message", (event) => {
              if (event.origin !== "http://localhost:3000") return;
              
              const { jwtToken, redirect } = event.data;
              if (jwtToken) {
                  localStorage.setItem("jwt_token", jwtToken);
                  try {
                    const payload = JSON.parse(atob(jwtToken.split('.')[1]));
                    if (payload.exp) {
                        localStorage.setItem("jwt_token_expiration", String(payload.exp * 1000));
                    }
                  } catch (e) {}
                  
                  window.location.replace(redirect || '/');
              }
            });
          </script>
      </head>
      <body>
          <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; color: #666;">
            Authenticating dashboard...
          </div>
      </body>
      </html>
    `);
  });

  // Security Middleware: Lock down the proxy so ONLY dashboards and APIs can be accessed.
  // This physically prevents clients from navigating to /devices, /home, etc.
  tbProxy.use((req, res, next) => {
    // 1. Allow ThingsBoard APIs and Websockets
    if (req.path.startsWith('/api/') || req.path.startsWith('/v1/')) {
      return next();
    }

    // 2. Allow Dashboards and Rule Chains explicitly
    if (
      req.path.startsWith('/dashboards/') ||
      req.path.startsWith('/dashboard/') ||
      req.path.startsWith('/ruleChains/') ||
      req.path.startsWith('/ruleChain/') ||
      req.path.startsWith('/resources/widgets-library/') ||
      req.path.includes('/preview') ||
      req.path.startsWith('/widget')
    ) {
      return next();
    }

    // 3. Allow Static Assets & Localization needed to render the pure iframe
    const isStaticAsset =
      req.path.startsWith('/assets/') ||
      req.path.startsWith('/static/') ||
      /\.(js|css|json|ico|woff2?|svg|png|jpe?g|map)$/.test(req.path);
    if (isStaticAsset) {
      return next();
    }

    // 4. Deny everything else! (e.g. /devices, /, /login, /ruleChains)
    console.warn('[TB Proxy] Blocked by firewall:', req.path);
    res.status(403).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Forbidden</title></head>
        <body style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; background: #f8f9fa;">
            <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #d32f2f;">403 Forbidden</h2>
                <p style="color: #666;">Direct access to ThingsBoard UI is strictly restricted to Embedded Dashboards.</p>
            </div>
        </body>
        </html>
    `);
  });

  // Proxy all other allowed routes directly to ThingsBoard
  tbProxy.use(
    '/',
    createProxyMiddleware({
      target: 'http://localhost:8088',
      changeOrigin: true,
      ws: true, // For telemetry websockets
      autoRewrite: true,
      selfHandleResponse: true, // Needed for responseInterceptor
      on: {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        proxyRes: responseInterceptor(
          async (responseBuffer, proxyRes, req, res) => {
            // --- 1. Aggressive fix for nested Iframe / Widget Preview ---
            // Some responses might have multiple X-Frame-Options or different casing.
            // We delete them from the source headers to be 100% sure.
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['X-Frame-Options'];

            // Ensure browser allows this frame to be embedded in our portal
            res.setHeader(
              'Content-Security-Policy',
              "frame-ancestors 'self' http://localhost:3000 http://localhost:3002",
            );

            const contentType = proxyRes.headers['content-type'];

            // Inject CSS to hide TB Layout only into HTML responses
            if (contentType && contentType.includes('text/html')) {
              let html = responseBuffer.toString('utf8');

              const injectedCss = `
            <style id="headless-styles">
                /* Hide global side menu and headers */
                tb-side-menu, mat-sidenav, .tb-layout-sidebar, .tb-side-menu-container, 
                .tb-primary-toolbar { 
                    display: none !important; 
                }
                
                /* Reset margins so the main content fills the screen */
                .tb-main-content {
                    margin-left: 0 !important;
                    margin-top: 0 !important;
                    padding-top: 0 !important;
                }
                
                mat-sidenav-content, .mat-sidenav-content {
                    margin-left: 0 !important;
                }
                
                #tb-main-container {
                    padding-left: 0 !important;
                }
                
                /* Hide User profile / tenant toggle context if floating */
                .tb-user-menu, .tb-tenant-menu { display: none !important; }
            </style>
            
            <script id="headless-warden">
            (function() {
                // AGGRESSIVE WARDEN SCRIPT
                // Przeglądarka uruchomi ten skrypt obok Angulara.
                // Fizyczne usunięcie tagów HTML przez 'el.remove()' doprowadziłoby do błędu Angular Factory (Crash aplikacji), 
                // ponieważ framework zgubiłby swoje obiekty w pamięci.
                // Dlatego ten kod "Warden" pilnuje elementów co 100 milisekund niczym tarcza.
                // Jeśli użytkownik otworzy DevTools i odznaczy sobie 'display: none', skrypt natychmiast mu to nadpisze!

                const hideSelectors = [
                    'tb-side-menu', 
                    'mat-sidenav', 
                    '.tb-layout-sidebar', 
                    '.tb-side-menu-container', 
                    '.tb-primary-toolbar',
                    'header.tb-nav-header',
                    'mat-toolbar.tb-side-menu-toolbar'
                ];

                const resetMarginSelectors = [
                    '.tb-main-content',
                    'mat-sidenav-content', 
                    '.mat-sidenav-content',
                    '#tb-main-container'
                ];

                setInterval(() => {
                    // 1. Zabetonuj ukrywanie paska nawigacji i headera
                    hideSelectors.forEach(selector => {
                        document.querySelectorAll(selector).forEach(el => {
                            if (el.style.display !== 'none') {
                                // Nawet jeśli ktoś w konsoli spróbuje wyświetlić menu, blokujemy jego istnienie:
                                el.setAttribute('style', 'display: none !important; visibility: hidden !important; opacity: 0 !important; width: 0 !important; height: 0 !important; pointer-events: none !important; position: absolute !important; overflow: hidden !important; z-index: -9999 !important;');
                                
                                // Opróżniamy zawartość tekstową wnętrza, by całkowicie zniszczyć linki w nawigacji
                                // Zostawiamy samą pustą wydmuszkę dla silnika Angulara
                                if (el.innerHTML.length > 0) {
                                    el.innerHTML = '';
                                }
                            }
                        });
                    });

                    // 2. Zabetonuj powrót marginesów do zerowych wartości
                    resetMarginSelectors.forEach(selector => {
                        document.querySelectorAll(selector).forEach(el => {
                            // Wymusza zerowy margines lewy i górny (nadpisuje zmiany z DevTools)
                            el.style.setProperty('margin-left', '0px', 'important');
                            el.style.setProperty('margin-top', '0px', 'important');
                            el.style.setProperty('padding-left', '0px', 'important');
                            el.style.setProperty('padding-top', '0px', 'important');
                        });
                    });
                }, 100);
            })();
            </script>
          `;

              html = html.replace('</head>', injectedCss + '</head>');
              // fallback intercept if </head> cap is different
              if (!html.includes(injectedCss)) {
                html = html.replace('<body', injectedCss + '<body');
              }
              return Promise.resolve(html);
            }

            return Promise.resolve(responseBuffer);
          },
        ),
      },
    }),
  );

  tbProxy.listen(tbProxyPort, () => {
    const logger = new Logger('TB-Proxy');
    logger.log(`ThingsBoard Proxy Server running on port ${tbProxyPort}`);
  });
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'], // ← Wszystkie levele
  });

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:3000',
      'http://localhost:8088',
    ],
    credentials: true,
  });
  const config = new DocumentBuilder()
    .setTitle('Proxy API')
    .setDescription('API for Proxy')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.use(cookieParser());

  app.setGlobalPrefix('api', {
    exclude: [
      { path: 'swagger', method: RequestMethod.ALL },
      { path: 'fhir', method: RequestMethod.ALL },
      { path: 'fhir/*path', method: RequestMethod.ALL },
      { path: 'public-api/*path', method: RequestMethod.ALL },
    ],
  });
  // app.useGlobalFilters(new SimpleExceptionFilter());
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
    },
  });

  const port = process.env.PORT ?? 3003;
  await app.listen(port);
  logger.log(`Server running on port ${port}`);
}

// Start TB Auth proxy asynchronously
bootstrapTbProxy();

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
