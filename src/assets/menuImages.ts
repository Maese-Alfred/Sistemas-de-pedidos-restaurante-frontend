import bifeDeChorizo from '@/assets/menu/bife-de-chorizo.jpg'
import cevicheDePescado from '@/assets/menu/ceviche-de-pescado.jpg'
import flanConDulceDeLeche from '@/assets/menu/flan-con-dulce-de-leche.jpg'
import jugoDeMaracuya from '@/assets/menu/jugo-de-maracuya.jpg'
import limonadaDeCoco from '@/assets/menu/limonada-de-coco.jpg'
import limonadaDeLaCasa from '@/assets/menu/limonada-de-la-casa.jpg'
import locroTradicional from '@/assets/menu/locro-tradicional.jpg'
import milanesaNapolitana from '@/assets/menu/milanesa-napolitana.jpg'
import pastaCarbonara from '@/assets/menu/pasta-carbonara.jpg'
import pizzaMargherita from '@/assets/menu/pizza-margherita.jpg'
import provoletaGrillada from '@/assets/menu/provoleta-grillada.jpg'
import salmonALaPlancha from '@/assets/menu/salmon-a-la-plancha.jpg'
import tablaDeFiambres from '@/assets/menu/tabla-de-fiambres.jpg'
import tacosDePollo from '@/assets/menu/tacos-de-pollo.jpg'
import tiramisu from '@/assets/menu/tiramisu.jpg'
import volcanDeChocolate from '@/assets/menu/volcan-de-chocolate.jpg'

const IMAGE_BY_PRODUCT_NAME: Record<string, string> = {
  'pizza margherita': pizzaMargherita,
  'provoleta grillada': provoletaGrillada,
  'bife de chorizo': bifeDeChorizo,
  'ceviche de pescado': cevicheDePescado,
  'tabla de fiambres': tablaDeFiambres,
  'milanesa napolitana': milanesaNapolitana,
  'salmon a la plancha': salmonALaPlancha,
  'pasta carbonara': pastaCarbonara,
  'tacos de pollo': tacosDePollo,
  'locro tradicional': locroTradicional,
  'flan con dulce de leche': flanConDulceDeLeche,
  tiramisu,
  'volcan de chocolate': volcanDeChocolate,
  'limonada de la casa': limonadaDeLaCasa,
  'jugo de maracuya': jugoDeMaracuya,
  'limonada de coco': limonadaDeCoco,
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function getLocalMenuImage(productName?: string) {
  if (!productName) return undefined
  return IMAGE_BY_PRODUCT_NAME[normalize(productName)]
}
