CLOCKED IN
En mobil vennlig studie-tracker inspirert av Strava
logg arbeid per fag, sett ukemål, følg progresjon og bygg streaks - uten at studier føles som et press.
dette er en reel MVP, bygget for å brukes over tid og vidreutvikles kontinuerlig uten tap av data.

CLOCKED IN lar brukere
- opprette fag med ukentlige mål
- logge ardeidstimer per fag
- se ukesprogresjon og total innsats
- arkivere fag og beholde historikk
- bygge streaks og aktivitetsvaner 
fokuset er motivasjon + oversikt, ikke karakterjakt 

ARKITEKTUR
* FRONTEND: React + Vite + Typescript 
* Backend: supabase (Auth + postgres)
* Deploy: Vercel

SIKKERHET 
* RLS er aktivert på alle tabeller og sikrer at bruker kun har tilgang på egne data 
* alle DB - operasjoiner er bundet til auth.uid()
* ingen sensetiv logikk ligger i klienten
