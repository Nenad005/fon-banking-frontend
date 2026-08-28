# FON Banking mobilna aplikacija

FON Banking je demonstraciona mobilna aplikacija za elektronsko bankarstvo razvijena pomocu React Native-a, Expo-a i TypeScript-a. Aplikacija komunicira sa zasebnim Laravel REST API-jem.

> Projekat je prototip namenjen demonstraciji. Ne povezuje se sa stvarnom bankom i ne treba ga koristiti sa stvarnim finansijskim ili karticnim podacima.

Serverska aplikacija: [fon-banking-backend](https://github.com/Nenad005/fon-banking-backend)

## Funkcionalnosti

- aktivacija uredjaja i postavljanje cetvorocifrenog PIN-a;
- prijava PIN-om i upravljanje sesijom;
- pregled dinarskih i deviznih racuna;
- pregled i privremeno otkrivanje podataka kartice;
- prikaz stanja, kursne liste i poslednjih transakcija;
- kreiranje prenosa novca i brza placanja;
- skeniranje i generisanje NBS IPS QR kodova;
- pretraga, filtriranje, paginacija i CSV izvoz transakcija;
- prikaz profila i odjava.

## Tehnologije

- Expo SDK 57 i Expo Router;
- React 19, React Native 0.86 i TypeScript;
- Axios za REST komunikaciju;
- NativeWind i Tailwind CSS za stilizovanje;
- Expo Camera, Image Picker, Secure Store, File System i Sharing;
- React Native Reanimated, Lottie i Gorhom Bottom Sheet.

## Preduslovi

Za sve nacine pokretanja potrebni su:

- Node.js 20 ili noviji;
- npm;
- Git;
- pokrenut [FON Banking backend](https://github.com/Nenad005/fon-banking-backend).

Za fizicki Android ili iPhone instalirajte Expo Go iz Google Play prodavnice ili App Store-a.

Za Android emulator dodatno su potrebni Android Studio, Android SDK i konfigurisan virtuelni uredjaj.

Za iOS Simulator ili lokalni iOS build potreban je macOS sa Xcode-om i Xcode Command Line Tools. iOS aplikaciju nije moguce lokalno izgraditi na Windows-u ili Linux-u.

## Instalacija

Klonirajte repozitorijum i instalirajte zavisnosti iz `package-lock.json` fajla:

```bash
git clone https://github.com/Nenad005/fon-banking-frontend.git
cd fon-banking-frontend
npm ci
```

Pre pokretanja klijenta pokrenite backend na portu 8000:

```bash
cd ../fon-banking-backend
php artisan serve --host=0.0.0.0 --port=8000
```

Ako backend radi u Dockeru i port `8000:8080` je objavljen kroz Compose, dodatna Laravel komanda nije potrebna.

## API konfiguracija

Jedina obavezna frontend promenljiva je:

```env
EXPO_PUBLIC_API_URL=http://ADRESA_BACKENDA:8000/api/v1
```

URL zavisi od uredjaja na kome se aplikacija pokrece:

| Okruzenje | Vrednost `EXPO_PUBLIC_API_URL` |
| --- | --- |
| Fizicki Android uredjaj | `http://<LAN_IP_RACUNARA>:8000/api/v1` |
| Fizicki iPhone | `http://<LAN_IP_RACUNARA>:8000/api/v1` |
| Android Studio emulator | `http://10.0.2.2:8000/api/v1` |
| iOS Simulator | `http://127.0.0.1:8000/api/v1` |

`localhost` na fizickom telefonu oznacava sam telefon, a ne razvojni racunar. Zbog toga fizicki uredjaj koristi LAN adresu racunara. Telefon i racunar moraju biti na istoj mrezi, a lokalni firewall mora dozvoliti port 8000.

## Pokretanje pomocu Expo Go aplikacije

Napravite `.env.local` u frontend direktorijumu i unesite odgovarajucu adresu backenda. Na primer, za fizicki uredjaj koristite LAN adresu razvojnog racunara:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.50:8000/api/v1
```

Pokrenite Expo development server:

```bash
npx expo start
```

Na fizickom Android uredjaju otvorite Expo Go i skenirajte QR kod iz terminala. Na iPhone-u skenirajte QR kod kamerom i otvorite projekat u Expo Go aplikaciji. Telefon i razvojni racunar moraju biti na istoj mrezi.

Za Android emulator pritisnite `a`, a za iOS Simulator `i` u terminalu. Vrednost `EXPO_PUBLIC_API_URL` prethodno podesite prema tabeli iz sekcije [API konfiguracija](#api-konfiguracija).

Pri prvom pokretanju na iOS-u sistem moze zatraziti dozvolu za pristup uredjajima u lokalnoj mrezi. Ova dozvola mora biti odobrena da bi aplikacija pristupila lokalnom backendu.

Posle promene promenljive okruzenja zaustavite Metro i ponovo ga pokrenite. Ako je stara vrednost ostala u cache-u, koristite:

```bash
npx expo start --clear
```

## Lokalni development build

Komande `run` kompajliraju native aplikaciju, instaliraju je na dostupni uredjaj ili emulator i pokrecu Metro server. Koristite ih za prvi build i nakon promene native zavisnosti ili konfiguracije.

### Android

Za native Android build potrebni su Android Studio, Android SDK i ispravno podesen emulator ili USB uredjaj. Pokrenite:

```bash
npx expo run:android
```

Ako je dostupno vise fizickih uredjaja ili emulatora, dodajte `--device` i izaberite uredjaj sa liste:

```bash
npx expo run:android --device
```

Fizicki Android uredjaj mora imati ukljucene Developer options i USB debugging.

### iOS

Native iOS build zahteva macOS i Xcode:

```bash
npx expo run:ios
```

Ako je dostupno vise fizickih uredjaja ili simulatora, dodajte `--device`:

```bash
npx expo run:ios --device
```

Za fizicki iPhone potreban je odgovarajuci Apple development signing nalog u Xcode-u.

Nakon sto je development build instaliran, za svakodnevne JavaScript i TypeScript izmene dovoljno je ponovo pokrenuti Metro bez novog native builda:

```bash
npx expo start
```

## Lokalni production build

Production build se kompajlira, instalira i pokrece na dostupnom uredjaju ili emulatoru, gde ostaje instaliran i nakon zavrsetka komande.

Za Android koristite `release` varijantu:

```bash
npx expo run:android --variant release
```

Za iOS koristite `Release` konfiguraciju:

```bash
npx expo run:ios --configuration Release
```

Po potrebi se i ovim komandama moze dodati `--device` za izbor ciljnog uredjaja. Ovi lokalni production buildovi sluze za testiranje i nisu automatski potpisani za objavljivanje u Google Play ili App Store prodavnici.

## Demonstracioni pristup

Posle `php artisan migrate:fresh --seed` na backendu dostupni su sledeci aktivacioni kodovi:

| Korisnik | Aktivacioni kod |
| --- | --- |
| Luka Nenadovic | `LUKA-2026` |
| Marko Nenadovic | `MARKO-2026` |

Nakon aktivacije korisnik sam postavlja cetvorocifreni PIN. Kod je jednokratan. Za ponovno testiranje aktivacije potrebno je ponovo seedovati backend bazu.

## Provera projekta

Provera ESLint pravila:

```bash
npm run lint
```

TypeScript provera bez generisanja izlaznih fajlova:

```bash
npx tsc --noEmit
```

## Cesti problemi

### Telefon ne moze da pristupi API-ju

- proverite da backend koristi `--host=0.0.0.0`;
- proverite da telefon i racunar koriste istu mrezu;
- otvorite `http://<LAN_IP>:8000/up` u browseru telefona;
- proverite firewall i VPN;
- proverite da URL sadrzi `/api/v1`.

### Android emulator prijavljuje network error

Koristite `10.0.2.2`, a ne `localhost`. Proverite da je backend dostupan na `http://localhost:8000/up` sa razvojnog racunara.

### iOS Simulator prijavljuje network error

Koristite `http://127.0.0.1:8000/api/v1` i proverite da backend radi na portu 8000.

### Aktivacioni kod vise ne radi

Aktivacioni kod je vec iskoriscen ili je istekao. U backend direktorijumu ponovo formirajte demonstracionu bazu:

```bash
php artisan migrate:fresh --seed
```

Ova komanda brise sve postojece lokalne podatke.

## Licenca

Projekat je razvijen u obrazovne svrhe u okviru Fakulteta organizacionih nauka Univerziteta u Beogradu.
