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

## Fizicki Android uredjaj

Najjednostavniji postupak koristi Expo Go i automatsku LAN konfiguraciju:

1. Pokrenite backend sa `--host=0.0.0.0`.
2. Povezite Android telefon i razvojni racunar na istu mrezu.
3. U frontend direktorijumu pokrenite `npm start`.
4. Otvorite Expo Go i skenirajte QR kod prikazan u terminalu ili browseru.

```bash
npm start
```

Skripta automatski pronalazi aktivnu LAN IPv4 adresu racunara, postavlja URL oblika `http://<LAN_IP>:8000/api/v1` i pokrece Expo u LAN rezimu.

Ako skripta izabere pogresan mrezni interfejs, adresu zadajte eksplicitno:

```bash
LAN_IP=192.168.1.50 npm start
```

Na Windows PowerShell-u ekvivalent je:

```powershell
$env:LAN_IP="192.168.1.50"
npm start
```

## Fizicki iPhone

Postupak je isti kao za fizicki Android:

1. Pokrenite backend sa `--host=0.0.0.0`.
2. Povezite iPhone i razvojni racunar na istu mrezu.
3. Pokrenite `npm start`.
4. Skenirajte Expo QR kod iPhone kamerom i otvorite projekat u Expo Go aplikaciji.

```bash
npm start
```

Pri prvom koriscenju iOS moze traziti dozvolu za pristup uredjajima u lokalnoj mrezi. Dozvola mora biti odobrena da bi aplikacija mogla da pristupi lokalnom backendu.

## Android emulator

Pokrenite Android virtuelni uredjaj iz Android Studio Device Manager-a. Standardni Android emulator pristupa razvojnom racunaru preko adrese `10.0.2.2`.

macOS ili Linux:

```bash
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000/api/v1 npm run start:manual
```

Windows PowerShell:

```powershell
$env:EXPO_PUBLIC_API_URL="http://10.0.2.2:8000/api/v1"
npm run start:manual
```

Kada se Metro pokrene, pritisnite `a` u terminalu da otvorite aplikaciju u emulatoru.

## iOS Simulator

iOS Simulator radi samo na macOS-u. Pokrenite backend, a zatim:

```bash
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1 npm run start:manual
```

Kada se Metro pokrene, pritisnite `i` u terminalu. Ako simulator nije vec pokrenut, Expo ce pokusati da ga otvori kroz Xcode.

## `.env.local` fajl i rucno pokretanje

Ako ne zelite automatsku detekciju LAN adrese, napravite `.env.local` u frontend direktorijumu:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.50:8000/api/v1
```

Zatim koristite:

```bash
npm run start:manual
```

Komanda `npm start` namerno postavlja automatski pronadjenu LAN adresu i time ima prednost nad vrednoscu iz `.env.local` fajla. `.env.local` je zato najkorisniji uz `npm run start:manual` i vec je izuzet iz Git repozitorijuma.

Posle promene promenljive okruzenja zaustavite Metro i ponovo ga pokrenite. Ako je stara vrednost ostala u cache-u, koristite:

```bash
npx expo start --clear
```

## Lokalni native build za Android

Za native Android build potrebni su Android Studio, Android SDK i ispravno podesen emulator ili USB uredjaj. Pokrenite:

macOS ili Linux:

```bash
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000/api/v1 npm run android
```

Windows PowerShell:

```powershell
$env:EXPO_PUBLIC_API_URL="http://10.0.2.2:8000/api/v1"
npm run android
```

Za fizicki Android uredjaj umesto `10.0.2.2` koristite LAN adresu racunara. Uredjaj mora imati ukljucen Developer options i USB debugging.

## Lokalni native build za iOS

Native iOS build zahteva macOS i Xcode:

```bash
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1 npm run ios
```

Komanda generise potrebne native direktorijume ako ne postoje, instalira iOS zavisnosti i pokrece aplikaciju u simulatoru. Za fizicki iPhone koristite LAN adresu racunara i odgovarajuci Apple development signing nalog u Xcode-u.

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
