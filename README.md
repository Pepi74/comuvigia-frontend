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

### Instalación de dependencias
```bash
pip install -r tests/e2e/requirements.txt
```

### Configuración
Agregar al archivo `.env`:
```bash
BASE_URL=http://localhost:8100
TEST_USER=tu_usuario
TEST_PASSWORD=tu_contraseña
```

### Ejecución
```bash
pytest tests/e2e/ -v
```

## Análisis de calidad de código (SonarQube)

### Requisitos
- Docker instalado
- sonar-scanner-cli instalado
- SonarQube corriendo (ver instrucciones en backend)

### Ejecutar análisis
```bash
sonar-scanner \
  -Dsonar.projectKey=comuvigia-frontend \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9010 \
  -Dsonar.token=TU_TOKEN \
  -Dsonar.exclusions=node_modules/**,coverage/**,dist/**,build/**
```

> Nota: reemplazar TU_TOKEN con el token generado en SonarQube para el proyecto comuvigia-frontend.