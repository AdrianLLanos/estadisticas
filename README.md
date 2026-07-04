# Comparador MLB

Aplicacion web estatica para comparar partidos MLB de la jornada usando datos publicos de MLB Stats API y ESPN MLB.

## Funciones

- Carga partidos MLB por fecha.
- Muestra lanzadores probables con datos de ESPN y respaldo de MLB.
- Calcula estimaciones de ganador, carreras totales, handicap y hits.
- Usa estadisticas ofensivas, defensivas y de pitchers como ERA, WHIP, K/9, BB/9, HR/9, OPS, OBP y SLG.

## Uso local

Abre `index.html` directamente o inicia un servidor local:

```bash
python -m http.server 4173
```

Luego entra a:

```txt
http://127.0.0.1:4173/
```

## Aviso

Las proyecciones son estimaciones estadisticas automaticas. No garantizan resultados deportivos ni sustituyen gestion de riesgo.
