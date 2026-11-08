# STEINPLATTE

Frontend-Demo für einen österreichischen Shop für Mineralien, Edelsteine,
Schmuck und alpine Produkte. Die Oberfläche ist auf Deutsch (Österreich)
gestaltet und verwendet React, TypeScript, Vite und TanStack Router.

## Lokal starten

```sh
npm install
npm run dev
```

## Verfügbare Prüfungen

```sh
npm run typecheck
npm run build
```

## Demo-Bereich

Die öffentliche Website ist unter `/` erreichbar, die Verwaltung unter
`/verwaltung`. Der Demo-Login ist unter `/verwaltung/anmelden` erreichbar.
Produkte, Warenkorb und Lagerbewegungen werden lokal im Browser gespeichert.
Die Sitzung ist nur eine Navigationsdemo und keine echte Authentifizierung.
Es gibt keine Bestellabwicklung, Zahlung oder Backend-Verbindung.
Die Produktverwaltung bietet einen JSON-Export der Demo-Produkte inklusive
lokal gespeicherter Produktbilder.

Die verwendeten Mineralfotografien stammen aus Wikimedia Commons und stehen
unter den jeweiligen freien Lizenzen. Wo kein passendes Produktfoto vorhanden
ist, zeigt der Shop „Bild folgt“. Vollständige Bildnachweise sind unter
`/image-credits.txt` veröffentlicht.