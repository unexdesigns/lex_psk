Development aplinka: `npm run dev`  
Produkcinės aplinka: `npm run prod`

**Google API Key**: `AIzaSyCwsqyR30H2vUlJuTotTffzLQpPnfvgG0E`

Kompiliuotų failų direktorijos:
* Stiliai kompiliuojami į: `styles/css/style.css`
* Skriptai kompiliuojami į: `scripts/dist/bundle.js`

# Svarbi informacija

Šis projektas naudoja WebPack technologiją, kurios deka galima naudoti paketus iš `node_modules` JavaScript kode. Pavyzdžiui: `import $ from 'jquery'`

Jeigu norite naudoti WebPack, reikia keleto veiksmų:

1. Įsirašome Node.js iš https://nodejs.org/en/
Įsirašę, komandinėje eilutėje CLI (cmd.exe) turėtų būti pasiekiama `npm -v` funkcija
2. Atsidarome `\\192.168.2.18\www-data\design\design.psk.lexitacrm.lt` katalogą per komandinę eilutę Tai nėra taip paprasta, nes `\\192.168.2.18\www-data` turi būti registruotas kaip tinklo diskas jūsų kompiuteryje. 

   Daugiau info: https://support.microsoft.com/am-et/help/4026635/windows-map-a-network-drive Kai turite tinklo diską (Z:), uždenka įvesti komandą: `pushd Z: && cd design/design.psk.lexitacrm.lt/` direktorijai atidaryti
3. Su `npm` leidžiame `npm run dev` skript'ą, nurodytą `package.json` faile su CLI.
4. Sukompiliuotas failas sėdi `/scripts/dist/bundle.js`, kaip yra
nurodyta `webpack.config.js` faile.

   Jeigu kilo sunkumų, paleiskite funkciją `npm install` root direktorijoje,
ši funkcija įrašys visus reikiamus paketus webpack kompiliavimui

