# Banorte Energy Savings App

Proyecto para el HackMTY edición 2025. Participación para el reto de Banorte "Smart Cities". App móvil con incentivos de ahorro de servicios urbanos como energía y agua.

## Características

### ✅ Funcionalidades Implementadas

- **Base de Datos Local**: Sistema de almacenamiento con AsyncStorage que mantiene:
  - Datos de usuarios de Banorte
  - Recibos de luz escaneados
  - Historial de consumo
  - Registro de cashback

- **Escaneo de Recibos (OCR)**: 
  - Interfaz preparada para integración con cámara
  - Entrada manual de datos del recibo
  - Validación de información

- **Dashboard de Usuario**:
  - Visualización de consumo actual
  - Historial de recibos
  - Cashback acumulado
  - Estadísticas de ahorro

- **Dashboard Bancario**:
  - Vista general de todos los usuarios
  - Estadísticas de cashback total
  - Métricas de ahorro energético
  - Impacto ambiental

- **Sistema de Cashback**:
  - Cálculo automático basado en ahorro de energía
  - Algoritmo de línea base que se recalcula cada periodo
  - Diferentes tiers de cashback según porcentaje de ahorro:
    - 0-5%: $1.5 MXN por kWh
    - 5-10%: $2 MXN por kWh
    - 10-15%: $2.5 MXN por kWh
    - 15%+: $3 MXN por kWh

## Tecnologías Utilizadas

- **React Native** 0.82.1
- **TypeScript** 5.8.3
- **React Navigation** 6.x
- **AsyncStorage** para persistencia de datos
- **React Native Vector Icons** para iconografía
- **date-fns** para manejo de fechas

## Instalación

### Requisitos previos
- Node.js >= 20
- npm o yarn
- Android Studio (para Android) o Xcode (para iOS)

### Pasos de instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/Daigus01/HackMTY_CodingWitches.git
cd HackMTY_CodingWitches
```

2. Instalar dependencias:
```bash
npm install
```

3. Para iOS (solo macOS):
```bash
cd ios && pod install && cd ..
```

4. Ejecutar la aplicación:

Para Android:
```bash
npm run android
```

Para iOS:
```bash
npm run ios
```

## Usuarios Demo

La aplicación viene con usuarios de prueba pre-cargados:

**Clientes:**
- juan.perez@banorte.com
- maria.gonzalez@banorte.com

**Banco:**
- admin@banorte.com

## Estructura del Proyecto

```
├── src/
│   ├── components/        # Componentes reutilizables
│   ├── screens/          # Pantallas de la aplicación
│   │   ├── LoginScreen.tsx
│   │   ├── UserDashboardScreen.tsx
│   │   ├── BankDashboardScreen.tsx
│   │   ├── ScanBillScreen.tsx
│   │   ├── BillHistoryScreen.tsx
│   │   └── CashbackHistoryScreen.tsx
│   ├── navigation/       # Configuración de navegación
│   ├── services/         # Servicios de negocio
│   │   ├── DatabaseService.ts
│   │   └── EnergyCalculatorService.ts
│   ├── models/          # Modelos de datos TypeScript
│   └── utils/           # Utilidades
├── android/             # Código nativo Android
├── ios/                 # Código nativo iOS
└── App.tsx             # Punto de entrada
```

## Algoritmo de Cálculo de Línea Base

El algoritmo calcula la línea base de consumo usando los últimos 3-6 meses de historial:

1. Se obtienen los recibos anteriores del usuario
2. Se calcula un promedio ponderado donde los meses más recientes tienen mayor peso
3. La línea base se recalcula cada periodo
4. El ahorro se determina comparando el consumo actual vs la línea base
5. El cashback se calcula en base al ahorro usando tiers progresivos

## Próximas Mejoras

- [ ] Integración completa de OCR con cámara
- [ ] Backend con API REST
- [ ] Base de datos en la nube
- [ ] Notificaciones push
- [ ] Gráficos avanzados de consumo
- [ ] Comparación con vecinos
- [ ] Sistema de metas y recompensas
- [ ] Integración con servicios de pago

## Contribuidores

Equipo CodingWitches - HackMTY 2025

## Licencia

Este proyecto fue desarrollado para el HackMTY 2025.
