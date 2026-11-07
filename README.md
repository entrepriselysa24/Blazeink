# Blaze Ink — sito ufficiale

Sito one-page di **Blaze Ink** (Biagio), tatuatore Ornamental & Blackwork.
Next.js 15 · React 19 · TypeScript · Tailwind CSS 4 · Lucide Icons.
In tre lingue: inglese (principale, su `/`), italiano (`/it`) e spagnolo (`/es`).

---

## 1. Avvio in locale

Requisiti: **Node.js 18.18 o superiore** (consigliato Node 20 o 22).

```bash
npm install
cp .env.example .env.local   # poi compila i valori (vedi sezione 3)
npm run dev
```

Apri http://localhost:3000. L'intro parte alla prima visita.
Per rivederla: apri gli strumenti del browser e cancella dal localStorage la voce `bi-intro-seen`, oppure usa una finestra in incognito.

Altri comandi:

```bash
npm run build      # build di produzione
npm run start      # avvia la build di produzione
npm run typecheck  # controllo dei tipi TypeScript
```

---

## 2. Struttura

```
public/
  brand/            logo originale (ritagliato, mai ridisegnato): completo, emblema, scritta, monogramma
  images/portfolio/ foto reali dei lavori
  images/artist/    foto reali di Biagio
  video/            clip intro (riprese reali) e video del lavoro sul torso
  og-image.jpg      immagine per le condivisioni social
src/
  app/[lang]/       layout (SEO, font, metadata), homepage, pagina privacy, 404
  app/api/booking/  invio del modulo di prenotazione via email
  app/sitemap.ts, robots.ts, icon.png
  components/       Intro, Header, Hero, Portfolio (+ lightbox), ArtistJourney, Booking, Footer, Cursor…
  content/          portfolio.ts e journey.ts: i contenuti da aggiornare
  lib/              i18n.ts (tutti i testi EN/IT/ES), booking.ts (regole del modulo), site.ts (configurazione)
```

---

## 3. Configurazione (cosa manca e va impostato)

Tutto si imposta con le variabili in `.env.local` (in locale) o nel pannello dell'hosting (in produzione).

| Variabile | Cosa serve | Stato |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Indirizzo pubblico del sito, per SEO e anteprime social | **Da impostare** quando c'è il dominio |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Email professionale mostrata sul sito (link mailto) | **Da fornire**. Se vuota, l'email non compare |
| `RESEND_API_KEY` | Chiave del servizio che spedisce le email del modulo | **Da creare** |
| `BOOKING_TO_EMAIL` | Casella che riceve le richieste di Biagio | **Da fornire** |
| `BOOKING_FROM_EMAIL` | Mittente, su un dominio verificato in Resend | **Da impostare** |
| `BOOKING_SEND_CONFIRMATION` | `true` per mandare al cliente una conferma automatica di ricezione | Facoltativo |

### Modulo di prenotazione: come attivarlo

Il modulo è collegato a un backend vero (`/api/booking`) che spedisce la richiesta via email con [Resend](https://resend.com), un servizio gratuito fino a 3.000 email al mese.

1. Crea un account su resend.com e genera una **API key** → `RESEND_API_KEY`.
2. In Resend → *Domains*, aggiungi il dominio del sito e copia i record DNS che ti indica. Poi il mittente sarà ad esempio `Blaze Ink <booking@tuodominio.com>` → `BOOKING_FROM_EMAIL`.
   - Per una prova senza dominio puoi usare `Blaze Ink <onboarding@resend.dev>`: in questo caso Resend consegna solo all'email del tuo account Resend.
3. Imposta `BOOKING_TO_EMAIL` con l'email di Biagio.

**Finché queste tre variabili non sono impostate**, il modulo non finge l'invio: risponde "Online booking is not active yet" e mostra il link per scrivere su Instagram.

Cosa fa il backend:
- valida tutti i campi (le stesse regole del browser, in `src/lib/booking.ts`);
- accetta fino a 3 immagini JPG, PNG o WebP. Ne controlla il contenuto reale e non solo l'estensione, e scarta il nome originale del file;
- le immagini vengono ridimensionate nel browser prima dell'invio, e così perdono i dati GPS e della fotocamera;
- protezione antispam: campo nascosto (honeypot) e massimo 5 richieste ogni 10 minuti per IP;
- **non salva nulla** sul server: la richiesta arriva solo per email, e "Rispondi" scrive direttamente al cliente;
- se il servizio email non risponde, il visitatore vede un errore e l'invito a scrivere su Instagram.

---

## 4. Aggiornare i contenuti

- **Testi** (in tutte e tre le lingue): `src/lib/i18n.ts`.
- **Portfolio**: metti la foto in `public/images/portfolio/` con un nome descrittivo (es. `ornamental-forearm-mandala.jpg`) e aggiungi una voce in `src/content/portfolio.ts`. Le istruzioni sono in cima al file. Next.js crea in automatico le versioni AVIF/WebP ottimizzate.
- **Viaggio / timeline**: `src/content/journey.ts`.
- **Instagram**: `src/lib/site.ts` (oggi punta a https://www.instagram.com/blaze_ink_/, il profilo verificato).

---

## 5. Pubblicazione (deploy)

Consigliato **Vercel** (piano gratuito, HTTPS automatico, nativo per Next.js):

1. Carica il progetto su GitHub (un repository privato va bene).
2. Su vercel.com: *Add New → Project*, importa il repository e lascia le impostazioni proposte.
3. In *Settings → Environment Variables* inserisci le variabili della sezione 3.
4. Fai il deploy. Il sito è online su un indirizzo `*.vercel.app` con HTTPS.
5. **Dominio**: quando lo comprate, aggiungilo in *Settings → Domains* e aggiorna `NEXT_PUBLIC_SITE_URL`.

> **Nota su Wix:** Wix non ospita progetti Next.js. Se il dominio viene comprato su Wix si può comunque collegare a Vercel (nei DNS di Wix si inseriscono i record che indica Vercel). Questo progetto non va ricostruito su Wix.

Netlify e altri hosting Node funzionano allo stesso modo.

---

## 6. Scelte tecniche

- **Intro**: scena 1 costruita con il logo originale e maschere CSS (il logo non è ridisegnato); scena 2 con **riprese macro reali** di Biagio prese dal video fornito, più una linea d'inchiostro ornamentale disegnata in SVG che fa da transizione. Non è stato usato 3D generato: le riprese reali sono più autentiche e molto più leggere (clip di circa 200 KB). Pulsante *Skip*, tasto Esc, nessun audio. Si vede una volta ogni 14 giorni. È disattivata con "riduci movimento", con il risparmio dati o arrivando da un link a una sezione. Se il video non parte, appare il fotogramma fisso (fallback 2D).
- **Animazioni**: reveal allo scroll, parallax leggerissimo, zoom e tende sulle immagini, micro-animazioni dei pulsanti. Sono fatte con CSS e un solo IntersectionObserver condiviso. **Framer Motion e GSAP non sono stati inclusi** perché non servivano: risparmiano circa 40–60 KB di JavaScript e aiutano il punteggio Lighthouse. Tutto rispetta `prefers-reduced-motion`.
- **Cursore**: giglio (fleur-de-lis) vettoriale originale in argento. Ruota con un riflesso sugli elementi cliccabili e pulsa al click. È attivo solo su desktop con mouse; nei campi di testo resta il cursore normale.
- **SEO**: metadata per lingua, hreflang, canonical, Open Graph e Twitter card, dati strutturati JSON-LD, sitemap.xml e robots.txt.
- **Accessibilità**: link "salta al contenuto", focus visibile, lightbox e menu usabili da tastiera, errori del modulo associati ai campi, testi alternativi in tre lingue.
- **Sicurezza**: header HSTS, nosniff, referrer-policy, frame-options, permissions-policy.

---

## 7. Cosa è stato verificato e cosa no

Verificato prima della consegna (con gli stessi componenti, in un ambiente senza accesso a npm):
- rendering desktop (1440px) e mobile (390px), senza scroll orizzontale né errori in console;
- intro: sequenza delle due scene, Skip, nessuna ripetizione, disattivazione con reduced motion;
- portfolio: filtri, lightbox (frecce, Esc, contatore), reveal;
- modulo: errori di validazione, stato "non configurato", messaggio di conferma;
- API `/api/booking`, testata con richieste reali: invio con allegato, escape dell'HTML, conferma al cliente, dati non validi (422), finta immagine rifiutata, honeypot, limite di 3 file, rate limit (429), servizio email non raggiungibile (502), servizio non configurato (503).

Nota: in `next.config.ts` i controlli TypeScript ed ESLint non bloccano la build (`ignoreBuildErrors`), così il primo deploy non si ferma per un dettaglio formale. Dopo il primo avvio esegui `npm run typecheck`, correggi eventuali segnalazioni e poi puoi togliere quelle due righe.

**Da verificare dopo `npm install`** (non è stato possibile installare i pacchetti npm nell'ambiente di sviluppo):
- `npm run build` e `npm run typecheck`;
- caricamento dei font Google (Cinzel, Inter, Cormorant) tramite `next/font`;
- punteggio Lighthouse sul sito pubblicato (l'obiettivo è 95+, ma non è stato misurato).

---

## 8. Contenuti mancanti

- **Altre foto dei lavori**: oggi il portfolio ha 2 lavori reali, cioè il torso dark ornamental (video, 2 viste e 2 dettagli) e un lettering kanji. Servono foto nitide di altri pezzi Ornamental e Blackwork, meglio se a 1600–2400 px.
- **Email professionale** e **dominio**.
- Le date del percorso sono indicate solo dove sono certe; per le altre tappe c'è la durata. Se Biagio conferma gli anni esatti, si aggiornano in `src/content/journey.ts`.
