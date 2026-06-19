# ComuVigIA Frontend

Frontend de la plataforma ComuVigIA desarrollado en Ionic React.

### Instalación

```
npm install
```

### Ejecución
```
ionic serve
```

### Producción
```
ionic build --prod
```

## Pruebas E2E (Selenium)

### Requisitos

- Python 3.12+
- Google Chrome instalado
- Sistema completo desplegado localmente con Docker:

```bash
docker compose up -d
```

> Las pruebas apuntan al frontend en `http://localhost:8100` y requieren que el backend y las bases de datos estén activos.

### Instalación de dependencias

```bash
pip install -r tests/e2e/requirements.txt
```

### Configuración

Crear un archivo `.env` con las siguientes variables:
```bash
VITE_BACKEND_URL=url_backend_nodejs # http://localhost:3000 por defecto
VITE_CAMERA_URL=url_backend_flask # http://localhost:3000 por defecto
VITE_IA_URL=url_ia # http://localhost:4000 por defecto

BASE_URL=url_frontend # http://localhost:8100 por defecto
TEST_USER_ADMIN=tu_usuario_admin
TEST_PASSWORD=tu_contraseña
TEST_USER_OPERATOR=tu_usuario_operador
```

> Estos valores son utilizados para el desarrollo de la aplicación por defecto. `TEST_USER_ADMIN` debe corresponder a un usuario con rol 2 (administrador) y `TEST_USER_OPERATOR` a un usuario con rol 1 (operador), ambos registrados en el sistema. Además se asume que `TEST_PASSWORD` es la contraseña para `TEST_USER_ADMIN` y `TEST_USER_OPERATOR`.

### Ejecución

Ejecutar todos los casos E2E:
```bash
pytest tests/e2e/ -v
```

Ejecutar un archivo específico:
```bash
pytest tests/e2e/test_login.py -v
pytest tests/e2e/test_home.py -v
pytest tests/e2e/test_alertas.py -v
pytest tests/e2e/test_mantenedores.py -v
```

Los archivos corresponden a los siguientes casos:

| Archivo | Casos | Descripción |
|--------|-------|-------------|
| `test_login.py` | ST-01, ST-02 | Inicio de sesión válido e inválido |
| `test_home.py` | ST-03 a ST-06 | Panel principal, navbar y logout |
| `test_alertas.py` | ST-07a, ST-07b | Panel de notificaciones |
| `test_mantenedores.py` | ST-08 a ST-10 | Control de acceso por rol |

Las capturas de pantalla generadas por cada caso quedan en `tests/e2e/screenshots/`.

## Análisis de calidad de código (SonarQube)

### Requisitos
- Docker instalado
- sonar-scanner-cli instalado
- SonarQube corriendo (ver instrucciones en el repositorio del backend)

### Ejecutar análisis

```bash
sonar-scanner \
  -Dsonar.projectKey=comuvigia-frontend \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9010 \
  -Dsonar.token=TU_TOKEN \
  -Dsonar.exclusions=node_modules/**,coverage/**,dist/**,build/**,**/*.test.tsx,**/*.test.ts,tests/**,**/*.test.js \
  -Dsonar.coverage.exclusions=**/*.test.tsx,**/*.test.ts,tests/** \
  -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
```

> Reemplazar `TU_TOKEN` con el token generado en SonarQube para el proyecto `comuvigia-frontend`.