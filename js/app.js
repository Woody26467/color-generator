const colorsContainers = document.querySelector('.colors-container')
const spawnButton = document.querySelector('#spawn-button')
const shadesButton = document.querySelector('.shades-button')
const complementaryButton = document.querySelector('#complementary')
const splitButton = document.querySelector('#split')
const triadicButton = document.querySelector('#triadic')
const tetradicButton = document.querySelector('#tetradic')
const analogousButton = document.querySelector('#analogous')

let colorBlocks = ['', '', '', '', '']

//********** Color Conversion Functions **********/

//* Returns hexidecimal equivalent to individual rgb element passed in
//* and adds a zero if its a single digit
function colorToHex(color) {
  const hexadecimal = color.toString(16)
  return hexadecimal.length == 1 ? '0' + hexadecimal : hexadecimal
}

//* Returns an array with rgb values as numbers stripping away all non digits
function breakDownRGB(rgbColor) {
  const rgb = rgbColor
    .substring(4, rgbColor.length - 1)
    .replace(/ /g, '')
    .split(',')
  r = Number(rgb[0])
  g = Number(rgb[1])
  b = Number(rgb[2])
  return [r, g, b]
}

//* Returns the full hexidecimal of rgb and adds a '#'
function convertRGBtoHex(rgbColor) {
  const [r, g, b] = breakDownRGB(rgbColor)

  return '#' + colorToHex(r) + colorToHex(g) + colorToHex(b)
}

//* Returns an array with hsl values as numbers stripping away all non digits
function breakDownHSL(hslColor) {
  const hsl = hslColor.replace(/[^\d,]/g, '').split(',') // Remove all non digits
  hue = Number(hsl[0])
  sat = Number(hsl[1])
  light = Number(hsl[2])
  return [hue, sat, light]
}
//* Returns an RGB color from a Hexadecimal color
function convertHexToRGB(hex) {
  let alpha = false,
    h = hex.slice(hex.startsWith('#') ? 1 : 0)
  if (h.length === 3) h = [...h].map(x => x + x).join('')
  else if (h.length === 8) alpha = true
  h = parseInt(h, 16)
  return (
    'rgb' +
    (alpha ? 'a' : '') +
    '(' +
    (h >>> (alpha ? 24 : 16)) +
    ', ' +
    ((h & (alpha ? 0x00ff0000 : 0x00ff00)) >>> (alpha ? 16 : 8)) +
    ', ' +
    ((h & (alpha ? 0x0000ff00 : 0x0000ff)) >>> (alpha ? 8 : 0)) +
    (alpha ? `, ${h & 0x000000ff}` : '') +
    ')'
  )
}

//* Converts rgb to hsl. Returns full hsl(h,s,l)
function convertRGBToHSL(colorBlock) {
  let [red, green, blue] = breakDownRGB(colorBlock)
  red /= 255
  green /= 255
  blue /= 255
  let sat = 0
  let hue
  const min = Math.min(red, green, blue)
  const max = Math.max(red, green, blue)
  let light = (min + max) / 2
  if (!(min === max)) {
    if (light <= 0.5) {
      sat = (max - min) / (max + min)
    } else {
      sat = (max - min) / (2 - max - min)
    }
  }
  if (max === red) {
    hue = (green - blue) / (max - min)
  } else if (max === green) {
    hue = 2 + (blue - red) / (max - min)
  } else {
    hue = 4 + (red - green) / (max - min)
  }
  hue = Math.round(hue * 60)
  sat = Math.round(sat * 100)
  light = Math.round(light * 100)
  return `hsl(${hue}, ${sat}%, ${light}%)`
}

//* Returns full rgb(r,g,b) code from full hsl(h,s,l)
function convertHSLToRGB(colorBlock) {
  breakDownHSL(colorBlock)
  sat /= 100
  light /= 100
  const k = n => (n + hue / 30) % 12
  const a = sat * Math.min(light, 1 - light)
  const f = n =>
    light -
    a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))

  return `rgb(${Math.floor(255 * f(0))}, ${Math.floor(
    255 * f(8)
  )}, ${Math.floor(255 * f(4))})`
}

//* Gets random number between 0 and 255
function getRandomNumber() {
  return Math.floor(Math.random() * 256)
}

//* Gets random number between 0 and 360
function getRandomNumberHue() {
  return Math.floor(Math.random() * 361)
}

//* Gets random number between 0 and 100
function getRandomNumberSat(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

//* Generates an random rgb color
function generateRandomRGB() {
  const rColor = getRandomNumber()
  const gColor = getRandomNumber()
  const bColor = getRandomNumber()
  const rgbColor = `rgb(${rColor}, ${gColor}, ${bColor})`
  return rgbColor
}

//* Generates a random hsl color
function generateRandomHSL() {
  const hue = getRandomNumberHue()
  const sat = getRandomNumberSat(50, 101)
  const light = getRandomNumberSat(50, 100)
  const randomHSL = `hsl(${hue}, ${sat}%, ${light}%)`
  return randomHSL
}

//* Returns an array of colors based on the original hsl
function generatePalette(color, start, end, interval) {
  const colors = [color]
  const [h, s, l] = breakDownHSL(color)

  for (let i = start; i <= end; i += interval) {
    const hue = (h + i) % 360
    const newColor = `hsl(${hue}, ${s}%, ${l}%)`
    colors.push(newColor)
  }
  return colors
}

//* Creates the block of colors to display on screen
function createColorBlock(colorBlock, widthPercent) {
  const hslColorArray = breakDownHSL(colorBlock)
  rgbCode = convertHSLToRGB(colorBlock)
  hexCode = convertRGBtoHex(rgbCode)
  const divElement = document.createElement('div')
  const pRGBElement = document.createElement('p')
  const pHexElement = document.createElement('p')
  const pHSLElement = document.createElement('p')
  divElement.style.backgroundColor = colorBlock
  divElement.style.width = widthPercent
  pRGBElement.textContent = rgbCode
  pHexElement.textContent = hexCode
  pHSLElement.textContent = colorBlock
  colorsContainers.append(divElement)
  divElement.append(pRGBElement, pHexElement, pHSLElement)
}

//* Generates the original spawn color palette with 5 random colors
function spawn() {
  colorsContainers.innerHTML = ''

  colorBlocks.forEach((_colorBlock, index) => {
    colorBlocks[index] = generateRandomHSL()
  })
  colorBlocks.forEach(colorBlock => {
    createColorBlock(colorBlock, '20%')
  })
}

//* Generates the shades palette of 5 shades
function shades() {
  colorsContainers.innerHTML = ''

  const rColor = getRandomNumber()
  const gColor = getRandomNumber()
  const bColor = getRandomNumber()

  colorBlocks.forEach((_colorBlock, index) => {
    colorBlocks[index] =
      'rgb(' +
      Math.round(((index + 1) * rColor) / 5) +
      ',' +
      Math.round(((index + 1) * gColor) / 5) +
      ',' +
      Math.round(((index + 1) * bColor) / 5) +
      ')'
  })

  colorBlocks.reverse()
  colorBlocks.forEach(colorBlock => {
    const hslCode = convertRGBToHSL(colorBlock)
    createColorBlock(hslCode)
  })
}

//* Generates the complementary palette of 2 colors
function complementary() {
  colorsContainers.innerHTML = ''
  compHSL = generateRandomHSL()

  const compPalette = generatePalette(compHSL, 180, 180, 1)

  compPalette.forEach(colorBlock => {
    createColorBlock(colorBlock, '50%')
  })
}
//* Generates the split complementary palette of 3 colors
function split() {
  colorsContainers.innerHTML = ''

  const splitHSL = generateRandomHSL()
  const compPalette = generatePalette(splitHSL, 150, 210, 60)

  compPalette.forEach(colorBlock => {
    createColorBlock(colorBlock, '33.33%', 'hsl')
  })
}

//* Generates the triadic palette of 3 colors one base colour and
//* 2 complementary colors from the opposite side of the color wheel
function triadic() {
  colorsContainers.innerHTML = ''

  const triadicHSL = generateRandomHSL()
  const compPalette = generatePalette(triadicHSL, 120, 240, 120)

  compPalette.forEach(colorBlock => {
    createColorBlock(colorBlock, '33.33%', 'hsl')
  })
}

//* Generates the tetradic palette of 4 colors in a square pattern
//* around the color wheel, each 90 degrees apart
function tetradic() {
  colorsContainers.innerHTML = ''

  const tetradicHSL = generateRandomHSL()
  const compPalette = generatePalette(tetradicHSL, 90, 270, 90)

  compPalette.forEach(colorBlock => {
    createColorBlock(colorBlock, '25%', 'hsl')
  })
}
//* Generates the analogous palette of 5 colors, one base colour and
//* 4 colors from the same area of the color wheel, each 40 degrees apart
function analogous() {
  colorsContainers.innerHTML = ''

  const analogousHSL = generateRandomHSL()
  const compPalette = generatePalette(analogousHSL, 40, 160, 40)

  compPalette.forEach(colorBlock => {
    createColorBlock(colorBlock, '20%', 'hsl')
  })
}

spawn()

//* Event listeners
spawnButton.addEventListener('click', spawn)
shadesButton.addEventListener('click', shades)
shadesButton.addEventListener('keyup', shades)
complementaryButton.addEventListener('click', complementary)
splitButton.addEventListener('click', split)
triadicButton.addEventListener('click', triadic)
tetradicButton.addEventListener('click', tetradic)
analogousButton.addEventListener('click', analogous)
